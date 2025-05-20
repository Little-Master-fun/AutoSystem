<template>
  <div class="h-full w-full flex flex-col justify-center items-center">
    <div class="text-white flex items-center justify-between w-full pl-3">
      <div class="flex items-center justify-start">
      <el-icon color="#18ccf5"><DataLine /></el-icon>
      <p style="font-family: 'tel'">小车状态</p>
      <dv-decoration3 style="width: 30%; height: 25px" />

      </div>
      <div class="h-5 overflow-hidden rounded-2xl flex items-center justify-center mr-3 bg-[#222c38] ">
        <el-select
          v-model="carIndex"
          placeholder="Select"
          size="large"
          style="
            width: 140px;
            height: 40px !important;
            overflow: hidden;
            background-color: #222c38;
            color: #fff;
          "
          class="car"
          popper-class="custom-select-dropdown"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
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
import { onMounted, computed, ref, watch } from 'vue'
import * as echarts from 'echarts'
import store from '@/store'

const controllers = computed(() => store.getters.controllers)
const carIndex = ref(0)

const options = computed(() => {
  return controllers.value.map((item: any, index: number) => {
    return {
      value: index,
      label: `小车${index + 1}`,
    }
  })
})

type EChartsOption = echarts.EChartsOption

var option_A: EChartsOption
option_A = {
  tooltip: {
    formatter: '{a} <br/>{b} : {c}',
  },
  series: [
    {
      name: 'Acceleration',
      type: 'gauge',
      min: -0.5,
      max: 0.5,
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
        formatter: function (value: number) {
          return value.toFixed(1)
        },
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
          value: 0,
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
  setInterval(function () {
    const car = controllers.value[carIndex.value]

    const carinfo = car.getAllInfo()

    speed.setOption({
      series: [
        {
          data: [
            {
              value: Number(carinfo.speed.toFixed(2)),
              name: '速度m/s',
            },
          ],
        },
      ],
    })
  }, 500)
  setInterval(function () {
    const car = controllers.value[carIndex.value]

    const carinfo = car.getAllInfo()

    acceleration.setOption({
      series: [
        {
          data: [
            {
              value: Number(carinfo.acceleration.toFixed(2)),
              name: '加速度',
            },
          ],
        },
      ],
    })
  }, 500)
  option_A && acceleration.setOption(option_A)
  option_S && speed.setOption(option_S)
})
</script>

<style>
.car {
  .el-select--large .el-select__wrapper {
    min-height: 20px !important;
    overflow: hidden;
    box-sizing: border-box;
  }
  .el-select__wrapper{
    background-color: #222c38 !important;
    border: none !important;
    box-shadow: none;
  }
  .el-select__wrapper.is-focused{
    box-shadow: none;
}
  .el-select__wrapper:hover{
    box-shadow: none;
}

}
</style>
