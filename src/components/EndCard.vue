<template>
    <div class="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg text-center">
        <h2 class="text-2xl mb-3 text-blue-500 font-bold">任务已结束</h2>
        <p class="text-base mb-6 text-gray-600">感谢您的使用，任务已圆满完成！</p>
        <slot>
            <button
                class="px-6 py-2 text-base bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
                @click=""
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

const router = useRouter();


const over = () => {
    router.push('/over');
};
</script>
