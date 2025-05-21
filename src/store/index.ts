import { createStore } from 'vuex'
import { CarController } from '@/utils/scheduler1.0/CarController'
import { Scheduler } from '@/utils/scheduler1.0/scheduler'

// 定义数据类型
export interface TaskItem {
  taskId: number
  materialId: number
  type: string
  fromDevice: number
  toDevice: number
  createTime: number
}

export default createStore({
  state: {
    testList: [
      {
        taskId: 1,
        materialId: 101,
        type: '出库',
        fromDevice: 16,
        toDevice: 1,
        createTime: Date.now(),
      }
    ] as TaskItem[],
    carCount: 1,
    controllers: [] as CarController[],
    scheduler: null as Scheduler | null,
  },
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
