<template>
  <div class="w-[60vw] h-[90vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <dv-border-box1 class="">
      <div class="rounded-2xl overflow-hidden h-full bg-slate-800 flex flex-col items-center">
        <el-image src="/images/sense.png" class="mb-4 h-[30%] w-full"></el-image>
        <!-- 表格 -->
        <div class="w-full h-[70%] flex flex-col items-center">
          <el-scrollbar class="w-full h-[70%]">
            <div class="text-white flex items-center justify-center w-full ">
              <el-form
                :model="tastList"
                label-width="auto"
                style="max-width: 80%"
                class="demo-form-inline w-full text-amber-50 h-[70%]"
                label-position="left"
              >
                <el-form-item label="小车数量">
                  <el-input
                    v-model="carCount"
                    type="number"
                    min="1"
                    placeholder="请输入小车数量"
                  />
                </el-form-item>
                <div v-for="(item, index) in tastList" :key="index">
                  <p>任务{{ index + 1 }}</p>
                  <el-form-item label="任务类型">
                    <el-radio-group v-model="item.type" aria-label="label position">
                      <el-radio-button value="出库">出库</el-radio-button>
                      <el-radio-button value="入库">入库</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="物料ID">
                    <el-input v-model="item.materialId" placeholder="Material ID"  />
                  </el-form-item>
                  <el-form-item label="起始设备">
                    <el-input v-model="item.fromDevice" placeholder="From Device" type="number" />
                  </el-form-item>
                  <el-form-item label="目标设备">
                    <el-input v-model="item.toDevice" placeholder="To Device" type="number" />
                  </el-form-item>
                </div>
              </el-form>
            </div>
          </el-scrollbar>
          <div class="flex justify-between items-center w-[70%] mb-4">
            <el-button type="primary" @click="addTask">添加任务</el-button>
            <el-button type="primary" @click="beginSystem">开始仿真</el-button>
          </div>
        </div>
      </div>
    </dv-border-box1>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'


const props = defineProps<{
    changeVis: (val: boolean) => void
}>()
const router = useRouter()

// 调用 changeVis 方法
const changeVis = props.changeVis
interface TaskItem {
  taskId: number
  materialId: number
  type: string
  fromDevice: number
  toDevice: number
  createTime: number
}


const carCount = ref(1)
const setTast = (value: any) => store.commit('setTestList', value)
const setCarCount = (value: any) => store.commit('setCarCount', value)
const tastList = reactive<TaskItem[]>([
  {
    taskId: 1,
    materialId: 1,
    type: '出库',
    fromDevice: 16,
    toDevice: 1,
    createTime: Date.now(),
  },
])

const addTask = () => {
  tastList.push({
    taskId: tastList.length + 1,
    materialId: 1,
    type: '出库',
    fromDevice: 1,
    toDevice: 2,
    createTime: Date.now(),
  })
}
const beginSystem = () => {
  // 将fromDevice和toDevice转为Number类型
  tastList.forEach(item => {
    item.fromDevice = Number(item.fromDevice)
    item.toDevice = Number(item.toDevice)
  })
  setTast(tastList)
  setCarCount(carCount.value)
  
  changeVis(false)
  router.push('/scene')
}
</script>
