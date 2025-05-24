export type PortType = 'inlet' | 'outlet' | 'in-interface' | 'out-interface'
export type PortStatus = 'idle' | 'waiting' | 'loading' | 'unloading' | 'full' | 'empty'

export class PortDevice {
  public id: number
  public type: PortType
  public status: PortStatus = 'idle'
  public hasCargo: boolean = false
  public timer: number = 0
  public position: number

  // 新增：任务队列和当前物料ID
  private taskQueue: number[] = []
  public currentMaterialId: number | null = null
  public scheduler: any = null // 任务调度器

  constructor(id: number, type: PortType, position: number) {
    this.id = id
    this.type = type
    this.position = position
  }

  public setScheduler(scheduler: any) {
    this.scheduler = scheduler
  }

  // 新增：添加任务（物料ID）
  public addTask(materialId: number) {
    this.taskQueue.push(materialId)
    // 如果当前没有物料且设备空闲，自动开始下一个任务
    if (!this.currentMaterialId && this.isAvailable()) {
      // 第一个任务时直接上好货
      this.currentMaterialId = this.taskQueue.shift() || null
      this.hasCargo = true
      this.status = 'full'
      // 等待小车取走，取走后再自动下一个
    } else if (!this.currentMaterialId && this.isAvailable()) {
      this.startNextTask()
    }
  }

  // 新增：开始下一个任务
  private startNextTask() {
    if (this.taskQueue.length === 0) return

    // 只在设备空闲或empty时才取下一个任务
    if (!this.isAvailable()) return
    
    this.currentMaterialId = this.taskQueue.shift() || null
    
    // 根据类型自动开始装/卸货，并使用不同的时间
    if (this.type === 'inlet') {
      this.startOperation('loading', 30)
    } else if (this.type === 'out-interface') {
      this.startOperation('loading', 50)
    } else if (this.type === 'in-interface' && this.status === 'idle') {
      this.startOperation('unloading', 25)
    } else if (this.type === 'outlet' && this.status === 'idle') {
      this.startOperation('unloading', 30)
    }
  }
  // 新增：更新设备状态
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
    // 完成装/卸货后，自动处理物料
    if ((this.type === 'out-interface' || this.type === 'inlet') && this.status === 'loading') {
      this.hasCargo = true
      this.status = 'full'
    }
    if ((this.type === 'outlet' || this.type === 'in-interface') && this.status === 'unloading') {
      this.hasCargo = false
      this.status = 'idle'
      console.log(this.currentMaterialId);
      this.scheduler?.completeTask(this.currentMaterialId, true) // 调用调度器完成任务
      this.currentMaterialId = null // 物料被取走
      this.startNextTask() // 自动开始下一个任务
    }
    // 如果是装货完成，等待小车取走后再自动下一个
    if ((this.type === 'out-interface' || this.type === 'inlet') && this.status === 'full') {
      // 等待小车取走，取走后需调用 onMaterialTaken
    }
  }

  // 新增：小车取走物料时调用
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
      if (this.type === 'in-interface' && this.status === 'full') {
        this.startOperation('unloading', 25) // 入口接口卸货25秒（取走）
      } else if (this.type === 'outlet' && this.status === 'full') {
        this.startOperation('unloading', 30) // 出库口卸货30秒
      }
    }
  }

  public startOperation(status: PortStatus, duration: number) {
    if (this.timer > 0) return // 忽略正在进行中的
    this.status = status
    this.timer = duration
  }

  public isBusy(): boolean {
    return this.timer > 0
  }
  //返回物料编号
  public getMaterialId(): number | null {
    return this.currentMaterialId
  }
  public isAvailable(): boolean {
    return !this.isBusy() && (this.status === 'idle' || this.status === 'empty')
  }
}

// 全部设备的位置信息（用于初始化）
const devicePositions: Record<number, number> = {
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

// 类型映射表（可灵活配置）
const portTypes: Record<number, PortType> = {
  1: 'in-interface',
  2: 'out-interface',
  3: 'in-interface',
  4: 'out-interface',
  5: 'in-interface',
  6: 'out-interface',
  7: 'in-interface',
  8: 'out-interface',
  9: 'in-interface',
  10: 'out-interface',
  11: 'in-interface',
  12: 'out-interface',
  13: 'outlet',
  14: 'outlet',
  15: 'outlet',
  16: 'inlet',
  17: 'inlet',
  18: 'inlet',
}

// ✅ 创建设备列表
export function getAllDevices(): PortDevice[] {
  return Object.keys(devicePositions).map((idStr) => {
    const id = parseInt(idStr)
    const type = portTypes[id]
    const position = devicePositions[id]
    return new PortDevice(id, type, position)
  })
}

// ✅ 创建设备 Map（便于快速查找）
export function getDeviceMap(): Map<number, PortDevice> {
  const map = new Map<number, PortDevice>()
  getAllDevices().forEach((dev) => map.set(dev.id, dev))
  return map
}

/**
 * 通过设备id查找设备状态
 * @param id 设备ID
 * @param deviceMap 可选，设备Map，默认自动生成
 * @returns 设备状态（PortStatus）或 null
 */
export function getDeviceStatusById(id: number): PortStatus | null {
  const map = getDeviceMap()
  const device = map.get(id)
  return device ? device.status : null
}
