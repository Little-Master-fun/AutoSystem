import { CarController } from './CarController.ts'
import type { CarTask } from '@/types'
import { PortDevice } from './PortDevice.ts'

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
  // 分配任务给空闲小车
  private assignTasks() {
    for (const car of this.cars) {
      if (car.getStatus() === 'idle' && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift()!
        // const portFrom = this.deviceMap.get(task.fromDevice)!
        // const portTo = this.deviceMap.get(task.toDevice)!
        // portFrom.addTask(task.materialId)
        const fromPos = this.deviceToPosition(task.fromDevice)
        const toPos = this.deviceToPosition(task.toDevice)
        console.log(`分配任务：小车 ${car.id} 执行任务 ${task.taskId}，从 ${task.fromDevice} 到 ${task.toDevice}`);
        
        car.assignTask(task, fromPos, toPos)
      }
    }
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
      if (
        (car.status === 'moving' || car.status === 'cruising') &&
        distance < safeDist + brakingDist
      ) {
        // 如果前车是等待/装卸/加载等非移动状态，后车提前减速
        if (front.status !== 'moving' && front.status !== 'cruising') {
          car.setTargetSpeed(0)
          console.log(`小车 ${car.id} 减速到 0，前车 ${front.id} 状态：${front.status}`);
          
        } else {
          // 前车也在移动，后车减速到安全速度
          car.setTargetSpeed(Math.min(car.getSpeed(), front.getSpeed()))
          console.log(`小车 ${car.id} 减速到 ${car.speed}，前车 ${front.id} 状态：${front.status}`);
          
        }
      } else {
        // 距离安全，恢复正常速度
        car.setTargetSpeed(car['maxStraightSpeed'] || 2.67)
        
      }
    }
  }

  /**
   * 检查所有任务是否已完成，如果已完成则停止所有小车
   */
  public checkAndStopIfAllTasksDone() {
    const allCarsIdle = this.cars.every(car => car.getStatus() === 'idle' && !car.task);
    const noPendingTasks = this.taskQueue.length === 0;
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
