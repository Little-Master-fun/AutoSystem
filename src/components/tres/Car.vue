<template>
      <TresMesh ref="carRefs" v-for="(car, index) in controllers" :key="car.id">
        <TresBoxGeometry :args="[1.2, 0.2, 1.2]" />
        <TresMeshStandardMaterial color="#2196f3" />
      </TresMesh>

</template>

<script setup lang="ts">
import { onMounted, computed, shallowRef, ref } from 'vue'
import { useLoop } from '@tresjs/core'
import { getPositionOnTrack } from '@/utils/senseData.ts'
import { CarController } from '@/utils/scheduler1.0/CarController'

const props = defineProps<{
  controllers: CarController[]
}>()

// 存储子组件引用，必须是数组
const carRefs = shallowRef<any[]>([])
const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  for (let i = 0; i < props.controllers.length; i++) {
    const car = props.controllers[i]
    const carRef = carRefs.value[i]
    if (!carRef) continue

    const pos = getPositionOnTrack(car.getDisplayProps().positionInMeters)
    carRef.position.set(pos.x, pos.y, pos.z)

    // 更新状态（如果你要显示）
  }
})

</script>

<style scoped lang='less'>

</style>