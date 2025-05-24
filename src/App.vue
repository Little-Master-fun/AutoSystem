<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<template>
  <div class="h-screen flex w-full bg-[url('/images/pageBg.png')] bg-cover bg-center bg-no-repeat">
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
