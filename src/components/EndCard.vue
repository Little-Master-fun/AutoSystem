<template>
    <div class="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg text-center">
        <h2 class="text-2xl mb-3 text-blue-500 font-bold">任务已结束</h2>
        <p class="text-base mb-6 text-gray-600">感谢您的使用，任务已圆满完成！</p>
        <slot>
            <button
                class="px-6 py-2 mr-5 text-base bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
                @click="backToHome"
            >
                返回首页
            </button>
            <button
                class="px-6 py-2 text-base bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
                @click="over"
            >
                查看结果
            </button>
        </slot>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import store from '@/store';
import { mkdir,create, BaseDirectory } from '@tauri-apps/plugin-fs'
import { computed } from 'vue';

const router = useRouter();
const scheduler = computed(() => store.state.scheduler);
const allDeviceChangeStatus = computed(() => store.state.allDeviceChangeStatus);

// 格式化设备状态变更详情
const formatDeviceChangeStatus = (changes: any[]) => {
  return changes.map(change => [
    change.devicename,
    change.deviceId,
    change.materialId,
    change.status,
    change.timestamp
  ].join('\t')).join('\n');
};

const formattedDeviceChangeStatus = formatDeviceChangeStatus(allDeviceChangeStatus.value);

// 写入设备状态变更到文件
const writeDeviceChangeStatusToFile = async () => {
  try {
    const now = new Date();
    const dirName = `SchedulerData/${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    await mkdir(dirName, { baseDir: BaseDirectory.Desktop, recursive: true });
    const file = await create(`${dirName}/DeviceStateLog.txt`, { baseDir: BaseDirectory.Desktop });
    await file.write(new TextEncoder().encode(formattedDeviceChangeStatus));
    await file.close();

    console.log('设备状态变更已写入文件');
  } catch (error) {
    console.error('写入设备状态变更文件出错:', error);
  }
};

writeDeviceChangeStatusToFile();

const formatTaskDetails = (tasks: any[]) => {
  return tasks.map(task => [
    task.taskId,
    task.materialId,
    task.type,
    task.fromDevice,
    task.toDevice,
    Math.floor(task.startTime),
    task.carId,
    Math.floor(task.pickUpTime),
    Math.floor(task.dropOffTime),
    Math.floor(task.takenTime)
  ].join('\t')).join('\n');
};

const completedTasks = scheduler.value.getCompletedTaskDetails();
const formattedTaskDetails = formatTaskDetails(completedTasks);

// 写入文件
const writeTaskDetailsToFile = async () => {
  try {
    const now = new Date();
    const dirName = `SchedulerData/${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    await mkdir(dirName, { baseDir: BaseDirectory.Desktop, recursive: true });
    const file = await create(`${dirName}/TaskExeLog.txt`, { baseDir: BaseDirectory.Desktop });
    await file.write(new TextEncoder().encode(formattedTaskDetails));
    await file.close();

    console.log('任务详情已写入文件');
  } catch (error) {
    console.error('写入任务详情文件出错:', error);
  }
};

writeTaskDetailsToFile();

// const createDirectory = async () => {
//   try {
//     const now = new Date();
//     const dirName = `SchedulerData/${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
//     await mkdir(dirName, { baseDir: BaseDirectory.Desktop, recursive: true })
//     console.log('Directory created successfully')
//     createFile(now)
//   } catch (error) {
//     console.error('Error creating directory:', error)
//   }
// }

// const createFile = async (now) => {
//   try {
//     const file = await create(`SchedulerData/${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}/bar.txt`, { baseDir: BaseDirectory.Desktop })
//     await file.write(new TextEncoder().encode('Hello world'))
//     await file.close()
//     console.log('File created successfully')
//   } catch (error) {
//     console.error('Error creating file:', error)
//   }
// }

const backToHome = () => {
  store.commit('resetState')
  router.push('/')
}

const over = () => {
    router.push('/over');
};
</script>
