<template>
  <TresCanvas v-bind="gl">
    <TresPerspectiveCamera :position="[4, 3, 9]" />
    <OrbitControls />
    <!-- 轨道线 -->
    <Track />
    <!-- 小车 -->
    <TresMesh ref="carRefs" v-for="(car, index) in controllers" :key="car.id">
      <TresBoxGeometry :args="[1.2, 0.2, 1.2]" />
      <TresMeshStandardMaterial color="#2196f3" />
    </TresMesh>
    <!-- 站台 -->
    <TresGroup v-for="(d, idx) in stationPos" :key="d.id ?? idx" :position="d.position">
      <Station></Station>
    </TresGroup>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1.2" cast-shadow />
    <TresGridHelper />
  </TresCanvas>
</template>

<script setup lang="ts">
import { BasicShadowMap, SRGBColorSpace, NoToneMapping } from 'three'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { inittrackinner, inittrackout, inittrackocar } from '@/utils/senseData'
import { getDeviceMap, getAllDevices } from '@/utils/scheduler1.0/PortDevice'
import { onMounted, computed, shallowRef, ref } from 'vue'
import { CarController } from '@/utils/scheduler1.0/CarController'
import { Scheduler } from '@/utils/scheduler1.0/scheduler'
import store from '../store'
import { useRenderLoop } from '@tresjs/core'
import { getPositionOnTrack } from '@/utils/senseData.ts'
import Track from './tres/Track.vue'
import Station from './tres/Station.vue'

//轨道设置函数
const trackPoints = inittrackinner()
const carCount = computed(() => store.state.carCount)


const deviceMap = getDeviceMap()

const controller = computed(() => {
  const arr: CarController[] = []
  for (let i = 0; i < carCount.value; i++) {
    arr.push(new CarController(i + 1, deviceMap, 73.47 + i * 2.2))
  }
  return arr
})
const controllers = controller.value

//场景渲染设置
const gl = {
  clearColor: '#82DBC5',
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
}

//设置出入库点
const allDevices = getAllDevices()

const status = ref<{ id: number; positionInMeters: number; status: string }[]>([])
// const controllers = [new CarController(1, deviceMap, 0), new CarController(1, deviceMap, 10)]
// 上传全局状态
store.commit('setControllers', controllers)

const stationPos = allDevices
  .map((device) => {
    const station = deviceMap.get(device.id)
    if (station) {
      const pos = getPositionOnTrack(station.position)
      // Ensure the array is always exactly [number, number, number]
      const position: [number, number, number] = [
        pos.x,
        pos.y,
        station.id <= 12 ? pos.z - 2.3 : pos.z + 2.3,
      ]
      return {
        id: station.id,
        position,
      }
    }
    return null
  })
  .filter((station) => station !== null)

for (let i = 0; i < controllers.length; i++) {
  status.value.push({
    id: controllers[i].id,
    positionInMeters: 0,
    status: 'idle',
  })
}
// // 存储子组件引用，必须是数组
const carRefs = shallowRef<any[]>([])
const { onLoop } = useRenderLoop()
onLoop(() => {
  for (let i = 0; i < controllers.length; i++) {
    const car = controllers[i]
    const carRef = carRefs.value[i]
    if (!carRef) continue

    const pos = getPositionOnTrack(car.getDisplayProps().positionInMeters)
    carRef.position.set(pos.x, pos.y, pos.z)

    // 更新状态（如果你要显示）
    status.value[i].status = car.getDisplayProps().status
  }
})

// 计算轨道长度
const trackLengths = [0]
let totalLength = 0
for (let i = 1; i < trackPoints.length; i++) {
  totalLength += trackPoints[i].distanceTo(trackPoints[i - 1])
  trackLengths.push(totalLength)
}

const scheduler = new Scheduler(controllers, deviceMap, totalLength)
// 这里可以添加任务
scheduler.addTask({
  taskId: 1,
  materialId: 101,
  type: '出库',
  fromDevice: 16,
  toDevice: 1,
  createTime: Date.now(),
})

store.commit('setScheduler', scheduler)

let lastTime = performance.now()

// 动画循环
function animate(current: number) {
  const delta = (current - lastTime) / 1000 // 秒
  lastTime = current
  scheduler.update(delta) // 移动 + 装卸 + 状态更新
  requestAnimationFrame(animate)
}

onMounted(() => {
  requestAnimationFrame(animate)
})

// 小车状态函数
// const color = computed(() => {
//   switch (props.status.status) {
//     case 'idle': return '#2196f3'
//     case 'moving': return '#4caf50'
//     case 'loading': return '#ff9800'
//     case 'loaded': return '#673ab7'
//     case 'unloading': return '#f44336'
//     default: return '#9e9e9e'
//   }
// })
</script>
