<template>
  <div class="h-full w-full flex flex-col justify-center items-center">
    <div class="text-white flex items-center justify-start w-full pl-3">
      <el-icon color="#18ccf5"><DataLine /></el-icon>
      <p style="font-family: 'tel'">仿真窗口</p>
      <dv-decoration1 style="width: 30%; height: 20px" />
    </div>
    <div class="h-[80%] w-[95%] rounded-2xl overflow-hidden">
        <Sense />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataLine } from '@element-plus/icons-vue'
import Sense from '../Sense.vue';
</script>
