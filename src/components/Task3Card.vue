<template>
  <div
    class="p-5 border border-gray-200 rounded-lg w-56 bg-gray-50 z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg "
  >
    <el-icon class="absolute top-[-50px] right-[-200px] cursor-pointer" color="white" @click="props.changeVis(false)"><Close /></el-icon>
    <div class="text-lg mb-4 font-bold text-gray-800">选择小车数量</div>
    <div class="flex items-center justify-center">
      <select
        v-model="count"
        placeholder="选择小车数量"
        class="px-3 py-2 w-full rounded border border-gray-300 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option :value="3" default>3</option>
        <option :value="5">5</option>
        <option :value="7">7</option>
      </select>
    </div>
    <div class="mt-4">
      <button
        @click="beginSystem()"
        class="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        开始仿真
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import store from '@/store'
import { task3 } from '@/utils/senseData'
import { useRouter } from 'vue-router'
const props = defineProps<{
    changeVis: (val: boolean) => void
}>()

const router = useRouter()
const count = ref(3)
const setCarCount = (value: any) => store.commit('setCarCount', value)
const setTast = (value: any) => store.commit('setTestList', value)

function beginSystem() {
  setTast(task3)
  setCarCount(count.value)
  router.push('/scene')
}
</script>
