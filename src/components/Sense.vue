<template>
  <TresCanvas v-bind="gl">
    <TresPerspectiveCamera :position="[4, 3, 9]" />
    <OrbitControls />
    <Suspense> </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="1.2" cast-shadow />
    <TresGridHelper />
  </TresCanvas>
</template>

<script setup lang="ts">
import { BasicShadowMap, SRGBColorSpace, NoToneMapping, LoaderUtils } from 'three'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'

const gl = {
  clearColor: '#82DBC5',
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
};

</script>

<style scoped lang="less"></style>
