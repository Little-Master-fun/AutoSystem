<template>
  <div class="h-full w-full flex flex-col justify-center items-center">
    <div class="text-white flex items-center justify-start w-full pl-3">
      <el-icon color="#18ccf5"><DataLine /></el-icon>
      <p style="font-family: 'tel'">小车状态</p>
      <dv-decoration3 style="width: 30%; height: 25px" />
    </div>
    <div class="h-[80%] w-full flex items-end">
      <div class="h-full flex-1" id="acceleration"></div>
      <div class="h-full flex-1" id="speed"></div>
    </div>
    <dv-decoration5 :dur="2" style="width: 90%; height: 40px" class="mb-3 absolute bottom-0" />
  </div>
</template>

<script setup lang="ts">
import { DataLine } from '@element-plus/icons-vue'
import { onMounted } from 'vue'
import * as echarts from 'echarts'

type EChartsOption = echarts.EChartsOption

var option_A: EChartsOption
option_A = {
  tooltip: {
    formatter: '{a} <br/>{b} : {c}%',
  },
  series: [
    {
      name: 'Pressure',
      type: 'gauge',
      progress: {
        show: true,
        width: 8,
      },
      axisLine: {
        lineStyle: {
          width: 8,
        },
      },
      axisLabel: {
        distance: 10,
        color: '#999',
        fontSize: 10,
      },
      title: {
        offsetCenter: [0, '40%'],
        fontSize: 15,
        color: '#18ccf5',
      },
      splitLine: {
        length: 7,
        lineStyle: {
          width: 2,
          color: '#999',
        },
      },

      detail: {
        formatter: '{value}',
        valueAnimation: true,
        fontSize: 20,
        color: '#18ccf5',
        offsetCenter: [0, '70%'],
      },
      data: [
        {
          value: 40,
          name: '加速度',
        },
      ],
    },
  ],
}
var option_S: EChartsOption
option_S = {
  tooltip: {
    formatter: '{a} <br/>{b} : {c}%',
  },
  series: [
    {
      name: 'Pressure',
      type: 'gauge',
      min: 0,
      max: 2.5,
      progress: {
        show: true,
        width: 8,
      },
      axisLine: {
        lineStyle: {
          width: 8,
        },
      },
      axisLabel: {
        distance: 10,
        color: '#999',
        fontSize: 10,
      },
      title: {
        offsetCenter: [0, '40%'],
        fontSize: 15,
        color: '#18ccf5',
      },
      splitLine: {
        length: 7,
        lineStyle: {
          width: 2,
          color: '#999',
        },
      },

      detail: {
        formatter: '{value}',
        valueAnimation: true,
        fontSize: 20,
        color: '#18ccf5',
        offsetCenter: [0, '70%'],
      },
      data: [
        {
          value: 1.2,
          name: '速度m/s',
        },
      ],
    },
  ],
}
onMounted(() => {
  var accelerationDom = document.getElementById('acceleration')!
  var acceleration = echarts.init(accelerationDom)
  var speedDom = document.getElementById('speed')!
  var speed = echarts.init(speedDom)
  window.addEventListener('resize', function () {
    acceleration.resize()
    speed.resize()
  })
  option_A && acceleration.setOption(option_A)
  option_A && speed.setOption(option_S)
})
</script>
