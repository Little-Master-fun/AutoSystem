import { CarController } from './CarController.ts'
import type { CarTask } from '@/types'
import {PortDevice} from './PortDevice.ts'

export class Scheduler {
  private cars: CarController[]
  private taskQueue: CarTask[] = []
  private trackLength: number
  private readonly carLength: number = 2
  private deviceMap: Map<number, PortDevice> = new Map()

  constructor(cars: CarController[], deviceMap:Map<number, PortDevice> , trackLength: number) {
    this.cars = cars
    this.trackLength = trackLength
    this.deviceMap = deviceMap
  }

  // 添加任务到调度器
  public addTask(task: CarTask) {
    this.taskQueue.push(task)
  }

  // 主调度入口：每帧调用一次
  public update(deltaTime: number) {
    this.assignTasks()
    this.preventCollision()
    this.cars.forEach((car) => car.update(deltaTime))
    this.deviceMap.forEach((device) => device.update(deltaTime))
  }

  // 分配任务给空闲小车
  private assignTasks() {
    for (const car of this.cars) {
      if (car.getStatus() === 'idle' && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift()!
        const fromPos = this.deviceToPosition(task.fromDevice)
        const toPos = this.deviceToPosition(task.toDevice)
        car.assignTask(task, fromPos, toPos)
      }
    }
  }

  // 简单防碰撞机制：按顺序判断距离，提前减速（考虑小车长度）
  private preventCollision() {
    const sorted = [...this.cars].sort((a, b) => a.getPosition() - b.getPosition())
    const n = sorted.length

    if (n <= 1) {
      return
    }

    for (let i = 0; i < n; i++) {
      const car = sorted[i]
      const front = sorted[(i + 1) % n]

      const distance = car.getDistanceTo(front, this.trackLength)
      const brakingDist = car.getSpeed() ** 2 / (2 * 0.5)

    }
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
