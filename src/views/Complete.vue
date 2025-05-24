<template>
  <div class="h-screen w-full pt-2">
    <!-- 头部 -->
    <div class="flex justify-center w-full relative">
      <dv-decoration-10 style="width: 20%; height: 5px" />
      <div class="flex justify-around items-center w-[60%]">
        <dv-decoration8 style="width: 30%; height: 50px" :color="['#568aea', '#000000']" />
        <div
          class="flex flex-col items-center justify-center w-[200px] text-center mx-4 relative"
          style="top: 15px"
        >
          <span class="text-white text-3xl" style="font-family: tel">调度结果</span>
          <dv-decoration-6
            class="w-full mt-2"
            style="height: 20px"
            :reverse="true"
            :color="['#50e3c2', '#67a1e5']"
          />
        </div>
        <dv-decoration8
          :reverse="true"
          :color="['#568aea', '#000000']"
          style="width: 30%; height: 50px"
        />
      </div>
      <dv-decoration-10 style="width: 20%; height: 5px; transform: rotate(180deg)" />
      <div class="absolute left-2 bottom-0">
        <el-radio-group v-model="carTable" fill="#6cf">
          <el-radio-button label="小车" value=true />
          <el-radio-button label="任务" value=false />
        </el-radio-group>
      </div>
      <el-button class="absolute right-2 bottom-0" type="primary" @click="backToHome">返回首页</el-button>
    </div>
    <!-- 小车速度 -->
    <div class="flex items-center w-full mt-4 flex-col h-[90%]" v-if="carTable == 'true'">
      <div class="h-[50%] w-full">
        <dv-border-box12> <cahrt31></cahrt31> </dv-border-box12>
      </div>
      <div class="h-[50%] w-full flex justify-center items-center">
        <dv-border-box13>
          <div></div>
          <div class="flex justify-center items-center w-full h-full">
            <div class="w-[95%] h-[90%] justify-center items-center">
              <el-scrollbar>
                <p class="text-white text-[12px] mb-2"></p>
                <table class="min-w-full bg-[#181c2f] text-white border-collapse">
                  <thead class="sticky top-0 bg-[#23284a]">
                    <tr>
                      <th class="px-2 py-1 border-b border-[#2a2f4d] text-[12px] w-20">小车ID</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-32">速度</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-32">加速度</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">状态</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, idx) in carspeedTable"
                      :key="'assigned-' + idx"
                      class="hover:bg-[#23284a]"
                    >
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.id }}</td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ row.speed }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ row.acceleration }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{
                          row.acceleration == 0.5
                            ? '开始加速'
                            : row.acceleration == -0.5
                              ? '开始减速'
                              : '停止加减速'
                        }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ row.time }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </el-scrollbar>
            </div>
          </div>
        </dv-border-box13>
      </div>
    </div>
    <!-- 任务记录 -->
    <div class="flex items-center w-full mt-4 flex-col h-[90%]" v-else>
      <div class="h-[100%] w-full flex justify-center items-center">
        <dv-border-box13>
          <div class="flex justify-center items-center w-full h-full">
            <div class="w-[95%] h-[90%] justify-center items-center">
              <el-scrollbar>
                <p class="text-white text-[12px] mb-2"></p>
                <table class="min-w-full bg-[#181c2f] text-white border-collapse">
                  <thead class="sticky top-0 bg-[#23284a]">
                    <tr>
                      <th class="px-2 py-1 border-b border-[#2a2f4d] text-[12px] w-20">任务ID</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-32">物料ID</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-32">任务类型</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-32">执行小车</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">起始设备</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">结束设备</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">入货时间</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">上车时间</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">下车时间</th>
                      <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">出货时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, idx) in completeTask"
                      :key="'assigned-' + idx"
                      class="hover:bg-[#23284a]"
                    >
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ row.taskId }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ row.materialId }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ row.type }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ row.carId }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ row.fromDevice }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ row.toDevice }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ Math.round(row.startTime) }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ Math.round(row.pickUpTime) }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ Math.round(row.dropOffTime) }}
                      </td>
                      <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">
                        {{ Math.round(row.takenTime) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </el-scrollbar>
            </div>
          </div>
        </dv-border-box13>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import cahrt31 from '@/components/charts/cahrt3-1.vue'
import { onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import store from '@/store'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'


const addSpeedTable = (value: any) => store.commit('addSpeedTable', value)
const getSpeedTable = computed(() => store.state.speedTable)
let chart: echarts.ECharts | null = null
let timer: number | null = null
const carspeedTable = computed(() => store.state.carSpeedTable)
const carTable = ref('true')
const scheduler = computed(() => store.getters.scheduler)
const completeTask = scheduler.value?.getCompletedTaskDetails()
const router = useRouter()

const backToHome = () => {
  store.commit('resetState')
  router.push('/')
}

function updateChart() {
  if (!chart) return
  const speedTable = getSpeedTable.value
  if (!Array.isArray(speedTable) || speedTable.length === 0) return

  // 只取后10个数据
  const lastData = speedTable.slice(-10)

  // 1. 获取所有 carId
  const carIdSet = new Set<number>()
  lastData.forEach((item) => {
    item.cars.forEach((car: any) => {
      carIdSet.add(car.carId)
    })
  })
  const carIds = Array.from(carIdSet).sort((a, b) => a - b)

  // 2. 构建 x 轴（时间，取整数）
  const xData = lastData.map((item) => Math.round(Number(item.time)))
  const series = carIds.map((carId, idx) => {
    // 颜色可自定义
    const colors = [
      '#18ccf5',
      '#f56c6c',
      '#67c23a',
      '#e6a23c',
      '#909399',
      '#409eff',
      '#ff7f50',
      '#9b59b6',
    ]
    return {
      name: `小车${carId}`,
      type: 'line',
      data: lastData.map((item) => {
        const car = item.cars.find((c: any) => c.carId === carId)
        return car ? Number(car.speed).toFixed(2) : null
      }),
      smooth: true,
      showSymbol: false,
      lineStyle: { color: colors[idx % colors.length] },
    }
  })

  chart.setOption({
    xAxis: { data: xData },
    series: series,
    legend: {
      data: carIds.map((carId) => `小车${carId}`),
      textStyle: { color: '#fff' },
    },
  })
}

onMounted(() => {
  const scheduler = computed(() => store.getters.scheduler)
  const updateTestList = () => {
    const speedlists = scheduler.value?.getCarsSpeedTimeline()
    addSpeedTable(speedlists)
  }
  updateTestList()
  // 每秒执行一次 updateTestList
  timer = window.setInterval(updateChart, 1000)
  window.addEventListener('resize', resizeChart)
})

function resizeChart() {
  chart && chart.resize()
}
</script>
