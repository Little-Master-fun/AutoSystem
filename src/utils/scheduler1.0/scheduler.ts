import { CarController } from './CarController'
import type { CarTask } from '@/types'
import { PortDevice } from './PortDevice'
import store from '@/store'

type Assignment = {
  car: CarController
  port: PortDevice
  from: number
  arriveTime: number
  finishTime: number
  path: [number, number]
}

export type TaskStatus = 'waiting' | 'in-progress' | 'done'

export interface TaskDetail {
  taskId: number
  materialId: string
  type: string
  fromDevice: number
  toDevice: number
  createTime: number
  startTime: number | null
  carId: number | null
  pickUpTime: number | null
  dropOffTime: number | null
  takenTime: number | null
  status: TaskStatus
  progress: number
}

export class Scheduler {
  private cars: CarController[]
  private taskQueue: CarTask[] = []
  public assignedTasks: Map<number, TaskDetail | number> = new Map()
  private completedTasks: Map<number, TaskDetail> = new Map()
  private trackLength: number
  private readonly carLength: number = 2
  private deviceMap: Map<number, PortDevice> = new Map()
  private virtualClock: number = 0
  private assignedTask: Map<number, number> = new Map()
  public isTasksOver: boolean = false
  private accelerationTime: number = 1

  constructor(cars: CarController[], deviceMap: Map<number, PortDevice>, trackLength: number) {
    this.cars = cars
    this.trackLength = trackLength
    this.deviceMap = deviceMap
  }

  public setAccelerationTime(time: number) { this.accelerationTime = time }
  public getTime(): number { return this.virtualClock }
  public getAccelerationTime(): number { return this.accelerationTime }
  public addTask(task: CarTask) { this.taskQueue.push(task) }

  // 主调度入口
  public update(deltaTime: number) {
    this.virtualClock += deltaTime * this.accelerationTime
    this.assignTasks()
    this.preventCollision()
    this.cars.forEach(car => car.update(deltaTime * this.accelerationTime))
    this.deviceMap.forEach(device => device.update(deltaTime * this.accelerationTime))
  }

  public getVirtualClock(): number { return this.virtualClock }

  // 分配任务到设备
  public assignTasksToDevices() {
    for (const task of this.taskQueue) {
      const device = this.deviceMap.get(Number(task.fromDevice))
      device ? device.addTask(task.materialId) : console.error(`Device ${task.fromDevice} not found`)
    }
  }

  // 分配任务（采用全局最优方法）
  public assignTasks() {
    const readyPorts = Array.from(this.deviceMap.values()).filter(
      port => (port.type === 'inlet' || port.type === 'out-interface') && port.status === 'full'
    )
    const idleCars = this.cars.filter(
      car => (car.getStatus() === 'idle' || car.getStatus() === 'cruising') && !car.task
    )
    if (!readyPorts.length || !idleCars.length) return
    const assignmentPlans = this.generateAllAssignmentCombinations(idleCars, readyPorts, this.trackLength)
    let bestPlan: Assignment[] | null = null, bestScore = Infinity
    for (const plan of assignmentPlans) {
      if (this.hasConflict(plan)) continue
      const totalTime = plan.reduce((sum, a) => sum + a.arriveTime, 0)
      if (totalTime < bestScore) { bestScore = totalTime; bestPlan = plan }
    }
    if (!bestPlan) return
    for (const a of bestPlan) {
      const taskIdx = this.taskQueue.findIndex(t => t.fromDevice === a.port.id)
      if (taskIdx !== -1) {
        const task = this.taskQueue.splice(taskIdx, 1)[0]
        const fromPos = this.deviceToPosition(task.fromDevice)
        const toPos = this.deviceToPosition(task.toDevice)
        a.car.assignTask(task, fromPos, toPos)
        this.assignedTasks.set(Number(task.taskId), {
          taskId: Number(task.taskId),
          materialId: String(task.materialId),
          type: task.type,
          fromDevice: Number(task.fromDevice),
          toDevice: Number(task.toDevice),
          createTime: Number(task.createTime),
          startTime: this.virtualClock,
          carId: a.car.id,
          pickUpTime: null,
          dropOffTime: null,
          takenTime: null,
          status: 'in-progress',
          progress: 0,
        })
        this.assignedTask.set(a.car.id, task.taskId)
      }
    }
  }

  // 跟新任务进度
  public updateTaskProgress(taskId: number, progress: number) {
    const taskDetail = this.assignedTasks.get(taskId) as TaskDetail
    if (taskDetail) {
      taskDetail.progress = progress
      if (progress >= 1) {
        taskDetail.status = 'done'
        taskDetail.takenTime = this.virtualClock
        this.completedTasks.set(taskId, taskDetail)
        this.assignedTasks.delete(taskId)
      }
    }
  }
  // 小车取走物料
  public pickUpCargo(taskId: number) {
    const taskDetail = this.assignedTasks.get(taskId) as TaskDetail
    if (taskDetail) {
      taskDetail.pickUpTime = this.virtualClock
      taskDetail.status = 'in-progress'
    }
  }
  // 小车放下物料
  public dropOffCargo(taskId: number) {
    const taskDetail = this.assignedTasks.get(taskId) as TaskDetail
    if (taskDetail) {
      taskDetail.dropOffTime = this.virtualClock
      taskDetail.status = 'in-progress'
    }
  }
  // 小车取走物料
  public takeCargo(taskId: number) {
    const taskDetail = this.assignedTasks.get(taskId) as TaskDetail
    if (taskDetail) {
      taskDetail.takenTime = this.virtualClock
      taskDetail.status = 'done'
      this.completedTasks.set(taskId, taskDetail)
      this.assignedTasks.delete(taskId)
    }
  }
  // 获取任务进度
  public getTaskProgress(taskId: number): TaskDetail | undefined {
    return this.assignedTasks.get(taskId) as TaskDetail
  }

  // 完成任务
  public completeTask(taskIdOrMaterialId: number | string, byMaterialId = false) {
    let taskDetail: TaskDetail | undefined, taskId: number | undefined
    if (byMaterialId) {
      for (const [id, detail] of this.assignedTasks.entries()) {
        if ((detail as TaskDetail).materialId === taskIdOrMaterialId) {
          taskDetail = detail as TaskDetail; taskId = id; break
        }
      }
    } else {
      if (typeof taskIdOrMaterialId !== 'number') return
      taskDetail = this.assignedTasks.get(taskIdOrMaterialId) as TaskDetail
      taskId = taskIdOrMaterialId
    }
    if (taskDetail && typeof taskId === 'number') {
      taskDetail.status = 'done'
      taskDetail.takenTime = this.virtualClock
      this.completedTasks.set(taskId, taskDetail)
      this.assignedTasks.delete(taskId)
      for (const [key, value] of this.assignedTasks.entries()) {
        if (value === taskId) { this.assignedTasks.delete(key); break }
      }
    }
  }

  // 路径冲突检测
  private isPathConflict(a: Assignment, b: Assignment): boolean {
    const bInAPath = this.isInCircularPath(a.from, a.port.position, b.port.position)
    if (!bInAPath) return false
    const bArrival = b.arriveTime
    const aTimeRange = [a.arriveTime, a.finishTime]
    return bArrival >= aTimeRange[0] && bArrival <= aTimeRange[1]
  }

  private isInCircularPath(from: number, to: number, pos: number): boolean {
    return from <= to ? pos > from && pos <= to : pos > from || pos <= to
  }
  // 检测是否有冲突
  private hasConflict(assignments: Assignment[]): boolean {
    for (let i = 0; i < assignments.length; i++)
      for (let j = i + 1; j < assignments.length; j++)
        if (this.isPathConflict(assignments[i], assignments[j])) return true
    return false
  }

  // 生成所有组合
  private generateAllAssignmentCombinations(
    cars: CarController[], ports: PortDevice[], trackLength: number, pickTime: number = 5
  ): Assignment[][] {
    const results: Assignment[][] = [], usedPorts = new Set<number>()
    function backtrack(index: number, current: Assignment[]) {
      if (index === cars.length || index === ports.length) { results.push([...current]); return }
      for (let i = 0; i < ports.length; i++) {
        const port = ports[i]
        if (usedPorts.has(port.id)) continue
        const car = cars[index], from = car.getPosition(), to = port.position
        const dist = (to - from + trackLength) % trackLength
        const speed = car['maxStraightSpeed'] || 2.67
        const arriveTime = dist / speed, finishTime = arriveTime + pickTime
        current.push({ car, port, from, arriveTime, finishTime, path: [from, to] })
        usedPorts.add(port.id)
        backtrack(index + 1, current)
        current.pop()
        usedPorts.delete(port.id)
      }
    }
    backtrack(0, [])
    return results
  }

  public getAssignedTasks(): TaskDetail[] {
    return Array.from(this.assignedTasks.values()).filter(
      (v): v is TaskDetail => typeof v === 'object' && v !== null && 'taskId' in v
    )
  }
  public getCompletedTasks(): TaskDetail[] { return Array.from(this.completedTasks.values()) }


  // 防碰撞机制
  private preventCollision() {
    const sorted = [...this.cars].sort((a, b) => a.getPosition() - b.getPosition()), n = sorted.length
    if (n <= 1) return
    for (let i = 0; i < n; i++) {
      const car = sorted[i], front = sorted[(i + 1) % n]
      const distance = car.getDistanceTo(front, this.trackLength)
      const brakingDist = car.getSpeed() ** 2 / (2 * 0.5)
      const safeDist = this.carLength + 0.2
      if (car.status === 'moving' || car.status === 'cruising') {
        if (distance < safeDist + brakingDist) {
          if (front.status !== 'moving' && front.status !== 'cruising') {
            if (car.targetSpeed !== 0 || !car.isCollision) {
              car.setTargetSpeed(0)
              car.isCollision = true
            }
          } else {
            const newSpeed = Math.min(car.getSpeed(), front.getSpeed())
            if (car.targetSpeed !== newSpeed) {
              car.setTargetSpeed(newSpeed)
              car.isCollision = true
            }
          }
        } else if (car.isCollision && car.targetSpeed !== car.getMaxStraightSpeed()) {
          car.setTargetSpeed(car.getMaxStraightSpeed())
          car.isCollision = false
        }
      }
    }
  }

  // 小车速度时间表
  public getCarsSpeedTimeline() {
    return {
      time: this.virtualClock,
      cars: this.cars.map(car => ({
        carId: car.id,
        speed: car.getSpeed(),
        status: car.getStatus(),
      })),
    }
  }

  // 获取已完成任务
  public getCompletedTaskDetails() {
    return Array.from(this.completedTasks.values()).map(task => ({
      taskId: task.taskId,
      materialId: task.materialId,
      type: task.type,
      fromDevice: task.fromDevice,
      toDevice: task.toDevice,
      createTime: task.createTime,
      startTime: task.startTime,
      carId: task.carId,
      pickUpTime: task.pickUpTime,
      dropOffTime: task.dropOffTime,
      takenTime: task.takenTime,
      status: task.status,
    }))
  }

  // 计算到达目标位置时间
  private calculateTimeToTarget(car: CarController, targetPos: number): number {
    const distance = (targetPos - car.getPosition() + this.trackLength) % this.trackLength
    const speed = car.getSpeed()
    return distance / speed + this.accelerationTime
  }

  // 输出任务详细
  public getTaskDetails() {
    return this.taskQueue.map(task => ({
      taskId: task.taskId,
      fromDevice: task.fromDevice,
      toDevice: task.toDevice,
      createTime: task.createTime,
      type: task.type,
      progress: (() => {
        const car = this.cars.find(c => c.task?.taskId === task.taskId)
        if (!car) return 0
        const fromPos = this.deviceToPosition(task.fromDevice)
        const toPos = this.deviceToPosition(task.toDevice)
        const totalDist = (toPos - fromPos + this.trackLength) % this.trackLength
        const carPos = car.getPosition()
        const traveled = (carPos - fromPos + this.trackLength) % this.trackLength
        return totalDist === 0 ? 1 : Math.min(traveled / totalDist, 1)
      })(),
    }))
  }

  // 检测是否结束
  public checkIfAllTasksDone(): boolean {
    const allCarsIdle = this.cars.every(
      car => (car.getStatus() === 'idle' || car.getStatus() === 'cruising') && !car.task
    )
    const allDevicesIdle = Array.from(this.deviceMap.values()).every(
      device => device.status === 'idle' || device.status === 'empty'
    )
    const allTasksDone = this.taskQueue.length === 0 && this.assignedTasks.size === 0
    if (allTasksDone && allCarsIdle && allDevicesIdle) {
      this.isTasksOver = true
      return true
    }
    return false
  }

  // 设备编号 → 轨道坐标映射
  private deviceToPosition(deviceId: number): number {
    const map: Record<number, number> = {
      1: 13.54, 2: 15.94, 3: 19.54, 4: 21.93, 5: 25.54, 6: 27.93, 7: 31.53, 8: 33.93,
      9: 37.54, 10: 39.93, 11: 43.54, 12: 45.93, 13: 67.47, 14: 70.47, 15: 73.47,
      16: 85.47, 17: 88.47, 18: 91.47,
    }
    return map[deviceId] ?? 0
  }
}
