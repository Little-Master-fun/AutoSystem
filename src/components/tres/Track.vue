<template>
  <TresGroup>
    <primitive :object="new Line(geometry, material)" />
    <primitive :object="new Line(geometryo, material)" />
  </TresGroup>
</template>

<script setup>
import { BufferGeometry, Line, LineBasicMaterial, CatmullRomCurve3 } from 'three'

import { inittrackinner, inittrackout } from '@/utils/senseData'

//轨道设置函数
const trackPoints = inittrackinner()
const trackPointout = inittrackout()
const curve = new CatmullRomCurve3(trackPoints, true)
const geometry = new BufferGeometry().setFromPoints(curve.getPoints(300))
const material = new LineBasicMaterial({ color: 0x0077ff })
const curveo = new CatmullRomCurve3(trackPointout, true)
const geometryo = new BufferGeometry().setFromPoints(curveo.getPoints(300))
</script>
