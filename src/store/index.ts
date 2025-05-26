import { createStore } from 'vuex'
import { CarController } from '@/utils/scheduler1.0/CarController'
import { Scheduler } from '@/utils/scheduler1.0/scheduler'

// 定义数据类型
export interface TaskItem {
  taskId: number
  materialId: string
  type: string
  fromDevice: number
  toDevice: number
  createTime: number
}

export interface DeviceChangeStatus {
  devicenme: string
  deviceId: string
  materialId: string
  status: string
  timestamp: number
}

const getDefaultState = () => ({
  testList: [
    {
      taskId: 1,
      materialId: '101',
      type: '出库',
      fromDevice: 17,
      toDevice: 1,
      createTime: Date.now(),
    },
  ] as TaskItem[],
  carCount: 1,
  controllers: [] as CarController[],
  scheduler: null as Scheduler | null,
  speedTable: [],
  taskData: [],
  task: 2,
  speedvalue: 1,
  deviceMap: [],
  carSpeedTable: [],
  allDeviceChangeStatus: [] as DeviceChangeStatus[],
})

export default createStore({
  state: getDefaultState(),
  mutations: {
    setTestList(state: { testList: TaskItem[] }, value: TaskItem[]) {
      state.testList = value
    },
    setCarCount(state: { carCount: number }, value: number) {
      state.carCount = value
    },
    setControllers(
      state: { testList: TaskItem[]; carData: any[]; controllers: CarController[] },
      controllers: CarController[],
    ) {
      state.controllers = controllers
    },
    setScheduler(
      state: {
        testList: TaskItem[]
        carData: any[]
        controllers: CarController[]
        scheduler: Scheduler | null
      },
      scheduler: Scheduler,
    ) {
      state.scheduler = scheduler
    },
    addSpeedTable(state: { speedTable: any[] }, value: any) {
      state.speedTable.push(value)
    },
    setTask(state: { task: number }, value: number) {
      state.task = value
    },
    setSpeedValue(state: { speedvalue: number }, value: number) {
      state.speedvalue = value
    },
    setDeviceMap(state: { deviceMap: any[] }, value: any) {
      state.deviceMap = value
    },
    addCarSpeedTable(state: { carSpeedTable: any[] }, value: any) {
      state.carSpeedTable.push(value)
    },
    resetState(state: any) {
      Object.assign(state, getDefaultState())
    },
    addDeviceChangeStatus(state: { allDeviceChangeStatus: any[] }, value: any) {
      state.allDeviceChangeStatus.push(value)
    },
  },
  getters: {
    controllers: (state: { testList: TaskItem[]; carData: any[]; controllers: CarController[] }) =>
      state.controllers,
    scheduler: (state: {
      testList: TaskItem[]
      carData: any[]
      controllers: CarController[]
      scheduler: Scheduler | null
    }) => state.scheduler,
    carCount: (state: { carCount: number }) => state.carCount,
    carData: (state: { testList: TaskItem[]; carData: any[] }) => state.carData,
    testList: (state: { testList: TaskItem[] }) => state.testList,
  },
})
