<template>
  <div class="h-screen w-full flex flex-col items-center justify-around">
    <p
      class="text-[70px]"
      style="
        font-family: 'tel';
        color: #18ccf5;
        text-shadow:
          0 0 16px #0a6fa6,
          0 0 32px #18ccf5;
      "
    >
      小车调度仿真系统
    </p>
    <div class="flex items-center justify-around w-full text-white">
      <dv-button
        :bg="false"
        border="Border6"
        @click="console.log('click')"
        class="transition-transform duration-200 hover:scale-105"
        >任务一</dv-button
      >
      <dv-button
        :bg="false"
        border="Border6"
        @click="test2Start"
        class="transition-transform duration-200 hover:scale-105"
        >任务二</dv-button
      >
      <dv-button
        :bg="false"
        border="Border6"
        @click="visCar = !visCar"
        class="transition-transform duration-200 hover:scale-105"
        >自定义任务</dv-button
      >
    </div>
  </div>
    <TestCar v-if="visCar" :changeVis="changeVis" />

</template>

<script setup lang="ts">
import TestCar from '@/components/TestCar.vue'
import { ref } from 'vue'
import { task2 } from '@/utils/senseData'
import store from '@/store'
import { useRouter } from 'vue-router'


const router = useRouter()
const setTast = (value: any) => store.commit('setTestList', value)
const setCarCount = (value: any) => store.commit('setCarCount', value)

const test2Start = () => {
  setTast(task2)
  setCarCount(2)
  router.push('/scene')
}
const visCar = ref(false)
const changeVis = (val: boolean) => {
  visCar.value = val
}
</script>
