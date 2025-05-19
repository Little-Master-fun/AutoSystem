export type PortType = 'inlet' | 'outlet' | 'in-interface' | 'out-interface'
export type PortStatus = 'idle' | 'waiting' | 'loading' | 'unloading' | 'full' | 'empty'

export class PortDevice {
  public id: number
  public type: PortType
  public status: PortStatus = 'idle'
  public hasCargo: boolean = false
  public timer: number = 0
  public position: number

  constructor(id: number, type: PortType, position: number) {
    this.id = id
    this.type = type
    this.position = position
  }

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
    if (this.type === 'out-interface' && this.status === 'loading') {
      this.hasCargo = true
      this.status = 'full'
    }
    if (this.type === 'outlet' && this.status === 'unloading') {
      this.hasCargo = false
      this.status = 'idle'
    }
    if (this.type === 'inlet' && this.status === 'loading') {
      this.hasCargo = true
      this.status = 'full'
    }
    if (this.type === 'in-interface' && this.status === 'unloading') {
      this.hasCargo = false
      this.status = 'idle'
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

  public isAvailable(): boolean {
    return !this.isBusy() && (this.status === 'idle' || this.status === 'empty')
  }
}

// ✅ 全部设备的位置信息（用于初始化）
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

// ✅ 类型映射表（可灵活配置）
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
