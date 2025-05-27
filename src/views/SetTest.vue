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
        @click="test1Start"
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
        @click="changeVis3(true)"
        class="transition-transform duration-200 hover:scale-105"
        >任务二Plus</dv-button
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
  <Task2Card v-if="task2Card" :changeVis="changeVis2"></Task2Card>
  <Task3Card v-if="task3Card" :changeVis="changeVis3"></Task3Card>
</template>

<script setup lang="ts">
import TestCar from '@/components/TestCar.vue'
import { ref } from 'vue'
import { task2 } from '@/utils/senseData'
import store from '@/store'
import { useRouter } from 'vue-router'
import Task2Card from '@/components/Task2Card.vue'
import Task3Card from '@/components/Task3Card.vue'

const router = useRouter()
const setTast = (value: any) => store.commit('setTestList', value)
const setCarCount = (value: any) => store.commit('setCarCount', value)
const settaskcont = (value: any) => store.commit('setTask', value)
const task2Card = ref(false)
const task3Card = ref(false)

const test2Start = () => {
  task2Card.value = true
}
const test1Start = () => {
  setTast([])
  setCarCount(3)
  settaskcont(1)
  router.push('/scene')
}
const changeVis2 = (val: boolean) => {
  task2Card.value = val
}
const changeVis3 = (val: boolean) => {
  task3Card.value = val
}

const visCar = ref(false)
const changeVis = (val: boolean) => {
  visCar.value = val
}
</script>
