import type { CarTask } from '@/types'
import type { PortDevice } from './PortDevice.ts'
import store from '@/store'

type CarStatus = 'idle' | 'moving' | 'loading' | 'loaded' | 'unloading' | 'waiting' | 'cruising'

export class CarController {
  public id: number
  public position = 0
  public speed = 0
  public acceleration = 0
  public targetSpeed = 0
  public status: CarStatus = 'idle'
  public task: CarTask | null = null
  public isCollision = false
  public portFrom: PortDevice | null = null
  public portTo: PortDevice | null = null
  public deviceMap: Map<number, PortDevice>
  private stopPoints: number[] = []
  private currentStopIndex = 0
  public hasMaterial = false
  private scheduler: any
  public addCarSpeedTable: (value: any) => void = () => {}

  private curveRanges: [number, number][] = [[0, 9.739], [49.739, 59.478]]
  private maxCurveSpeed = 0.67
  private maxStraightSpeed = 2.67
  private trackLength = 99.478
  private loadingTimer = 0
  private unloadingTimer = 0
  private loadingDuration = 7.5
  private unloadingDuration = 7.5

  constructor(id: number, deviceMap: Map<number, PortDevice>, initialPosition = 0) {
    this.id = id
    this.deviceMap = deviceMap
    this.position = initialPosition
  }

  private inCurve(pos: number) {
    return this.curveRanges.some(([s, e]) => pos >= s && pos <= e)
  }

  public update(dt: number) {
    if (this.status === 'idle' && !this.task) {
      this.status = 'cruising'
      this.targetSpeed = this.maxStraightSpeed
      this.stopPoints = [(this.position + this.trackLength) % this.trackLength]
      this.currentStopIndex = 0
      this.updateMotion(dt)
    }
    if (this.status === 'loading') {
      this.loadingTimer += dt
      if (this.loadingTimer >= this.loadingDuration) {
        this.loadingTimer = 0
        this.status = 'loaded'
        this.currentStopIndex++
        this.setTarget(this.stopPoints[1])
        this.status = 'moving'
        this.hasMaterial = true
        store.commit('addDeviceChangeStatus',{
          devicename: '穿梭车',
          deviceId: this.id || '',
          materialId: (this.task as CarTask)?.materialId || '',
          status: '无货->有货',
          timestamp: Math.round(this.scheduler?.getTime() || 0)
        })
        this.scheduler?.pickUpCargo(this.task?.taskId || 0)
      }
      return
    }
    if (this.status === 'unloading') {
      this.unloadingTimer += dt
      if (this.unloadingTimer >= this.unloadingDuration) {
        this.unloadingTimer = 0
        const materialId = this.task?.materialId || 0
        const taskId = this.task?.taskId || 0
        this.status = 'idle'
        this.task = null
        this.stopPoints = []
        this.currentStopIndex = 0
        if (this.portTo) this.portTo.onMaterialPlaced(materialId)
        this.hasMaterial = false
          store.commit('addDeviceChangeStatus',{
          devicename: '穿梭车',
          deviceId: this.id || '',
          materialId: materialId || '',
          status: '有货->无货',
          timestamp: Math.round(this.scheduler?.getTime() || 0)
        })

        this.scheduler?.dropOffCargo(taskId)
      }
      return
    }
    if (['moving', 'cruising', 'waiting'].includes(this.status)) {
      if (this.reachedTarget() && this.speed === 0) {
        if (this.status === 'cruising') {
          this.stopPoints = [(this.position + this.trackLength) % this.trackLength]
          this.currentStopIndex = 0
          this.setTarget(this.stopPoints[0])
          this.targetSpeed = this.maxStraightSpeed
          return
        }
        const deviceId = this.currentStopIndex === 0 ? this.task?.fromDevice : this.task?.toDevice
        const device = this.deviceMap.get(deviceId!)
        if (!device) return
        if (this.currentStopIndex === 0) {
          if (device.status === 'full' && device.currentMaterialId === this.task?.materialId) {
            this.status = 'loading'
            this.loadingTimer = 0
            device.onMaterialTaken()
          } else {
            this.status = 'waiting'
          }
        } else if (this.currentStopIndex === 1) {
          if (device.status === 'idle') {
            this.status = 'unloading'
            this.unloadingTimer = 0
            device.currentMaterialId = this.task?.materialId || null
          } else {
            this.status = 'waiting'
          }
        }
      } else if (this.status === 'waiting') {
        const deviceId = this.currentStopIndex === 0 ? this.task?.fromDevice : this.task?.toDevice
        const device = this.deviceMap.get(deviceId!)
        if (!device) return
        if (this.currentStopIndex === 0) {
          if (device.status === 'full' && device.currentMaterialId === this.task?.materialId) {
            this.status = 'loading'
            this.loadingTimer = 0
            store.commit('addDeviceChangeStatus',{
            devicename: '穿梭车',
            deviceId: this.id || '',
            materialId: this.task?.materialId || '',
            status: '无货->有货',
            timestamp: Math.round(this.scheduler?.getTime() || 0)
          })
            device.onMaterialTaken()
          }
        } else if (this.currentStopIndex === 1) {
          if (device.status === 'idle') {
            this.status = 'unloading'
            this.unloadingTimer = 0
            store.commit('addDeviceChangeStatus',{
            devicename: '穿梭车',
            deviceId: this.id || '',
            materialId: this.task?.materialId || '',
            status: '有货->无货',
            timestamp: Math.round(this.scheduler?.getTime() || 0)
          })
            device.currentMaterialId = this.task?.materialId || null
          }
        }
      }
      this.updateMotion(dt)
    }
  }

  private updateMotion(dt: number) {
    let maxSpeed = this.inCurve(this.position) ? this.maxCurveSpeed : this.maxStraightSpeed
    const targetPos = this.stopPoints[this.currentStopIndex]
    const distToStop = Math.abs(((targetPos - this.position + this.trackLength / 2) % this.trackLength) - this.trackLength / 2)
    const brakingDistance = this.speed ** 2 / (2 * 0.5)
    if (distToStop < brakingDistance) this.targetSpeed = 0
    if (!this.inCurve(this.position)) {
      let minCurveDist: number | null = null
      for (const [start] of this.curveRanges) {
        let dist = (start - this.position + this.trackLength) % this.trackLength
        if (dist > 0.01 && (minCurveDist === null || dist < minCurveDist)) minCurveDist = dist
      }
      if (minCurveDist !== null) {
        const curveBrakingDistance = (this.speed ** 2 - this.maxCurveSpeed ** 2) / (2 * 0.5)
        if (minCurveDist < curveBrakingDistance) maxSpeed = Math.min(maxSpeed, this.maxCurveSpeed)
      }
    }
    let target = Math.min(this.targetSpeed, maxSpeed)
    if (this.speed < target) {
      this.speed = Math.min(this.speed + 0.5 * dt, target)
      if (this.acceleration != 0.5) this.addCarSpeedTable({ id: this.id, speed: +this.speed.toFixed(2), acceleration: 0.5, time: Math.round(this.scheduler?.getTime() || 0) })
      this.acceleration = 0.5
    } else if (this.speed > target) {
      this.speed = Math.max(this.speed - 0.5 * dt, target)
      if (this.acceleration != -0.5) this.addCarSpeedTable({ id: this.id, speed: +this.speed.toFixed(2), acceleration: -0.5, time: Math.round(this.scheduler?.getTime() || 0) })
      this.acceleration = -0.5
    } else {
      if (this.acceleration != 0) this.addCarSpeedTable({ id: this.id, speed: +this.speed.toFixed(2), acceleration: 0, time: Math.round(this.scheduler?.getTime() || 0) })
      this.acceleration = 0
    }
    this.position += this.speed * dt
    if (this.position >= this.trackLength) this.position -= this.trackLength
    else if (this.position < 0) this.position += this.trackLength
  }

  public setScheduler(scheduler: any) { this.scheduler = scheduler }
  private reachedTarget() {
    const target = this.stopPoints[this.currentStopIndex]
    const dist = Math.abs(((this.position - target + this.trackLength / 2) % this.trackLength) - this.trackLength / 2)
    return dist < 0.1
  }
  public setTarget(pos: number) {
    this.targetSpeed = this.maxStraightSpeed
    this.stopPoints[this.currentStopIndex] = pos
  }
  public assignTask(task: CarTask, fromPos: number, toPos: number) {
    this.task = task
    this.stopPoints = [fromPos, toPos]
    this.currentStopIndex = 0
    this.setTarget(fromPos)
    this.status = 'moving'
    this.portFrom = this.deviceMap.get(task.fromDevice)!
    this.portTo = this.deviceMap.get(task.toDevice)!
  }
  public tryResume() {
    if (!this.task || this.status !== 'waiting') return
    const deviceId = this.currentStopIndex === 0 ? this.task.fromDevice : this.task.toDevice
    const device = this.deviceMap.get(deviceId!)
    if (!device) return
    if (this.currentStopIndex === 0 && device.status === 'full') {}
    if (this.currentStopIndex === 1 && device.status === 'idle') {}
  }
  public getDisplayProps() { return { positionInMeters: this.position, status: this.status } }
  public getPosition() { return this.position }
  public getSpeed() { return this.speed }
  public getStatus() { return this.status }
  public getAllInfo() {
    return { id: this.id, position: this.position, speed: this.speed, acceleration: this.acceleration, status: this.status, task: this.task, portFrom: this.portFrom, portTo: this.portTo, hasMaterial: this.hasMaterial }
  }
  public setTargetSpeed(v: number) { this.targetSpeed = Math.min(v, this.maxStraightSpeed) }
  public getDistanceTo(car: CarController, trackLength: number) { return (car.position - this.position + trackLength) % trackLength }
  public getMaxStraightSpeed() { return this.maxStraightSpeed }
}
