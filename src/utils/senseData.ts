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


export const task2 = [
  { taskId: 1, materialId: 'TP001', type: '入库', fromDevice: 16, toDevice: 1, createTime: Date.now() },
  { taskId: 2, materialId: 'TP002', type: '入库', fromDevice: 16, toDevice: 3, createTime: Date.now() },
  { taskId: 3, materialId: 'TP003', type: '入库', fromDevice: 16, toDevice: 5, createTime: Date.now() },
  { taskId: 4, materialId: 'TP004', type: '入库', fromDevice: 16, toDevice: 7, createTime: Date.now() },
  { taskId: 5, materialId: 'TP005', type: '入库', fromDevice: 16, toDevice: 9, createTime: Date.now() },
  { taskId: 6, materialId: 'TP006', type: '入库', fromDevice: 16, toDevice: 11, createTime: Date.now() },
  { taskId: 7, materialId: 'TP007', type: '入库', fromDevice: 16, toDevice: 1, createTime: Date.now() },
  { taskId: 8, materialId: 'TP008', type: '入库', fromDevice: 16, toDevice: 3, createTime: Date.now() },
  { taskId: 9, materialId: 'TP009', type: '入库', fromDevice: 16, toDevice: 5, createTime: Date.now() },
  { taskId: 10, materialId: 'TP010', type: '入库', fromDevice: 16, toDevice: 7, createTime: Date.now() },
  { taskId: 11, materialId: 'TP011', type: '入库', fromDevice: 16, toDevice: 9, createTime: Date.now() },
  { taskId: 12, materialId: 'TP012', type: '入库', fromDevice: 16, toDevice: 11, createTime: Date.now() },
  { taskId: 13, materialId: 'TP013', type: '入库', fromDevice: 16, toDevice: 1, createTime: Date.now() },
  { taskId: 14, materialId: 'TP014', type: '入库', fromDevice: 16, toDevice: 3, createTime: Date.now() },
  { taskId: 15, materialId: 'TP015', type: '入库', fromDevice: 16, toDevice: 5, createTime: Date.now() },
  { taskId: 16, materialId: 'TP016', type: '入库', fromDevice: 16, toDevice: 7, createTime: Date.now() },
  { taskId: 17, materialId: 'TP017', type: '入库', fromDevice: 16, toDevice: 9, createTime: Date.now() },
  { taskId: 18, materialId: 'TP018', type: '入库', fromDevice: 16, toDevice: 11, createTime: Date.now() },
  { taskId: 19, materialId: 'TP019', type: '入库', fromDevice: 17, toDevice: 1, createTime: Date.now() },
  { taskId: 20, materialId: 'TP020', type: '入库', fromDevice: 17, toDevice: 3, createTime: Date.now() },
  { taskId: 21, materialId: 'TP021', type: '入库', fromDevice: 17, toDevice: 5, createTime: Date.now() },
  { taskId: 22, materialId: 'TP022', type: '入库', fromDevice: 17, toDevice: 7, createTime: Date.now() },
  { taskId: 23, materialId: 'TP023', type: '入库', fromDevice: 17, toDevice: 9, createTime: Date.now() },
  { taskId: 24, materialId: 'TP024', type: '入库', fromDevice: 17, toDevice: 11, createTime: Date.now() },
  { taskId: 25, materialId: 'TP025', type: '入库', fromDevice: 17, toDevice: 1, createTime: Date.now() },
  { taskId: 26, materialId: 'TP026', type: '入库', fromDevice: 17, toDevice: 3, createTime: Date.now() },
  { taskId: 27, materialId: 'TP027', type: '入库', fromDevice: 17, toDevice: 5, createTime: Date.now() },
  { taskId: 28, materialId: 'TP028', type: '入库', fromDevice: 17, toDevice: 7, createTime: Date.now() },
  { taskId: 29, materialId: 'TP029', type: '入库', fromDevice: 17, toDevice: 9, createTime: Date.now() },
  { taskId: 30, materialId: 'TP030', type: '入库', fromDevice: 17, toDevice: 11, createTime: Date.now() },
  { taskId: 31, materialId: 'TP031', type: '入库', fromDevice: 17, toDevice: 1, createTime: Date.now() },
  { taskId: 32, materialId: 'TP032', type: '入库', fromDevice: 17, toDevice: 3, createTime: Date.now() },
  { taskId: 33, materialId: 'TP033', type: '入库', fromDevice: 17, toDevice: 5, createTime: Date.now() },
  { taskId: 34, materialId: 'TP034', type: '入库', fromDevice: 17, toDevice: 7, createTime: Date.now() },
  { taskId: 35, materialId: 'TP035', type: '入库', fromDevice: 17, toDevice: 9, createTime: Date.now() },
  { taskId: 36, materialId: 'TP036', type: '入库', fromDevice: 17, toDevice: 11, createTime: Date.now() },
  { taskId: 37, materialId: 'TP037', type: '入库', fromDevice: 18, toDevice: 1, createTime: Date.now() },
  { taskId: 38, materialId: 'TP038', type: '入库', fromDevice: 18, toDevice: 3, createTime: Date.now() },
  { taskId: 39, materialId: 'TP039', type: '入库', fromDevice: 18, toDevice: 5, createTime: Date.now() },
  { taskId: 40, materialId: 'TP040', type: '入库', fromDevice: 18, toDevice: 7, createTime: Date.now() },
  { taskId: 41, materialId: 'TP041', type: '入库', fromDevice: 18, toDevice: 9, createTime: Date.now() },
  { taskId: 42, materialId: 'TP042', type: '入库', fromDevice: 18, toDevice: 11, createTime: Date.now() },
  { taskId: 43, materialId: 'TP043', type: '入库', fromDevice: 18, toDevice: 1, createTime: Date.now() },
  { taskId: 44, materialId: 'TP044', type: '入库', fromDevice: 18, toDevice: 3, createTime: Date.now() },
  { taskId: 45, materialId: 'TP045', type: '入库', fromDevice: 18, toDevice: 5, createTime: Date.now() },
  { taskId: 46, materialId: 'TP046', type: '入库', fromDevice: 18, toDevice: 7, createTime: Date.now() },
  { taskId: 47, materialId: 'TP047', type: '入库', fromDevice: 18, toDevice: 9, createTime: Date.now() },
  { taskId: 48, materialId: 'TP048', type: '入库', fromDevice: 18, toDevice: 11, createTime: Date.now() },
  { taskId: 49, materialId: 'TP049', type: '入库', fromDevice: 18, toDevice: 1, createTime: Date.now() },
  { taskId: 50, materialId: 'TP050', type: '入库', fromDevice: 18, toDevice: 3, createTime: Date.now() },
  { taskId: 51, materialId: 'TP051', type: '入库', fromDevice: 18, toDevice: 5, createTime: Date.now() },
  { taskId: 52, materialId: 'TP052', type: '入库', fromDevice: 18, toDevice: 7, createTime: Date.now() },
  { taskId: 53, materialId: 'TP053', type: '入库', fromDevice: 18, toDevice: 9, createTime: Date.now() },
  { taskId: 54, materialId: 'TP054', type: '入库', fromDevice: 18, toDevice: 11, createTime: Date.now() },
  { taskId: 55, materialId: 'TP055', type: '出库', fromDevice: 2, toDevice: 13, createTime: Date.now() },
  { taskId: 56, materialId: 'TP056', type: '出库', fromDevice: 2, toDevice: 14, createTime: Date.now() },
  { taskId: 57, materialId: 'TP057', type: '出库', fromDevice: 2, toDevice: 15, createTime: Date.now() },
  { taskId: 58, materialId: 'TP058', type: '出库', fromDevice: 2, toDevice: 13, createTime: Date.now() },
  { taskId: 59, materialId: 'TP059', type: '出库', fromDevice: 2, toDevice: 14, createTime: Date.now() },
  { taskId: 60, materialId: 'TP060', type: '出库', fromDevice: 2, toDevice: 15, createTime: Date.now() },
  { taskId: 61, materialId: 'TP061', type: '出库', fromDevice: 2, toDevice: 13, createTime: Date.now() },
  { taskId: 62, materialId: 'TP062', type: '出库', fromDevice: 2, toDevice: 14, createTime: Date.now() },
  { taskId: 63, materialId: 'TP063', type: '出库', fromDevice: 2, toDevice: 15, createTime: Date.now() },
  { taskId: 64, materialId: 'TP064', type: '出库', fromDevice: 4, toDevice: 13, createTime: Date.now() },
  { taskId: 65, materialId: 'TP065', type: '出库', fromDevice: 4, toDevice: 14, createTime: Date.now() },
  { taskId: 66, materialId: 'TP066', type: '出库', fromDevice: 4, toDevice: 15, createTime: Date.now() },
  { taskId: 67, materialId: 'TP067', type: '出库', fromDevice: 4, toDevice: 13, createTime: Date.now() },
  { taskId: 68, materialId: 'TP068', type: '出库', fromDevice: 4, toDevice: 14, createTime: Date.now() },
  { taskId: 69, materialId: 'TP069', type: '出库', fromDevice: 4, toDevice: 15, createTime: Date.now() },
  { taskId: 70, materialId: 'TP070', type: '出库', fromDevice: 4, toDevice: 13, createTime: Date.now() },
  { taskId: 71, materialId: 'TP071', type: '出库', fromDevice: 4, toDevice: 14, createTime: Date.now() },
  { taskId: 72, materialId: 'TP072', type: '出库', fromDevice: 4, toDevice: 15, createTime: Date.now() },
  { taskId: 73, materialId: 'TP073', type: '出库', fromDevice: 6, toDevice: 13, createTime: Date.now() },
  { taskId: 74, materialId: 'TP074', type: '出库', fromDevice: 6, toDevice: 14, createTime: Date.now() },
  { taskId: 75, materialId: 'TP075', type: '出库', fromDevice: 6, toDevice: 15, createTime: Date.now() },
  { taskId: 76, materialId: 'TP076', type: '出库', fromDevice: 6, toDevice: 13, createTime: Date.now() },
  { taskId: 77, materialId: 'TP077', type: '出库', fromDevice: 6, toDevice: 14, createTime: Date.now() },
  { taskId: 78, materialId: 'TP078', type: '出库', fromDevice: 6, toDevice: 15, createTime: Date.now() },
  { taskId: 79, materialId: 'TP079', type: '出库', fromDevice: 6, toDevice: 13, createTime: Date.now() },
  { taskId: 80, materialId: 'TP080', type: '出库', fromDevice: 6, toDevice: 14, createTime: Date.now() },
  { taskId: 81, materialId: 'TP081', type: '出库', fromDevice: 6, toDevice: 15, createTime: Date.now() },
  { taskId: 82, materialId: 'TP082', type: '出库', fromDevice: 8, toDevice: 13, createTime: Date.now() },
  { taskId: 83, materialId: 'TP083', type: '出库', fromDevice: 8, toDevice: 14, createTime: Date.now() },
  { taskId: 84, materialId: 'TP084', type: '出库', fromDevice: 8, toDevice: 15, createTime: Date.now() },
  { taskId: 85, materialId: 'TP085', type: '出库', fromDevice: 8, toDevice: 13, createTime: Date.now() },
  { taskId: 86, materialId: 'TP086', type: '出库', fromDevice: 8, toDevice: 14, createTime: Date.now() },
  { taskId: 87, materialId: 'TP087', type: '出库', fromDevice: 8, toDevice: 15, createTime: Date.now() },
  { taskId: 88, materialId: 'TP088', type: '出库', fromDevice: 8, toDevice: 13, createTime: Date.now() },
  { taskId: 89, materialId: 'TP089', type: '出库', fromDevice: 8, toDevice: 14, createTime: Date.now() },
  { taskId: 90, materialId: 'TP090', type: '出库', fromDevice: 8, toDevice: 15, createTime: Date.now() },
  { taskId: 91, materialId: 'TP091', type: '出库', fromDevice: 10, toDevice: 13, createTime: Date.now() },
  { taskId: 92, materialId: 'TP092', type: '出库', fromDevice: 10, toDevice: 14, createTime: Date.now() },
  { taskId: 93, materialId: 'TP093', type: '出库', fromDevice: 10, toDevice: 15, createTime: Date.now() },
  { taskId: 94, materialId: 'TP094', type: '出库', fromDevice: 10, toDevice: 13, createTime: Date.now() },
  { taskId: 95, materialId: 'TP095', type: '出库', fromDevice: 10, toDevice: 14, createTime: Date.now() },
  { taskId: 96, materialId: 'TP096', type: '出库', fromDevice: 10, toDevice: 15, createTime: Date.now() },
  { taskId: 97, materialId: 'TP097', type: '出库', fromDevice: 10, toDevice: 13, createTime: Date.now() },
  { taskId: 98, materialId: 'TP098', type: '出库', fromDevice: 10, toDevice: 14, createTime: Date.now() },
  { taskId: 99, materialId: 'TP099', type: '出库', fromDevice: 10, toDevice: 15, createTime: Date.now() },
  { taskId: 100, materialId: 'TP100', type: '出库', fromDevice: 12, toDevice: 13, createTime: Date.now() },
  { taskId: 101, materialId: 'TP101', type: '出库', fromDevice: 12, toDevice: 14, createTime: Date.now() },
  { taskId: 102, materialId: 'TP102', type: '出库', fromDevice: 12, toDevice: 15, createTime: Date.now() },
  { taskId: 103, materialId: 'TP103', type: '出库', fromDevice: 12, toDevice: 13, createTime: Date.now() },
  { taskId: 104, materialId: 'TP104', type: '出库', fromDevice: 12, toDevice: 14, createTime: Date.now() },
  { taskId: 105, materialId: 'TP105', type: '出库', fromDevice: 12, toDevice: 15, createTime: Date.now() },
  { taskId: 106, materialId: 'TP106', type: '出库', fromDevice: 12, toDevice: 13, createTime: Date.now() },
  { taskId: 107, materialId: 'TP107', type: '出库', fromDevice: 12, toDevice: 14, createTime: Date.now() },
  { taskId: 108, materialId: 'TP108', type: '出库', fromDevice: 12, toDevice: 15, createTime: Date.now() },
]