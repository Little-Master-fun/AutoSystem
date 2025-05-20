export interface CarTask {
  taskId: number
  materialId: number
  type: '入库' | '出库' | '巡航'
  fromDevice: number
  toDevice: number
  desiredSpeed?: number // 可选
}

export type TaskType = '入库' | '出库' | '巡航'

export interface CarTask {
  taskId: number
  materialId: number
  type: TaskType
  fromDevice: number
  toDevice: number
  createTime: number // Date.now()
  priority?: number  // 越小优先级越高（可选）
  desiredSpeed?: number // m/s，可选
}
