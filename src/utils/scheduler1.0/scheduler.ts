import { CarController } from './CarController'
import type { CarTask } from '@/types'
import { PortDevice } from './PortDevice'

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
  taskId: string
  fromDevice: number
  toDevice: number
  createTime: number
  startTime: number | null
  endTime: number | null
  assignedCarId: number | null
  status: TaskStatus
  progress: number
}

export class Scheduler {
  private cars: CarController[]
  private taskQueue: CarTask[] = []
  private trackLength: number
  private readonly carLength: number = 2
  private deviceMap: Map<number, PortDevice> = new Map()
  private virtualClock: number = 0 // 虚拟时钟

  // 新增：加速时间（单位：秒）
  private accelerationTime: number = 0

  constructor(cars: CarController[], deviceMap: Map<number, PortDevice>, trackLength: number) {
    this.cars = cars
    this.trackLength = trackLength
    console.log(`轨道长度：${this.trackLength}`);
    
    this.deviceMap = deviceMap
  }

  // 设置加速时间
  public setAccelerationTime(time: number) {
    this.accelerationTime = time
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
    this.virtualClock += deltaTime // 更新虚拟时钟
    this.assignTasks()
    this.preventCollision()
    this.cars.forEach((car) => car.update(deltaTime))
    this.deviceMap.forEach((device) => device.update(deltaTime))
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
  // 分配任务给空闲小车，采用全局最优匹配（贪心最短总时间）
  // private assignTasks() {
  //   // 1. 找出所有ready的上货口（如 inlet、out-interface，且 status === 'full'）
  //   const readyPorts = Array.from(this.deviceMap.values()).filter(
  //     (port) => (port.type === 'inlet' || port.type === 'out-interface') && port.status === 'full',
  //   )
  //   // 2. 找出所有空闲小车
  //   const idleCars = this.cars.filter((car) => car.getStatus() === 'idle' && !car.task)
  //   // 3. 记录已分配的小车和口
  //   const assignedCars = new Set<CarController>()
  //   const assignedPorts = new Set<number>()
  //   // 4. 生成所有小车-口的预计到达时间对
  //   type Pair = { car: CarController; port: PortDevice; time: number }
  //   const pairs: Pair[] = []
  //   for (const car of idleCars) {
  //     for (const port of readyPorts) {
  //       // 预计到达时间 = 距离 / 最大速度
  //       const dist = (port.position - car.getPosition() + this.trackLength) % this.trackLength
  //       const time = dist / (car['maxStraightSpeed'] || 2.67)
  //       pairs.push({ car, port, time })
  //     }
  //   }
  //   // 5. 贪心分配：每次选全局最短时间的未分配小车-口对
  //   while (pairs.length > 0) {
  //     // 找到time最小的对
  //     pairs.sort((a, b) => a.time - b.time)
  //     const best = pairs.shift()!
  //     if (assignedCars.has(best.car) || assignedPorts.has(best.port.id)) continue
  //     // 找到任务队列中以该口为fromDevice的任务
  //     const taskIdx = this.taskQueue.findIndex(
  //       (t) => t.fromDevice === best.port.id && !assignedPorts.has(best.port.id),
  //     )
  //     if (taskIdx !== -1) {
  //       const task = this.taskQueue.splice(taskIdx, 1)[0]
  //       const fromPos = this.deviceToPosition(task.fromDevice)
  //       const toPos = this.deviceToPosition(task.toDevice)
  //       best.car.assignTask(task, fromPos, toPos)
  //       assignedCars.add(best.car)
  //       assignedPorts.add(best.port.id)
  //       // 移除所有与已分配小车或口相关的pair
  //       for (let i = pairs.length - 1; i >= 0; i--) {
  //         if (pairs[i].car === best.car || pairs[i].port.id === best.port.id) {
  //           pairs.splice(i, 1)
  //         }
  //       }
  //       console.log(
  //         `分配任务：小车${best.car.id} 执行任务${task.taskId}，从${task.fromDevice}到${task.toDevice}`,
  //       )
  //     }
  //   }
  //   // 其余空闲小车自动巡航
  // }
  // private assignTasks() {
  //   const readyPorts = Array.from(this.deviceMap.values()).filter(
  //     (port) => (port.type === 'inlet' || port.type === 'out-interface') && port.status === 'full',
  //   )

  //   const idleCars = this.cars.filter(
  //     (car) => car.getStatus() === 'idle' || car.getStatus() === 'cruising',
  //   )
  //   console.log(`空闲小车数量：${idleCars.length}，准备上货口数量：${readyPorts.length}`)

  //   if (readyPorts.length === 0 || idleCars.length === 0) return

  //   const pickTime = 5 // 小车取货时间
  //   const pairs: {
  //     car: CarController
  //     port: PortDevice
  //     dist: number
  //     arriveTime: number
  //     path: [number, number]
  //   }[] = []

  //   // 构造所有 car-port 的 pair
  //   for (const car of idleCars) {
  //     for (const port of readyPorts) {
  //       const start = car.getPosition()
  //       const end = port.position
  //       const dist = (end - start + this.trackLength) % this.trackLength
  //       const arriveTime = dist / (car['maxStraightSpeed'] || 2.67)
  //       pairs.push({ car, port, dist, arriveTime, path: [start, end] })
  //     }
  //   }

  //   const assignedCars = new Set<CarController>()
  //   const assignedPorts = new Set<number>()
  //   const assignments: typeof pairs = []

  //   while (pairs.length > 0) {
  //     // 计算每个 pair 的冲突分数
  //     for (const pair of pairs) {
  //       let conflictPenalty = 0
  //       for (const existing of assignments) {
  //         if (this.detectConflict(pair, existing, pickTime)) {
  //           conflictPenalty += 1000 // 冲突惩罚，可调整
  //         }
  //       }
  //       ;(pair as any).score = pair.arriveTime + conflictPenalty
  //     }

  //     // 找得分最小的 pair（尽量避开冲突）
  //     pairs.sort((a, b) => (a as any).score - (b as any).score)
  //     const best = pairs.shift()!

  //     // 如果小车或口已分配，则跳过
  //     if (assignedCars.has(best.car) || assignedPorts.has(best.port.id)) continue
  //     // 找到任务队列中以该口为 fromDevice 的任务
  //     const taskIdx = this.taskQueue.findIndex((t) => t.fromDevice === best.port.id)

  //     if (taskIdx !== -1) {
  //       const task = this.taskQueue.splice(taskIdx, 1)[0]
  //       const fromPos = this.deviceToPosition(task.fromDevice)
  //       const toPos = this.deviceToPosition(task.toDevice)
  //       best.car.assignTask(task, fromPos, toPos)
  //       assignedCars.add(best.car)
  //       assignedPorts.add(best.port.id)
  //       assignments.push(best)

  //       console.log(
  //         `✅ 分配任务：小车${best.car.id} 执行任务${task.taskId}，从${task.fromDevice}到${task.toDevice}`,
  //       )
  //     }

  //     // 移除与已分配小车或口相关的 pair
  //     for (let i = pairs.length - 1; i >= 0; i--) {
  //       if (pairs[i].car === best.car || pairs[i].port.id === best.port.id) {
  //         pairs.splice(i, 1)
  //       }
  //     }
  //   }
  // }

  // // 检查小车之间是否存在冲突
  // private detectConflict(
  //   a: { path: [number, number]; arriveTime: number },
  //   b: { path: [number, number]; arriveTime: number },
  //   pickTime: number,
  // ): boolean {
  //   // 时间段重叠
  //   const aTimeRange = [a.arriveTime, a.arriveTime + pickTime]
  //   const bTimeRange = [b.arriveTime, b.arriveTime + pickTime]
  //   const timeOverlap = !(aTimeRange[1] <= bTimeRange[0] || bTimeRange[1] <= aTimeRange[0])

  //   if (!timeOverlap) return false

  //   // 路径重叠（环形判断）
  //   const isOverlap = this.isRangeOverlap(a.path[0], a.path[1], b.path[0], b.path[1])
  //   return isOverlap
  // }

  // 判断时间区间是否重叠

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

      // 评分：可以用总到达时间，也可以加入优先级、路径长度等
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
        console.log(
          `✅ 分配任务：小车${a.car.id} 执行任务${task.taskId}，从${task.fromDevice}到${task.toDevice}`,
        )
      }
    }
  }

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
              console.log(`小车${car.id} 减速，前车${front.id} 状态：${front.status} 距离：${distance}`)
            }
          } 
          else {
            // 前车也在移动，后车减速到不超过前车速度
            const newSpeed = Math.min(car.getSpeed(), front.getSpeed())
            if (car.targetSpeed !== newSpeed) {
              car.setTargetSpeed(newSpeed)
              car.isCollision = true
              console.log(`小车${car.id} 跟车减速，前车${front.id} 状态：${front.status} 距离：${distance}`)
            }
          }
        } else {
          // 距离安全，恢复正常速度（仅在之前因碰撞减速过才恢复）
          if (car.isCollision && car.targetSpeed !== car.getMaxStraightSpeed()) {
            car.setTargetSpeed(car.getMaxStraightSpeed())
            car.isCollision = false
            console.log(`小车${car.id} 恢复正常速度`)
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

  // 计算小车到达目标位置的时间（考虑加速时间）
  private calculateTimeToTarget(car: CarController, targetPos: number): number {
    // 直接计算当前位置到目标位置的距离
    const distance = (targetPos - car.getPosition() + this.trackLength) % this.trackLength
    const speed = car.getSpeed()
    // 如果有加速时间，先加上加速时间
    const time = distance / speed + this.accelerationTime
    return time
  }

  // 输出任务详细
  public getTaskDetails() {
    return this.taskQueue.map((task) => ({
      taskId: task.taskId,
      fromDevice: task.fromDevice,
      toDevice: task.toDevice,
      createTime: task.createTime,
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
