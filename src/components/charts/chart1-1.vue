<template>
  <div class="h-full w-full flex flex-col justify-center items-center">
    <div class="text-white flex items-center justify-start w-full pl-3">
      <el-icon color="#18ccf5"><DataLine /></el-icon>
      <p style="font-family: 'tel'">任务列表</p>
      <dv-decoration3 style="width: 30%; height: 25px" />
    </div>
    <div class="h-[80%] w-full flex items-center justify-center">
      <el-scrollbar height="100%" class="w-[95%]">
        
{{ testlist }}        <table class="min-w-full bg-[#181c2f] text-white border-collapse">
          <thead class="sticky top-0 bg-[#23284a]">
            <tr>
              <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-3">任务类型</th>
              <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px]">取货点</th>
              <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px]">目标点</th>
              <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px]">进度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in tableData" :key="idx" class="hover:bg-[#23284a]">
              <td class="px-4 py-2 border-b border-[#2a2f4d]">{{ row.name }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d]">{{ row.date }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d]">{{ row.address }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d]">{{ row.address }}</td>
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

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Greles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 18ngeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189les',
  },
]

const testlist = ref([])
onMounted(() => {
  const scheduler = computed(() => store.getters.scheduler)

  const updateTestList = () => {
    const testlists = scheduler.value.getTaskDetails()
    testlist.value = testlists
  }

  updateTestList()
  setInterval(updateTestList, 1000)
  
})
</script>
