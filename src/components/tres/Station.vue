<template>
      <!-- 底座 -->
      <TresMesh>
        <TresBoxGeometry :args="[1.1, 0.2, 3.3]" />
        <TresMeshStandardMaterial color="gray" />
      </TresMesh>

      <!-- 左突起 -->
      <TresMesh :position="[-0.4, 0.15, 0]">
        <TresBoxGeometry :args="[0.2, 0.1, 1.1]" />
        <TresMeshStandardMaterial color="gray" />
      </TresMesh>

      <!-- 右突起 -->
      <TresMesh :position="[0.4, 0.15, 0]">
        <TresBoxGeometry :args="[0.2, 0.1, 1.1]" />
        <TresMeshStandardMaterial color="gray" />
      </TresMesh>

</template>

<script setup>

</script>

