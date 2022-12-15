import {Segment} from '../../videoeditor/model/types'

export interface Project {
  _id?: string
  name: string
  authorId: string
  projectDuration: number
  width: number
  height: number
  canvasWidth: number
  canvasHeight: number
  trackList: string
  mediaList: string
  trackId: number
  thumbnailUrl: string
  renderedVideoUrl: string
  isRendering: boolean
  lastRenderedTime?: string
  updatedAt?: string
}

export interface ProjectQueryResponse {
  _id: string
  name: string
  authorId: string
  width: number
  height: number
  canvasWidth: number
  canvasHeight: number
  projectDuration: number
  trackList: string
  mediaList: string
  trackId: number
  thumbnailUrl: string
  updatedAt: string
  renderedVideoUrl: string
  lastRenderedTime?: string
  isRendering: boolean
}

export type ProjectsQueryResponse = ProjectQueryResponse[]
