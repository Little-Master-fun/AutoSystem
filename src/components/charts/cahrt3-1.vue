<template>
  <div class="h-full w-full flex flex-col justify-center items-center">
    <div class="text-white flex items-center justify-start w-full pl-3">
      <el-icon color="#18ccf5"><DataLine /></el-icon>
      <p style="font-family: 'tel'">时间-速度</p>
      <dv-decoration3 style="width: 30%; height: 25px" />
    </div>
    <div class="h-[80%] w-full">
      <div class="h-full w-full" id="1-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataLine } from '@element-plus/icons-vue'
import { onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import store from '@/store'
import { computed } from 'vue'

const addSpeedTable = (value: any) => store.commit('addSpeedTable', value)
const getSpeedTable = computed(() => store.state.speedTable)
let chart: echarts.ECharts | null = null
let timer: number | null = null

function initChart() {
  const dom = document.getElementById('1-3')
  if (!dom) return
  chart = echarts.init(dom)
  const option = {
    animationDuration: 500,
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLabel: { color: '#fff' },
      name: '时间(s)',
      nameTextStyle: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' },
      name: '速度(m/s)',
      nameTextStyle: { color: '#fff' },
    },
    series: [
      {
        name: '速度',
        type: 'line',
        data: [],
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#18ccf5' },
      },
    ],
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
  }
  chart.setOption(option)
}

function updateChart() {
  if (!chart) return
  const speedTable = getSpeedTable.value
  if (!Array.isArray(speedTable) || speedTable.length === 0) return

  // 只取后10个数据
  const lastData = speedTable

  // 1. 获取所有 carId
  const carIdSet = new Set<number>()
  lastData.forEach(item => {
    item.cars.forEach((car: any) => {
      carIdSet.add(car.carId)
    })
  })
  const carIds = Array.from(carIdSet).sort((a, b) => a - b)

  // 2. 构建 x 轴（时间，取整数）
  const xData = lastData.map(item => Math.round(Number(item.time)))
  const series = carIds.map((carId, idx) => {
    // 颜色可自定义
    const colors = [
      '#18ccf5', '#f56c6c', '#67c23a', '#e6a23c', '#909399', '#409eff', '#ff7f50', '#9b59b6'
    ]
    return {
      name: `小车${carId}`,
      type: 'line',
      data: lastData.map(item => {
        const car = item.cars.find((c: any) => c.carId === carId)
        return car ? Number(car.speed).toFixed(2) : null
      }),
      smooth: true,
      showSymbol: false,
      lineStyle: { color: colors[idx % colors.length] }
    }
  })

  chart.setOption({
    xAxis: { data: xData },
    series: series,
    legend: {
      data: carIds.map(carId => `小车${carId}`),
      textStyle: { color: '#fff' }
    }
  })
}

onMounted(() => {
  const scheduler = computed(() => store.getters.scheduler)

  // 每秒执行一次 updateTestList
  initChart()
  timer = window.setInterval(updateChart, 1000)
  window.addEventListener('resize', resizeChart)
})

function resizeChart() {
  chart && chart.resize()
}

onBeforeUnmount(() => {
  timer && clearInterval(timer)
  window.removeEventListener('resize', resizeChart)
  chart && chart.dispose()
})
</script>
