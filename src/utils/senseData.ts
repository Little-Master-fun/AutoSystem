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
