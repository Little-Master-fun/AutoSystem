import type { CarTask } from '@/types'
import type { PortDevice } from './PortDevice.ts'



// 小车控制器类
export class CarController {
  public id: number // 小车ID
  public position: number = 0 // 当前位置（米）
  public speed: number = 0 // 当前速度（米/秒）
  public acceleration: number = 0 // 当前加速度
  public targetSpeed: number = 0 // 目标速度
  public status: 'idle' | 'moving' | 'loading' | 'loaded' | 'unloading' | 'waiting' | 'cruising' =
    'idle' // 当前状态
  public task: CarTask | null = null // 当前任务
  public isCollision: boolean = false // 是否暂停
  public portFrom: PortDevice | null = null
  public portTo: PortDevice | null = null
  public deviceMap: Map<number, PortDevice> // 设备映射表
  private stopPoints: number[] = [] // 停靠点数组
  private currentStopIndex = 0 // 当前停靠点索引
  public hasMaterial: boolean = false // 是否有货
  private scheduler: any // 调度器引用

  // 弯道区间
  private curveRanges: [number, number][] = [
    [0, 9.739],
    [49.739, 59.478],
  ]
  private maxCurveSpeed = 0.67
  private maxStraightSpeed = 2.67

  // 环形轨道总长度（可根据实际轨道长度调整）
  private trackLength = 99.478

  constructor(id: number, deviceMap: Map<number, PortDevice>, initialPosition = 0) {
    this.id = id
    this.deviceMap = deviceMap
    this.position = initialPosition
  }

  // 判断当前位置是否在弯道
  private inCurve(pos: number): boolean {
    return this.curveRanges.some(([start, end]) => pos >= start && pos <= end)
  }

  // 获取下一个弯道的起点距离当前位置的距离（正向）
  private getNextCurveDistance(pos: number): number | null {
    const direction = Math.sign(this.stopPoints[this.currentStopIndex] - pos)
    let minDist: number | null = null
    for (const [start, end] of this.curveRanges) {
      let dist = (start - pos) * direction
      if (dist > 0 && (minDist === null || dist < minDist)) {
        minDist = dist
      }
    }
    return minDist
  }

  // 更新小车状态
  public update(deltaTime: number) {
    // 新增：空闲时自动巡航
    // 巡航时也遵循避障、弯道减速等规则
    if (this.status === 'idle' && !this.task) {
      this.status = 'cruising'
      this.targetSpeed = this.maxStraightSpeed
      // 巡航目标点为当前位置顺时针一圈
      this.stopPoints = [(this.position + this.trackLength) % this.trackLength]
      this.currentStopIndex = 0
      this.updateMotion(deltaTime)
    }

    if (this.status === 'moving' || this.status === 'cruising' || this.status === 'waiting') {
      // 到达目标点且速度为0
      if (this.reachedTarget() && this.speed === 0) {

        if (this.status === 'cruising') {
          // 到达一圈终点后继续巡航
          this.stopPoints = [(this.position + this.trackLength) % this.trackLength]
          this.currentStopIndex = 0
          this.setTarget(this.stopPoints[0])
          this.targetSpeed = this.maxStraightSpeed
          // 保持cruising状态

          return
        }

        const deviceId = this.currentStopIndex === 0 ? this.task?.fromDevice : this.task?.toDevice
        const device = this.deviceMap.get(deviceId!)

        if (!device && !this.task) {
          // 巡航模式：到达终点后状态设为idle
          this.status = 'idle'
          this.targetSpeed = 0
          this.stopPoints = []
          this.currentStopIndex = 0

          return
        }

        if (!device) return

        // STEP 1：装货点检查设备状态和物料ID
        if (this.currentStopIndex === 0) {

          if (device.status === 'full' && device.currentMaterialId === this.task?.materialId) {
            this.status = 'loading'
            // 取走物料
            device.onMaterialTaken()
            setTimeout(() => {
              this.status = 'loaded'
              this.currentStopIndex++
              this.setTarget(this.stopPoints[1])
              this.status = 'moving'
              this.hasMaterial = true
              this.scheduler?.pickUpCargo(this.task?.taskId || 0)
            }, 7500)
          } else {
            // 等设备准备好再装货
            this.status = 'waiting'
          }
        }

        // STEP 2：卸货点是否能接收
        else if (this.currentStopIndex === 1) {
          if (device.status === 'idle') {
            this.status = 'unloading'
            // 卸货时将物料ID放到目标设备
            device.currentMaterialId = this.task?.materialId || null
            setTimeout(() => {
              const materialId = this.task?.materialId || 0
              const taskId = this.task?.taskId || 0
              this.status = 'idle'
              this.task = null
              this.stopPoints = []
              this.currentStopIndex = 0
              // 卸货后自动触发目标设备的下一个任务
              device.onMaterialPlaced(materialId)
              this.hasMaterial = false
              this.scheduler?.dropOffCargo(taskId)
            }, 7500)
          } else {
            this.status = 'waiting'
          }
        }
      } else if (this.status === 'waiting') {
        // waiting状态下，轮询设备状态，满足条件则自动取货/放货
        const deviceId = this.currentStopIndex === 0 ? this.task?.fromDevice : this.task?.toDevice
        const device = this.deviceMap.get(deviceId!)
        if (!device) return

        if (this.currentStopIndex === 0) {
          if (device.status === 'full' && device.currentMaterialId === this.task?.materialId) {
            this.status = 'loading'
            device.onMaterialTaken()
            setTimeout(() => {
              this.status = 'loaded'
              this.currentStopIndex++
              this.setTarget(this.stopPoints[1])
              this.status = 'moving'
              this.hasMaterial = true
              this.scheduler?.pickUpCargo(this.task?.taskId || 0)
            }, 7500)
          }
        } else if (this.currentStopIndex === 1) {
          if (device.status === 'idle') {
            this.status = 'unloading'
            device.currentMaterialId = this.task?.materialId || null
            setTimeout(() => {
              const materialId = this.task?.materialId || 0
              const taskId = this.task?.taskId || 0
              this.status = 'idle'
              this.task = null
              this.stopPoints = []
              this.currentStopIndex = 0
              this.hasMaterial = false
              // 完成任务
              this.scheduler?.dropOffCargo(taskId)
              device.onMaterialPlaced(materialId)
            }, 7500)
          }
        }
      }
      this.updateMotion(deltaTime)
    }
  }

  // 更新小车运动状态
  private updateMotion(dt: number) {
    // 判断当前位置是否在弯道，限制最大速度
    let maxSpeed = this.inCurve(this.position) ? this.maxCurveSpeed : this.maxStraightSpeed

    // 预判刹车距离
    const targetPos = this.stopPoints[this.currentStopIndex]
    // 环形距离
    const distToStop = Math.abs(
      ((targetPos - this.position + this.trackLength / 2) % this.trackLength) -
        this.trackLength / 2,
    )
    const brakingDistance = this.speed ** 2 / (2 * 0.5) // 假设最大减速度为0.5 m/s²
    if (distToStop < brakingDistance) this.targetSpeed = 0

    // 弯道限速提前减速
    if (!this.inCurve(this.position)) {
      // 计算到下一个弯道的距离（环形轨道）
      let minCurveDist: number | null = null
      for (const [start, end] of this.curveRanges) {
        // 只考虑前方的弯道
        let dist = (start - this.position + this.trackLength) % this.trackLength
        if (dist > 0.01) {
          if (minCurveDist === null || dist < minCurveDist) {
            minCurveDist = dist
          }
        }
      }
      if (minCurveDist !== null) {
        const curveBrakingDistance = (this.speed ** 2 - this.maxCurveSpeed ** 2) / (2 * 0.5)
        if (minCurveDist < curveBrakingDistance) {
          // 需要提前减速到弯道限速
          maxSpeed = Math.min(maxSpeed, this.maxCurveSpeed)
        }
      }
    }

    // 加减速控制
    let target = Math.min(this.targetSpeed, maxSpeed)
    if (this.speed < target) {
      this.speed = Math.min(this.speed + 0.5 * dt, target)
      this.acceleration = 0.5
    } else if (this.speed > target) {
      this.speed = Math.max(this.speed - 0.5 * dt, target)
      this.acceleration = -0.5
    } else {
      this.acceleration = 0
    }

    this.position += this.speed * dt // 更新位置

    // 环形轨道处理
    if (this.position >= this.trackLength) {
      this.position -= this.trackLength
    } else if (this.position < 0) {
      this.position += this.trackLength
    }
  }

  // 设置调度器
  public setScheduler(scheduler: any) {
    this.scheduler = scheduler
  }
  // 判断是否到达目标点
  private reachedTarget(): boolean {
    const target = this.stopPoints[this.currentStopIndex]
    // 环形轨道下的距离判断
    const dist = Math.abs(
      ((this.position - target + this.trackLength / 2) % this.trackLength) - this.trackLength / 2,
    )
    return dist < 0.05
  }

  // 设置目标点
  public setTarget(pos: number) {
    this.targetSpeed = this.maxStraightSpeed // 直道最大速度
    this.stopPoints[this.currentStopIndex] = pos
  }

  // 分配任务
  public assignTask(task: CarTask, fromPos: number, toPos: number) {
    this.task = task
    this.stopPoints = [fromPos, toPos]
    this.currentStopIndex = 0
    this.setTarget(fromPos)
    this.status = 'moving'
    this.portFrom = this.deviceMap.get(task.fromDevice)!
    this.portTo = this.deviceMap.get(task.toDevice)!
  }

  // 判断等待是否结束
  public tryResume() {
    if (!this.task || this.status !== 'waiting') return

    const deviceId = this.currentStopIndex === 0 ? this.task.fromDevice : this.task.toDevice
    const device = this.deviceMap.get(deviceId!)
    if (!device) return

    if (this.currentStopIndex === 0 && device.status === 'full') {
    }
    if (this.currentStopIndex === 1 && device.status === 'idle') {
    }
  }
  // 获取显示属性
  public getDisplayProps() {
    return {
      positionInMeters: this.position,
      status: this.status,
    }
  }

  // 获取当前位置
  public getPosition(): number {
    return this.position
  }

  // 获取当前速度
  public getSpeed(): number {
    return this.speed
  }

  // 获取当前状态
  public getStatus(): string {
    return this.status
  }
  // 获取所有信息
  public getAllInfo() {
    return {
      id: this.id,
      position: this.position,
      speed: this.speed,
      acceleration: this.acceleration,
      status: this.status,
      task: this.task,
      portFrom: this.portFrom,
      portTo: this.portTo,
      hasMaterial: this.hasMaterial,
    }
  }
  // 设置目标速度
  public setTargetSpeed(v: number) {
    this.targetSpeed = Math.min(v, this.maxStraightSpeed)
  }

  // 计算与另一辆小车的距离（环形轨道）
  public getDistanceTo(car: CarController, trackLength: number): number {
    return (car.position - this.position + trackLength) % trackLength
  }
  public getMaxStraightSpeed() {
    return this.maxStraightSpeed
  }
}
