export type PortType = 'inlet' | 'outlet' | 'in-interface' | 'out-interface'
export type PortStatus = 'idle' | 'waiting' | 'loading' | 'unloading' | 'full' | 'empty'

export class PortDevice {
  public id: number
  public type: PortType
  public status: PortStatus = 'idle'
  public hasCargo = false
  public timer = 0
  public position: number
  private taskQueue: number[] = []
  public currentMaterialId: number | null = null
  public scheduler: any = null

  constructor(id: number, type: PortType, position: number) {
    this.id = id
    this.type = type
    this.position = position
  }

  public setScheduler(scheduler: any) { this.scheduler = scheduler }

  // 添加任务（物料ID）
  public addTask(materialId: number) {
    this.taskQueue.push(materialId)
    if (!this.currentMaterialId && this.isAvailable()) {
      this.currentMaterialId = this.taskQueue.shift() || null
      this.hasCargo = true
      this.status = 'full'
    } else if (!this.currentMaterialId && this.isAvailable()) {
      this.startNextTask()
    }
  }

  // 开始下一个任务
  private startNextTask() {
    if (this.taskQueue.length === 0 || !this.isAvailable()) return
    this.currentMaterialId = this.taskQueue.shift() || null
    if (this.type === 'inlet') this.startOperation('loading', 30)
    else if (this.type === 'out-interface') this.startOperation('loading', 50)
    else if (this.type === 'in-interface' && this.status === 'idle') this.startOperation('unloading', 25)
    else if (this.type === 'outlet' && this.status === 'idle') this.startOperation('unloading', 30)
  }

  // 更新设备状态
  public update(deltaTime: number) {
    if (this.timer > 0) {
      this.timer -= deltaTime
      if (this.timer <= 0) {
        this.timer = 0
        this.finishOperation()
      }
    }
  }

  private finishOperation() {
    if ((this.type === 'out-interface' || this.type === 'inlet') && this.status === 'loading') {
      this.hasCargo = true
      this.status = 'full'
    }
    if ((this.type === 'outlet' || this.type === 'in-interface') && this.status === 'unloading') {
      this.hasCargo = false
      this.status = 'idle'
      this.scheduler?.completeTask(this.currentMaterialId, true)
      this.currentMaterialId = null
      this.startNextTask()
    }
    // 装货完成，等待小车取走
  }

  // 小车取走物料时调用
  public onMaterialTaken() {
    if (this.hasCargo && (this.type === 'out-interface' || this.type === 'inlet')) {
      this.hasCargo = false
      this.status = 'idle'
      this.currentMaterialId = null
      this.startNextTask()
    }
  }

  // 小车放上物料时调用
  public onMaterialPlaced(materialId: number) {
    if (!this.hasCargo && (this.type === 'outlet' || this.type === 'in-interface')) {
      this.hasCargo = true
      this.status = 'full'
      this.currentMaterialId = materialId
      if (this.type === 'in-interface') this.startOperation('unloading', 25)
      else if (this.type === 'outlet') this.startOperation('unloading', 30)
    }
  }

  public startOperation(status: PortStatus, duration: number) {
    if (this.timer > 0) return
    this.status = status
    this.timer = duration
  }

  public isBusy(): boolean { return this.timer > 0 }
  public getMaterialId(): number | null { return this.currentMaterialId }
  public isAvailable(): boolean { return !this.isBusy() && (this.status === 'idle' || this.status === 'empty') }
}

// 设备位置信息
const devicePositions: Record<number, number> = {
  1: 13.54, 2: 15.94, 3: 19.54, 4: 21.93, 5: 25.54, 6: 27.93,
  7: 31.53, 8: 33.93, 9: 37.54, 10: 39.93, 11: 43.54, 12: 45.93,
  13: 67.47, 14: 70.47, 15: 73.47, 16: 85.47, 17: 88.47, 18: 91.47,
}

// 类型映射表
const portTypes: Record<number, PortType> = {
  1: 'in-interface', 2: 'out-interface', 3: 'in-interface', 4: 'out-interface',
  5: 'in-interface', 6: 'out-interface', 7: 'in-interface', 8: 'out-interface',
  9: 'in-interface', 10: 'out-interface', 11: 'in-interface', 12: 'out-interface',
  13: 'outlet', 14: 'outlet', 15: 'outlet', 16: 'inlet', 17: 'inlet', 18: 'inlet',
}

// 创建设备列表
export function getAllDevices(): PortDevice[] {
  return Object.keys(devicePositions).map(idStr => {
    const id = parseInt(idStr)
    return new PortDevice(id, portTypes[id], devicePositions[id])
  })
}

// 创建设备 Map
export function getDeviceMap(): Map<number, PortDevice> {
  const map = new Map<number, PortDevice>()
  getAllDevices().forEach(dev => map.set(dev.id, dev))
  return map
}

// 通过设备id查找设备状态
export function getDeviceStatusById(id: number): PortStatus | null {
  const map = getDeviceMap()
  const device = map.get(id)
  return device ? device.status : null
}
