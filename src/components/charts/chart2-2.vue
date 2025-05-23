<template>
  <div class="h-full w-full flex flex-col justify-center items-center">
    <div class="text-white flex items-center justify-start w-full pl-3">
      <el-icon color="#18ccf5"><DataLine /></el-icon>
      <p style="font-family: 'tel'">各站口状态</p>
      <dv-decoration1 style="width: 30%; height: 20px" />
    </div>
    <div class="h-[80%] w-full flex justify-center items-center">
      <el-scrollbar height="100%" class="w-[95%]">
        <p class="text-white text-[12px] mb-2"></p>
        <table class="min-w-full bg-[#181c2f] text-white border-collapse">
          <thead class="sticky top-0 bg-[#23284a]">
            <tr>
              <th class="px-2 py-1 border-b border-[#2a2f4d] text-[12px] w-20">站口ID</th>
              <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-32">类型</th>
              <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-32">状态</th>
              <th class="px-4 py-1 border-b border-[#2a2f4d] text-[12px] w-16">物料</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in rows" :key="'assigned-' + idx" class="hover:bg-[#23284a]">
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ idx+1 }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row[0] }}</td>
              <td class="px-4 py-2 border-b border-[#2a2f4d] text-center">{{ row[1] }}</td>
              <td
                class="px-4 py-2 border-b border-[#2a2f4d] text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] text-green-500"
              >
                {{ row[2] }}
              </td>
            </tr>
          </tbody>
        </table>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataLine } from '@element-plus/icons-vue'
import { getDeviceStatusById, getDeviceMap } from '@/utils/scheduler1.0/PortDevice'
import { onMounted, reactive, ref } from 'vue'
import type { ScrollBoard } from '@kjgl77/datav-vue3'

const rows = ref<any[]>([])

onMounted(() => {
    const deviceMap = getDeviceMap()

  setInterval(() => {
    rows.value = Array.from(deviceMap.values()).map((device) => {
      return [
        {
          inlet: '进货口',
          outlet: '出货口',
          'in-interface': '进货接口',
          'out-interface': '出货接口',
        }[device.type] || '未知类型',
        {
          idle: '空闲',
          waiting: '等待',
          loading: '上货中',
          unloading: '卸货中',
          full: '有货',
          empty: '没货',
        }[device.status] || '未知状态',
        device.getMaterialId(),
      ]
      
      
    })
  }, 1000)

  // updateRows([['行1列1', '行1列2', '行1列3']])
  // for (let i = 0; i < data.length; i++) {
  //   const deviceId = deviceMap[i]
  //   const status = getDeviceStatusById(deviceId)
  //   data[i][0] = status
  // }
})
</script>
