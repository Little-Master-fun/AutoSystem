<script setup lang="ts">
import { RouterView } from 'vue-router'
import TestCar from '@/components/TestCar.vue'
import { ref } from 'vue'
import { Document, Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue'

const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<template>
  <div class="h-screen flex w-full bg-[url('/images/pageBg.png')] bg-cover bg-center bg-no-repeat">
    <!-- <el-menu
      default-active="2"
      class="el-menu-vertical-demo h-screen"
      style="border-right: 0"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
      popper-effect="dark"
      background-color="#2c3e50"
      text-color="#fff"
      active-text-color="#ffd04b"
      router
      unique-opened
      :default-openeds="['1']"
    >
      <el-menu-item index="1">
        <el-icon><icon-menu /></el-icon>
        <template #title>主页面</template>
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><icon-menu /></el-icon>
        <template #title>设置任务</template>
      </el-menu-item>
      <el-menu-item index="3">
        <el-icon><document /></el-icon>
        <template #title>数据展示</template>
      </el-menu-item>
      <el-menu-item index="4">
        <el-icon><setting /></el-icon>
        <template #title>图表可视化</template>
      </el-menu-item>
    </el-menu>
 -->
    <div class="flex-1 h-screen overflow-auto">
      <el-scrollbar height="100vh">
        <RouterView />
      </el-scrollbar>
    </div>
  </div>
</template>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
