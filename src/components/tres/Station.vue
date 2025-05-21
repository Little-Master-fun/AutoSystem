<template>
      <!-- 底座 -->
      <TresMesh>
        <TresBoxGeometry :args="[1.1, 0.2, 3.3]" />
        <TresMeshStandardMaterial :color="stationColor" />
      </TresMesh>

      <!-- 左突起 -->
      <TresMesh :position="[-0.4, 0.15, 0]">
        <TresBoxGeometry :args="[0.2, 0.1, 1.1]" />
        <TresMeshStandardMaterial :color="stationColor" />
      </TresMesh>

      <!-- 右突起 -->
      <TresMesh :position="[0.4, 0.15, 0]">
        <TresBoxGeometry :args="[0.2, 0.1, 1.1]" />
        <TresMeshStandardMaterial :color="stationColor" />
      </TresMesh>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getDeviceStatusById, getDeviceMap } from '@/utils/scheduler1.0/PortDevice'



const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  device: {
    type: Object,
    required: false,
  }
})

import { ref, onMounted, onUnmounted } from 'vue'

const stationColor = ref('#bdbdbd')
let intervalId: number | undefined

function updateColor() {

  switch (props.device?.status) {
    case 'idle': stationColor.value = '#2196f3'; break
    case 'waiting': stationColor.value = '#ffeb3b'; break
    case 'loading': stationColor.value = '#ff9800'; break
    case 'unloading': stationColor.value = '#f44336'; break
    case 'full': stationColor.value = '#673ab7'; break
    case 'empty': stationColor.value = '#9e9e9e'; break
    default: stationColor.value = '#bdbdbd'
  }
}

onMounted(() => {
  updateColor()
  intervalId = window.setInterval(updateColor, 100)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

</script>

