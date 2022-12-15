import {Image} from 'gif-viewer/lib/types'
import Konva from 'konva'

export type ElementType =
  | HTMLVideoElement
  | HTMLImageElement
  | HTMLParagraphElement
  | HTMLAudioElement

export interface Source {
  element: ElementType
  isMute: boolean
  isAlwaysUnmute?: boolean
  id: number
}
export interface Media {
  source: Source
  file: string
  thumbnail: string
  frameBackground?: string
  fontSize?: number
  frameCompletion?: number
  gifImages?: Image[]
  waveForm?: string
}

export interface Segment {
  media: Media
  start: number
  duration: number
  mediaStart: number
  keyframe: KeyFrame
}

export interface KeyFrame {
  start: number // Offset from segment start
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  trimLeft?: number
  trimRight?: number
  trimTop?: number
  trimBottom?: number
  startX?: number
  startY?: number
  width?: number
  height?: number
  rotation?: number
  zIndex?: number
  opacity?: number
  textColor?: string
  backgroundColor?: string
  textAlign?: string
  verticalAlign?: string
  strokeWidth?: number
  stroke?: string
  fontStyle?: string
  textDecoration?: string
  fontFamily?: string
}

export interface SegmentID {
  index: number
  track: number
}

export interface Project {
  _id: string
  name: string
  width: number
  height: number
  framerate: number
  duration: number
}

export interface Point {
  x: number
  y: number
}

export interface Img {
  x: number
  y: number
  src: string
  width: number
  height: number
}

export type SelectedNodeType = Konva.Image | Konva.Group | undefined
