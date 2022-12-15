import {KeyFrame, Segment} from '../model/types'

interface Property {
  start: number
  startTime: number
  end: number
  endTime: number
}

export const lerp = (start: number, end: number, t: number) => {
  return (end - start) * t + start
}

export const inverseLerp = (value: number, start: number, end: number) => {
  if (end === start) return 1
  return Math.min(Math.max((value - start) / (end - start), 0), 1)
}
