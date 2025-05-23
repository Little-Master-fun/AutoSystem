<template>
  <div class="h-full w-full flex flex-col justify-center items-center">
    <div class="text-white flex items-center justify-start w-full pl-3">
      <el-icon color="#18ccf5"><DataLine /></el-icon>
      <p style="font-family: 'tel'">任务列表</p>
      <dv-decoration3 style="width: 30%; height: 25px" />
    </div>
    <div class="h-[80%] w-full flex items-center justify-center">
      <el-scrollbar height="100%" class="w-[95%]">
        <p class="text-white text-[12px] mb-2">
        </p>
        <table class="min-w-full bg-[#181c2f] text-white border-collapse ">
          <thead class="sticky top-0 bg-[#23284a] ">
            <tr>
                <th class="px-2 py-1 border-b border-[#2a2f4d] text-[12px] w-20">任务类型</th>
                <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-32">取货点</th>
                <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-32">目标点</th>
                <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in assignedTask" :key="'assigned-' + idx" class="hover:bg-[#23284a]">
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.type }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.fromDevice }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.toDevice }}</td>
                <td class="px-4 py-2 border-b border-[#2a2f4d] text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] text-green-500">进行中</td>
            </tr>
            <tr v-for="(row, idx) in testlist" :key="'test-' + idx" class="hover:bg-[#23284a]">
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.type }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.fromDevice }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.toDevice }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">等待中</td>
            </tr>
            <tr v-for="(row, idx) in completedTask" :key="'completed-' + idx" class="hover:bg-[#23284a]">
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.type }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.fromDevice }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row.toDevice }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">已完成</td>
            </tr>
          </tbody>
        </table>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataLine } from '@element-plus/icons-vue'
import store from '@/store'
import { computed, onMounted, ref } from 'vue'

const testlist = ref<any[]>([])
interface AssignedTask {
  type: string
  fromDevice: string
  toDevice: string
}
const assignedTask = ref<AssignedTask[]>([])
const completedTask = ref<any[]>([])

onMounted(() => {
  const scheduler = computed(() => store.getters.scheduler)

  const updateTestList = () => {
    const testlists = scheduler.value.getTaskDetails()
    testlist.value = testlists
    assignedTask.value = scheduler.value.getAssignedTasks()
    completedTask.value = scheduler.value.getCompletedTasks()
    
  }

  updateTestList()
  setInterval(updateTestList, 1000)
})
</script>
