import { CarController } from './CarController'
import type { CarTask } from '@/types'
import { PortDevice } from './PortDevice'
import store from '@/store'

type Assignment = {
  car: CarController
  port: PortDevice
  from: number // car 的当前位置
  arriveTime: number // 抵达 port 所需时间
  finishTime: number // 抵达后 + 取货时间
  path: [number, number] // 轨道路径段 [from → port]
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
  pickUpTime: number | null // 取货完成时间
  dropOffTime: number | null // 放货完成时间
  takenTime: number | null // 货物取走时间
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
  private virtualClock: number = 0 // 虚拟时钟
  private assignedTask: Map<number, number> = new Map() // 以 carId 为 key 的任务 ID 映射
  public isTasksOver: boolean = false // 是否任务结束

  // 新增：加速时间（单位：秒）
  private accelerationTime: number = 1

  constructor(cars: CarController[], deviceMap: Map<number, PortDevice>, trackLength: number) {
    this.cars = cars
    this.trackLength = trackLength

    this.deviceMap = deviceMap
  }

  // 设置加速时间
  public setAccelerationTime(time: number) {
    this.accelerationTime = time
  }

  // 获取时间
  public getTime(): number {
    return this.virtualClock
  }
  // 获取加速时间
  public getAccelerationTime(): number {
    return this.accelerationTime
  }

  // 添加任务到调度器
  public addTask(task: CarTask) {
    this.taskQueue.push(task)
  }

  // 主调度入口：每帧调用一次
  public update(deltaTime: number) {
    this.virtualClock += deltaTime * this.accelerationTime // 更新虚拟时钟
    this.assignTasks()
    this.preventCollision()
    this.cars.forEach((car) => car.update(deltaTime * this.accelerationTime))
    this.deviceMap.forEach((device) => device.update(deltaTime * this.accelerationTime))
  }

  // 获取当前虚拟时钟
  public getVirtualClock(): number {
    return this.virtualClock
  }
  // 分配任务给站点
  // 将任务队列中的 fromDevice 和物料编号分配到对应设备
  public assignTasksToDevices() {
    for (const task of this.taskQueue) {
      const device = this.deviceMap.get(Number(task.fromDevice))

      if (device) {
        device.addTask(task.materialId)
      } else {
        console.error(`Device ${task.fromDevice} not found`)
      }
    }
  }

  public assignTasks() {
    const readyPorts = Array.from(this.deviceMap.values()).filter(
      (port) => (port.type === 'inlet' || port.type === 'out-interface') && port.status === 'full',
    )
    const idleCars = this.cars.filter(
      (car) => (car.getStatus() === 'idle' || car.getStatus() === 'cruising') && !car.task,
    )
    if (readyPorts.length === 0 || idleCars.length === 0) return

    const assignmentPlans = this.generateAllAssignmentCombinations(
      idleCars,
      readyPorts,
      this.trackLength,
    )
    let bestPlan: Assignment[] | null = null
    let bestScore = Infinity

    for (const plan of assignmentPlans) {
      if (this.hasConflict(plan)) continue

      // 评分,用总到达时间
      const totalTime = plan.reduce((sum, a) => sum + a.arriveTime, 0)
      if (totalTime < bestScore) {
        bestScore = totalTime
        bestPlan = plan
      }
    }

    if (!bestPlan) return

    // 进行任务分配
    for (const a of bestPlan) {
      const taskIdx = this.taskQueue.findIndex((t) => t.fromDevice === a.port.id)
      if (taskIdx !== -1) {
        const task = this.taskQueue.splice(taskIdx, 1)[0]
        const fromPos = this.deviceToPosition(task.fromDevice)
        const toPos = this.deviceToPosition(task.toDevice)
        a.car.assignTask(task, fromPos, toPos)
        const taskId = this.assignedTask.get(a.car.id)
        // if (typeof taskId === 'number') {
        //   this.completeTask(taskId)
        // }
        // 记录任务分配（用 assignedTasks 以 carId 为 key 也存一份）
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
        // 新增：以 carId 为 key 也存一份 taskId，便于通过 carId 查找任务
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

  // 拿取货物
  public pickUpCargo(taskId: number) {
    const taskDetail = this.assignedTasks.get(taskId) as TaskDetail
    if (taskDetail) {
      taskDetail.pickUpTime = this.virtualClock
      taskDetail.status = 'in-progress'
    }
  }

  // 放置货物
  public dropOffCargo(taskId: number) {
    const taskDetail = this.assignedTasks.get(taskId) as TaskDetail
    if (taskDetail) {
      taskDetail.dropOffTime = this.virtualClock
      taskDetail.status = 'in-progress'
    }
  }

  // 取走货物
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
  // 通过任务ID或物料ID完成任务
  public completeTask(taskIdOrMaterialId: number | string, byMaterialId = false) {
    let taskDetail: TaskDetail | undefined
    let taskId: number | undefined

    if (byMaterialId) {
      // 通过物料ID查找任务
      for (const [id, detail] of this.assignedTasks.entries()) {
        if ((detail as TaskDetail).materialId === taskIdOrMaterialId) {
          taskDetail = detail as TaskDetail
          taskId = id
          console.log('reach');
          
          break
        }
      }
    } else {
      // 通过任务ID查找
      if (typeof taskIdOrMaterialId !== 'number') return

      taskDetail = this.assignedTasks.get(taskIdOrMaterialId) as TaskDetail
      taskId = taskIdOrMaterialId
    }

    if (taskDetail && typeof taskId === 'number') {
      taskDetail.status = 'done'
      taskDetail.takenTime = this.virtualClock
      this.completedTasks.set(taskId, taskDetail)
      this.assignedTasks.delete(taskId)
      // 反查 carId 记录也一并删除
      for (const [key, value] of this.assignedTasks.entries()) {
        if (value === taskId) {
          this.assignedTasks.delete(key)
          break
        }
      }
    }
  }

  // 判断两个小车的路径是否冲突
  private isPathConflict(a: Assignment, b: Assignment): boolean {
    // 1. 判断 b.port.position 是否在 a.car 路径 [a.from → a.port] 中
    const bInAPath = this.isInCircularPath(a.from, a.port.position, b.port.position)

    if (!bInAPath) return false

    // 2. 判断时间是否重叠（A 的到达 → 完成区间 包含 B 的到达）
    const bArrival = b.arriveTime
    const aTimeRange = [a.arriveTime, a.finishTime]

    const timeOverlap = bArrival >= aTimeRange[0] && bArrival <= aTimeRange[1]

    return timeOverlap
  }

  private isInCircularPath(from: number, to: number, pos: number): boolean {
    if (from <= to) return pos > from && pos <= to
    return pos > from || pos <= to
  }

  // 判断两个区间是否重叠（环形轨道）
  private hasConflict(assignments: Assignment[]): boolean {
    for (let i = 0; i < assignments.length; i++) {
      for (let j = i + 1; j < assignments.length; j++) {
        const a = assignments[i]
        const b = assignments[j]

        if (this.isPathConflict(a, b)) return true
      }
    }
    return false
  }

  // 生成所有组合
  private generateAllAssignmentCombinations(
    cars: CarController[],
    ports: PortDevice[],
    trackLength: number,
    pickTime: number = 5,
  ): Assignment[][] {
    const results: Assignment[][] = []
    const usedPorts = new Set<number>()

    function backtrack(index: number, current: Assignment[]) {
      if (index === cars.length || index === ports.length) {
        results.push([...current])
        return
      }

      for (let i = 0; i < ports.length; i++) {
        const port = ports[i]
        if (usedPorts.has(port.id)) continue

        const car = cars[index]
        const from = car.getPosition()
        const to = port.position
        const dist = (to - from + trackLength) % trackLength
        const speed = car['maxStraightSpeed'] || 2.67
        const arriveTime = dist / speed
        const finishTime = arriveTime + pickTime

        current.push({
          car,
          port,
          from,
          arriveTime,
          finishTime,
          path: [from, to],
        })

        usedPorts.add(port.id)
        backtrack(index + 1, current)
        current.pop()
        usedPorts.delete(port.id)
      }
    }

    backtrack(0, [])
    return results
  }

  //获取已分配任务
  public getAssignedTasks(): TaskDetail[] {
    return Array.from(this.assignedTasks.values()).filter(
      (v): v is TaskDetail => typeof v === 'object' && v !== null && 'taskId' in v,
    )
  }
  // 获取已完成任务
  public getCompletedTasks(): TaskDetail[] {
    return Array.from(this.completedTasks.values())
  }

  private isRangeOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
    const inRange = (pos: number, from: number, to: number): boolean => {
      if (from <= to) return pos >= from && pos <= to
      return pos >= from || pos <= to
    }

    return (
      inRange(bStart, aStart, aEnd) ||
      inRange(bEnd, aStart, aEnd) ||
      inRange(aStart, bStart, bEnd) ||
      inRange(aEnd, bStart, bEnd)
    )
  }
  // 简单防碰撞机制：按顺序判断距离，提前减速（考虑小车长度）
  private preventCollision() {
    const sorted = [...this.cars].sort((a, b) => a.getPosition() - b.getPosition())
    const n = sorted.length
    if (n <= 1) return

    for (let i = 0; i < n; i++) {
      const car = sorted[i]
      const front = sorted[(i + 1) % n]
      const distance = car.getDistanceTo(front, this.trackLength)
      const brakingDist = car.getSpeed() ** 2 / (2 * 0.5) // 假设减速度为0.5
      const safeDist = this.carLength + 0.2 // 小车长度+安全距离

      // 优化：只有在 moving/cruising 状态下才主动避障，等待/装卸时不主动减速
      // 仅在 moving/cruising 状态下考虑防碰撞
      if (car.status === 'moving' || car.status === 'cruising') {
        if (distance < safeDist + brakingDist) {
          // 前车非移动状态，后车需停车
          if (front.status !== 'moving' && front.status !== 'cruising') {
            if (car.targetSpeed !== 0 || !car.isCollision) {
              car.setTargetSpeed(0)
              car.isCollision = true
            }
          } else {
            // 前车也在移动，后车减速到不超过前车速度
            const newSpeed = Math.min(car.getSpeed(), front.getSpeed())
            if (car.targetSpeed !== newSpeed) {
              car.setTargetSpeed(newSpeed)
              car.isCollision = true
            }
          }
        } else {
          // 距离安全，恢复正常速度（仅在之前因碰撞减速过才恢复）
          if (car.isCollision && car.targetSpeed !== car.getMaxStraightSpeed()) {
            car.setTargetSpeed(car.getMaxStraightSpeed())
            car.isCollision = false
          }
        }
      }
    }
  }

  /**
   * 检查所有任务是否已完成，如果已完成则停止所有小车
   */
  public checkAndStopIfAllTasksDone() {
    const allCarsIdle = this.cars.every((car) => car.getStatus() === 'idle' && !car.task)
    const noPendingTasks = this.taskQueue.length === 0
    // if (allCarsIdle && noPendingTasks) {
    //   this.cars.forEach(car => car.stop && car.stop());
    // }
  }

  // 返回小车的速度时间表
  public getCarsSpeedTimeline() {
    return {
      time: this.virtualClock,
      cars: this.cars.map((car) => ({
        carId: car.id,
        speed: car.getSpeed(),
        status: car.getStatus(),
      })),
    }
  }

  // 获取已完成任务
  public getCompletedTaskDetails() {
    return Array.from(this.completedTasks.values()).map((task) => ({
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
  // 计算小车到达目标位置的时间（考虑加速时间）
  private calculateTimeToTarget(car: CarController, targetPos: number): number {
    // 直接计算当前位置到目标位置的距离
    const distance = (targetPos - car.getPosition() + this.trackLength) % this.trackLength
    const speed = car.getSpeed()
    // 如果有加速时间，先加上加速时间
    const time = distance / speed + this.accelerationTime
    return time
  }

  // 输出任务详细（增加任务类型 type 字段）
  public getTaskDetails() {
    return this.taskQueue.map((task) => ({
      taskId: task.taskId,
      fromDevice: task.fromDevice,
      toDevice: task.toDevice,
      createTime: task.createTime,
      type: task.type, // 新增任务类型
      progress: (() => {
        const car = this.cars.find((c) => c.task?.taskId === task.taskId)
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
      (car) => (car.getStatus() === 'idle' || car.getStatus() === 'cruising') && !car.task,
    )
    const allDevicesIdle = Array.from(this.deviceMap.values()).every(
      (device) => device.status === 'idle' || device.status === 'empty',
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
      1: 13.54,
      2: 15.94,
      3: 19.54,
      4: 21.93,
      5: 25.54,
      6: 27.93,
      7: 31.53,
      8: 33.93,
      9: 37.54,
      10: 39.93,
      11: 43.54,
      12: 45.93,
      13: 67.47,
      14: 70.47,
      15: 73.47,
      16: 85.47,
      17: 88.47,
      18: 91.47,
    }
    return map[deviceId] ?? 0
  }
}
