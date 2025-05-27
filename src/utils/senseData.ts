import { Vector3 } from 'three'

const createTrack = (R: number, L = 40, arcSegments = 50) => {
  const points = []
  for (let i = 0; i <= arcSegments; i++) {
    let angle = Math.PI / 2 + (i / arcSegments) * Math.PI
    points.push(new Vector3(-L / 2 + R * Math.cos(angle), 0, R * Math.sin(angle)))
  }
  for (let i = 0; i <= arcSegments; i++) {
    let angle = (3 * Math.PI) / 2 + (i / arcSegments) * Math.PI
    points.push(new Vector3(L / 2 + R * Math.cos(angle), 0, R * Math.sin(angle)))
  }
  return points
}

export const inittrackinner = () => createTrack(2.5)
export const inittrackout = () => createTrack(3.7)
export const inittrackocar = () => {
  const points = createTrack(3.1)
  points.push(new Vector3(-40 / 2, 0, 3.1))
  return points
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
  for (let i = 1; i < trackLengths.length; i++) {
    if (dist <= trackLengths[i]) {
      const t = (dist - trackLengths[i - 1]) / (trackLengths[i] - trackLengths[i - 1])
      return trackPoints[i - 1].clone().lerp(trackPoints[i], t)
    }
  }
  return trackPoints[0].clone()
}

interface Task {
  taskId: number
  materialId: string
  type: '入库' | '出库'
  fromDevice: number
  toDevice: number
  createTime: number
}

export const task2: Task[] = []
let taskId = 1

// 入库任务
for (let fromDevice = 16; fromDevice <= 18; fromDevice++)
  for (let toDevice = 1; toDevice <= 11; toDevice += 2)
    for (let i = 0; i < 3; i++)
      task2.push({
        taskId: taskId,
        materialId: `TP${taskId.toString().padStart(3, '0')}`,
        type: '入库',
        fromDevice,
        toDevice,
        createTime: Date.now(),
      }), taskId++

// 出库任务
for (let fromDevice = 2; fromDevice <= 12; fromDevice += 2)
  for (let toDevice = 13; toDevice <= 15; toDevice++)
    for (let i = 0; i < 3; i++)
      task2.push({
        taskId: taskId,
        materialId: `TP${taskId.toString().padStart(3, '0')}`,
        type: '出库',
        fromDevice,
        toDevice,
        createTime: Date.now(),
      }), taskId++

// 新的任务 task3
export const task3: Task[] = []
let task3Id = 1

// 出库任务: 16->11/9, 17->5/7, 18->1/3，todevice交替
const outMap: Record<number, number[]> = {
  16: [11, 9],
  17: [5, 7],
  18: [1, 3],
}
for (const fromDevice of [16, 17, 18]) {
  const toDevices = outMap[fromDevice]
  for (let i = 0; i < 6; i++) { // 6 tasks per fromDevice, alternating
    task3.push({
      taskId: task3Id,
      materialId: `T3P${task3Id.toString().padStart(3, '0')}`,
      type: '出库',
      fromDevice,
      toDevice: toDevices[i % 2],
      createTime: Date.now(),
    })
    task3Id++
  }
}

// 入库任务: 2/4->13, 6/8->14, 10/12->15，fromDevice交替
const inMap: Record<number, number> = {
  2: 13, 4: 13,
  6: 14, 8: 14,
  10: 15, 12: 15,
}
const inFromDevices = [2, 4, 6, 8, 10, 12]
for (let i = 0; i < inFromDevices.length; i += 2) {
  const from1 = inFromDevices[i]
  const from2 = inFromDevices[i + 1]
  const toDevice = inMap[from1]
  for (let j = 0; j < 6; j++) { // 6 tasks per pair, alternating fromDevice
    task3.push({
      taskId: task3Id,
      materialId: `T3P${task3Id.toString().padStart(3, '0')}`,
      type: '入库',
      fromDevice: j % 2 === 0 ? from1 : from2,
      toDevice,
      createTime: Date.now(),
    })
    task3Id++
  }
}
