<template>
    <div class="h-screen w-full flex flex-col items-center justify-around">
        <p class="text-[70px]" style="font-family: 'tel'; color: #18ccf5; text-shadow: 0 0 16px #0a6fa6, 0 0 32px #18ccf5;">小车调度仿真系统</p>
        <div class="flex items-center justify-around w-full text-white">
            <!-- <button class="button-diy w-[150px] h-[35px] flex justify-center items-center border border-[#c6d8d9] rounded-[35px] mb-5 cursor-pointer transition duration-300 hover:shadow-[0_0_6px_#91b8c1] hover:scale-105">
                <div class="w-[94%] h-[77%] flex justify-center items-center border-2 border-[#91b8c1] rounded-[21px] bg-[#91b8c187] text-white text-[14px] transition duration-300 hover:shadow-[0_0_3px_#18ccf5]">
                    <p class="ml-[5px]">任务一</p>
                </div>
            </button>
            <button class="button-diy w-[150px] h-[35px] flex justify-center items-center border border-[#c6d8d9] rounded-[35px] mb-5 cursor-pointer transition duration-300 hover:shadow-[0_0_6px_#91b8c1] hover:scale-105 text-[14px] text-white">
                <div class="w-[94%] h-[77%] flex justify-center items-center border-2 border-[#91b8c1] rounded-[21px] bg-[#91b8c187] text-white text-[14px] transition duration-300 hover:shadow-[0_0_3px_#18ccf5]">
                    <p class="ml-[5px]">任务二</p>
                </div>
            </button>
            <button class="button-diy w-[150px] h-[35px] flex justify-center items-center border border-[#c6d8d9] rounded-[35px] mb-5 cursor-pointer transition duration-300 hover:shadow-[0_0_6px_#91b8c1] hover:scale-105 text-[14px] text-white">
                <div class="w-[94%] h-[77%] flex justify-center items-center border-2 border-[#91b8c1] rounded-[21px] bg-[#91b8c187] text-white text-[14px] transition duration-300 hover:shadow-[0_0_3px_#18ccf5]">
                    <p class="ml-[5px]">自定义任务</p>
                </div>
            </button> -->
            <dv-button
                :bg="false"
                border="Border6"
                @click="console.log('click')"
                class="transition-transform duration-200 hover:scale-105"
            >任务一</dv-button>
            <dv-button
                :bg="false"
                border="Border6"
                @click="console.log('click')"
                class="transition-transform duration-200 hover:scale-105"
            >任务二</dv-button>
            <dv-button
                :bg="false"
                border="Border6"
                @click="console.log('click')"
                class="transition-transform duration-200 hover:scale-105"
            >自定义任务</dv-button>
        </div>
    </div>
</template>

<script setup>

</script>

