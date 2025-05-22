<template>
  <div class="h-screen w-full pt-2">
    <!-- 头部 -->
    <div class="flex justify-center w-full">
      <dv-decoration-10 style="width: 20%; height: 5px" />
      <div class="flex justify-around items-center w-[60%]">
        <dv-decoration8 style="width: 30%; height: 50px" :color="['#568aea', '#000000']" />
        <div
          class="flex flex-col items-center justify-center w-[200px] text-center mx-4 relative"
          style="top: 15px"
        >
          <span class="text-white text-3xl" style="font-family: tel">调度系统</span>
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
    </div>
    <!-- 第二行 -->
    <div class="flex justify-center items-center w-full mt-4 flex-col">
      <!-- 2-1 -->
      <div class="flex justify-center items-center w-full h-[40vh]">
        <dv-border-box12 class="flex-1/4 h-full">
          <chart11></chart11>
        </dv-border-box12>
        <dv-border-box12 class="flex-1/3 h-full">
          <chart12></chart12>
        </dv-border-box12>
        <dv-border-box13 class="flex-1/8 h-full">
          <chart13></chart13>
        </dv-border-box13>
      </div>
      <!-- 2-2 -->
      <div class="flex justify-center items-center w-full h-[45vh]">
        <dv-border-box13 class="flex-1/2 h-full">
          <chart21></chart21>
        </dv-border-box13>
        <dv-border-box12 class="flex-1/4 h-full">
          <chart22></chart22>
        </dv-border-box12>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import chart11 from '@/components/charts/chart1-1.vue'
import chart21 from '@/components/charts/chart2-1.vue'
import chart22 from '@/components/charts/chart2-2.vue'
import chart12 from '@/components/charts/chart1-2.vue'
import chart13 from '@/components/charts/chart1-3.vue'

</script>

<style scoped lang="less"></style>
