import { createStore } from 'vuex'

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
    testList: [] as TaskItem[],
    carData: []
  },
  mutations: {
    setTestList(state: { testList: TaskItem[] }, value: TaskItem[]) {
      state.testList = value
    },
    setCarData(state: { carData: any[] }, value: any[]) {
      state.carData = value
    },
  },
})
