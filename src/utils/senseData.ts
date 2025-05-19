import { Vector3 } from 'three'

export const inittrackinner = () => {
  const trackPoints = []
  const R = 2.5
  const L = 40
  const arcSegments = 50

  // 左半圆（下 -> 上，逆时针）
  for (let i = 0; i <= arcSegments; i++) {
    const angle = Math.PI / 2 + (i / arcSegments) * Math.PI
    trackPoints.push(new Vector3(-L / 2 + R * Math.cos(angle), 0, R * Math.sin(angle)))
  }
  // 右半圆（上 -> 下）
  for (let i = 0; i <= arcSegments; i++) {
    const angle = (3 * Math.PI) / 2 + (i / arcSegments) * Math.PI
    trackPoints.push(new Vector3(L / 2 + R * Math.cos(angle), 0, R * Math.sin(angle)))
  }
  return trackPoints
}
export const inittrackout = () => {
  const trackPoints = []
  const R = 3.7
  const L = 40
  const arcSegments = 50

  // 左半圆（下 -> 上，逆时针）
  for (let i = 0; i <= arcSegments; i++) {
    const angle = Math.PI / 2 + (i / arcSegments) * Math.PI
    trackPoints.push(new Vector3(-L / 2 + R * Math.cos(angle), 0, R * Math.sin(angle)))
  }
  // 右半圆（上 -> 下）
  for (let i = 0; i <= arcSegments; i++) {
    const angle = (3 * Math.PI) / 2 + (i / arcSegments) * Math.PI
    trackPoints.push(new Vector3(L / 2 + R * Math.cos(angle), 0, R * Math.sin(angle)))
  }
  return trackPoints
}

export const inittrackocar = () => {
  const trackPoints = []
  const R = 3.1
  const L = 40
  const arcSegments = 50

  // 左半圆（下 -> 上，逆时针）
  for (let i = 0; i <= arcSegments; i++) {
    const angle = Math.PI / 2 + (i / arcSegments) * Math.PI
    trackPoints.push(new Vector3(-L / 2 + R * Math.cos(angle), 0, R * Math.sin(angle)))
  }
  // 右半圆（上 -> 下）
  for (let i = 0; i <= arcSegments; i++) {
    const angle = (3 * Math.PI) / 2 + (i / arcSegments) * Math.PI
    trackPoints.push(new Vector3(L / 2 + R * Math.cos(angle), 0, R * Math.sin(angle)))
  }
  trackPoints.push(new Vector3(-L / 2, 0, R))
  return trackPoints
}


export function getPositionOnTrack(dist: number) {
  // 环形轨道
  const trackPoints = inittrackocar()

  const trackLengths = [0]
  let totalLength = 0
  for (let i = 1; i < trackPoints.length; i++) {
    totalLength += trackPoints[i].distanceTo(trackPoints[i - 1])
    trackLengths.push(totalLength)
  }

  dist = dist % totalLength
  // 找到对应的区间
  for (let i = 1; i < trackLengths.length; i++) {
    if (dist <= trackLengths[i]) {
      const t = (dist - trackLengths[i - 1]) / (trackLengths[i] - trackLengths[i - 1])
      // 插值
      return trackPoints[i - 1].clone().lerp(trackPoints[i], t)
    }
  }
  return trackPoints[0].clone()
}
