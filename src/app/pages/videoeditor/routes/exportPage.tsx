import {ElementType, Segment, Source} from '../model/types'
import {useEffect, useState, useRef} from 'react'
import Konva from 'konva'
import useProject from './../../project/helper/index'
import axios from 'axios'
import {API_BASE_URL} from '../../project/core/_request'
import {Stage, Layer} from 'react-konva'
import {checkMediaType, GifPlayer} from '../helper'
import {Image} from 'gif-viewer/lib/types'
import {useNavigate, useParams} from 'react-router-dom'

export default function ExportPage(props: {
  trackList: Segment[][]
  canvasHeight: number
  canvasWidth: number
  projectDuration: number
  ratio: number
  baseWidth: number
  baseHeight: number
  renderedVideoUrl: string | undefined
  setRenderedVideoUrl: (renderedVideoUrl: string | undefined) => void
  saveProject: (isRendering: boolean) => Promise<any>
  renderFrame: (update: boolean) => Promise<void>
}) {
  const currentTime = useRef(0)
  const frameIndex = useRef(0)
  const layerRef = useRef(new Konva.Layer())
  const [isRenderingFinished, setIsRenderingFinished] = useState<boolean | undefined>(undefined)
  const [videoUrl, setVideoUrl] = useState('')
  const [progress, setProgress] = useState(0)
  const elementMap = useRef(new Map<number, any>())
  const navigate = useNavigate()
  const {id} = useParams()

  useEffect(() => {
    for (let i = 0; i < props.trackList.length - 1; i++)
      for (let j = 0; j < props.trackList[i].length; j++) {
        const segment = props.trackList[i][j]
        const source = segment.media.source as Source
        const element = source.element as ElementType
        if (element instanceof HTMLVideoElement || element instanceof HTMLImageElement) {
          let img: any
          if (segment.media.file.endsWith('.gif')) {
            const canvas = document.createElement('canvas') as HTMLCanvasElement
            img = new Konva.Image({
              id: `${i}-${j}`,
              image: canvas,
              draggable: true,
              x: props.trackList[i][j].keyframe.x,
              y: props.trackList[i][j].keyframe.y,
              scaleX: props.trackList[i][j].keyframe.scaleX,
              scaleY: props.trackList[i][j].keyframe.scaleY,
              rotation: props.trackList[i][j].keyframe.rotation,
              opacity: props.trackList[i][j].keyframe.opacity,
              width: props.trackList[i][j].keyframe.width as number,
              height: props.trackList[i][j].keyframe.height as number,
            })
            const gifplayer = new GifPlayer(segment.media.gifImages as Image[], canvas, img)
            gifplayer.play()
          } else {
            img = new Konva.Image({
              id: `${i}-${j}`,
              image: element,
              draggable: true,
              x: props.trackList[i][j].keyframe.x,
              y: props.trackList[i][j].keyframe.y,
              scaleX: props.trackList[i][j].keyframe.scaleX,
              scaleY: props.trackList[i][j].keyframe.scaleY,
              rotation: props.trackList[i][j].keyframe.rotation,
              opacity: props.trackList[i][j].keyframe.opacity,
              width: props.trackList[i][j].keyframe.width as number,
              height: props.trackList[i][j].keyframe.height as number,
            })
          }
          if (element instanceof HTMLVideoElement) {
            img.stroke('gray')
            img.strokeWidth(props.canvasWidth)
            img.draggable(false)
          }
          layerRef.current?.add(img)
          img.zIndex(props.trackList[i][j].keyframe.zIndex as number)

          elementMap.current.set(source.id, img)
        } else if (element instanceof HTMLParagraphElement) {
          const group = new Konva.Group({
            id: `${i}-${j}`,
            x: props.trackList[i][j].keyframe.x,
            y: props.trackList[i][j].keyframe.y,
            width: props.trackList[i][j].keyframe.width,
            rotation: props.trackList[i][j].keyframe.rotation,
            opacity: props.trackList[i][j].keyframe.opacity,
            draggable: true,
          })
          const textNode = new Konva.Text({
            fill: props.trackList[i][j].keyframe.textColor as string,
            text: props.trackList[i][j].media.thumbnail as string,
            width: props.trackList[i][j].keyframe.width,
            draggable: false,
            fontSize: props.trackList[i][j].media.fontSize,
            align: props.trackList[i][j].keyframe.textAlign,
          })
          const rect = new Konva.Rect({
            fill: props.trackList[i][j].keyframe.backgroundColor as string,
            draggable: false,
            width: props.trackList[i][j].keyframe.width,
            height: textNode.height(),
          })
          layerRef.current?.add(group)
          group.add(rect)
          group.add(textNode)
          group.zIndex(props.trackList[i][j].keyframe.zIndex as number)
          elementMap.current.set(source.id, group)
        }

        if (
          currentTime.current >= segment.start &&
          currentTime.current < segment.start + segment.duration
        ) {
          if (element instanceof HTMLVideoElement) {
            const video = elementMap.current.get(source.id) as Konva.Image
            video.show()
          } else if (element instanceof HTMLParagraphElement) {
            const text = elementMap.current.get(source.id) as Konva.Group
            text.show()
          } else if (element instanceof HTMLImageElement) {
            const image = elementMap.current.get(source.id) as Konva.Image
            image.show()
          }
        } else {
          if (element instanceof HTMLVideoElement) {
            const video = elementMap.current.get(source.id) as Konva.Image
            video.hide()
          } else if (element instanceof HTMLParagraphElement) {
            const text = elementMap.current.get(source.id) as Konva.Group
            text.hide()
          } else if (element instanceof HTMLImageElement) {
            const image = elementMap.current.get(source.id) as Konva.Image
            image.hide()
          }
        }
      }
  }, [props.trackList])

  useEffect(() => {
    setVideoUrl(props.renderedVideoUrl as string)
    if (props.renderedVideoUrl !== undefined && props.renderedVideoUrl !== '') {
      setIsRenderingFinished(true)
    }
  }, [props.renderedVideoUrl])

  const renderFrame = async () => {
    if (props.projectDuration <= currentTime.current) {
      // const res = await axios.post(`${API_BASE_URL}/api/media/create_video`, {
      //   projectId: currentProject?._id,
      //   frameCount: frameIndex.current,
      //   projectDuration: props.projectDuration,
      //   medias: props.trackList
      //     .reduce((previousValue, currentValue) => previousValue.concat(currentValue))
      //     .filter(
      //       (item) =>
      //         checkMediaType(item.media.file) === 'audio' ||
      //         checkMediaType(item.media.file) === 'video'
      //     )
      //     .map((item) => {
      //       return {
      //         start: item.start / 1000,
      //         mediaStart: item.mediaStart / 1000,
      //         duration: item.duration / 1000,
      //         type: checkMediaType(item.media.file),
      //         path: item.media.file,
      //       }
      //     }),
      // })

      // await axios.post(`${API_BASE_URL}/api/media/handle_frame`, {
      //   projectId: currentProject?._id,
      // })

      // setVideoUrl(`${API_BASE_URL}/media/${currentProject?._id}/video/${res.data.videoUrl}`)
      setIsRenderingFinished(true)
      return
    }

    for (let i = 0; i < props.trackList.length - 1; i++)
      for (let j = 0; j < props.trackList[i].length; j++) {
        const segment = props.trackList[i][j]
        const source = segment.media.source as Source
        const element = source.element

        if (
          currentTime.current >= segment.start &&
          currentTime.current < segment.start + segment.duration
        ) {
          if (element instanceof HTMLVideoElement) {
            const video = elementMap.current.get(source.id) as Konva.Image
            element.currentTime = currentTime.current / 1000
            await new Promise<void>((resolve) => {
              element.ontimeupdate = () => resolve()
            })
            video.show()
            video.image(element)
          } else if (element instanceof HTMLParagraphElement) {
            const text = elementMap.current.get(source.id) as Konva.Group
            text.show()
          } else if (element instanceof HTMLImageElement) {
            const image = elementMap.current.get(source.id) as Konva.Image
            image.show()
          }
        } else {
          if (element instanceof HTMLVideoElement) {
            const video = elementMap.current.get(source.id) as Konva.Image
            video.hide()
          } else if (element instanceof HTMLParagraphElement) {
            const text = elementMap.current.get(source.id) as Konva.Group
            text.hide()
          } else if (element instanceof HTMLImageElement) {
            const image = elementMap.current.get(source.id) as Konva.Image
            image.hide()
          }
        }
      }

    currentTime.current += 2000 / 3
    setProgress(Math.round((currentTime.current / props.projectDuration) * 100))
    frameIndex.current++
    renderFrame()
  }

  const render = async () => {
    setIsRenderingFinished(false)
    renderFrame()
    const res = await axios.post(`${API_BASE_URL}/api/media/create_video`, {
      projectId: id,
      medias: await Promise.all(
        props.trackList
          .reduce((previousValue, currentValue) => previousValue.concat(currentValue))
          .map(async (item) => {
            let path = item.media.file
            const rotation = item.keyframe.rotation
            const opacity = item.keyframe.opacity ?? 1
            let width = Math.round(
              (item.keyframe.width as number) * props.ratio * (item.keyframe.scaleX as number)
            )
            let height = Math.round(
              (item.keyframe.height as number) * props.ratio * (item.keyframe.scaleY as number)
            )
            const x = (item.keyframe.x as number) * props.ratio ?? 0
            const y = (item.keyframe.y as number) * props.ratio ?? 0
            if (checkMediaType(item.media.file) === 'text') {
              const group = new Konva.Group({
                width: (item.keyframe.width as number) * props.ratio,
              })
              const textNode = new Konva.Text({
                fill: item.keyframe.textColor as string,
                text: item.media.thumbnail as string,
                width: (item.keyframe.width as number) * props.ratio,
                fontSize: (item.media.fontSize as number) * props.ratio,
                align: item.keyframe.textAlign,
              })
              const rect = new Konva.Rect({
                fill: item.keyframe.backgroundColor as string,
                width: (item.keyframe.width as number) * props.ratio,
                height: textNode.height(),
              })
              group.add(rect)
              group.add(textNode)
              const dataUrl = group.toDataURL()
              const res = await axios.post(`${API_BASE_URL}/api/media/create_image`, {
                projectId: id,
                dataUrl,
              })
              path = res.data.imageUrl
              width = group.width()
              height = group.height()
            }

            return {
              start: item.start / 1000,
              mediaStart: item.mediaStart / 1000,
              duration: item.duration / 1000,
              type: checkMediaType(item.media.file),
              width,
              height,
              rotation,
              x,
              y,
              opacity,
              path,
            }
          })
      ),
      projectDuration: props.projectDuration / 1000,
      width: props.baseWidth,
      height: props.baseHeight,
    })
    setVideoUrl(`${API_BASE_URL}/media/${id}/video/${res.data.videoUrl}`)
    props.setRenderedVideoUrl(`${API_BASE_URL}/media/${id}/video/${res.data.videoUrl}`)
    setIsRenderingFinished(true)
  }

  const download = async () => {
    const blob = await fetch(videoUrl).then((res) => res.blob())
    const tempUrl = URL.createObjectURL(blob)
    const aTag = document.createElement('a') as HTMLAnchorElement
    aTag.href = tempUrl
    aTag.download = Date.now().toString()

    document.body.appendChild(aTag)

    aTag.click()
    URL.revokeObjectURL(tempUrl)
    aTag.remove()
  }

  const backToProject = async () => {
    navigate(`/apps/video-editor/${id}/editor?type=video`)
  }

  return (
    <div className=''>
      <div className='row d-flex justify-content-center mb-6'>
        <button
          style={{width: 200}}
          className='btn btn-secondary d-flex justify-content-center align-items-center mx-5'
          onClick={backToProject}
        >
          <i className='bi bi-arrow-left fs-6'></i>
          <span>
            <b>Edit this project</b>
          </span>
        </button>
        {(!isRenderingFinished || isRenderingFinished === undefined) && (
          <button
            style={{width: 150}}
            className='btn btn-success d-flex justify-content-center mx-5'
            onClick={render}
          >
            {isRenderingFinished === undefined ? 'Render' : 'Rendering ...'}
          </button>
        )}
        {isRenderingFinished && (
          <>
            <button
              style={{width: 100}}
              className='btn btn-primary d-flex justify-content-center mx-5'
              onClick={download}
            >
              Download
            </button>
          </>
        )}
      </div>

      <div className='row'>
        <div className='d-flex justify-content-center align-items-center position-relative'>
          {isRenderingFinished ? (
            <>
              <video
                crossOrigin='anonymous'
                width={props.canvasWidth}
                height={props.canvasHeight}
                controls
              >
                <source src={videoUrl} type='video/mp4'></source>
              </video>
            </>
          ) : (
            <div className='position-relative'>
              <Stage width={props.canvasWidth} height={props.canvasHeight}>
                <Layer ref={layerRef}></Layer>
              </Stage>
              <div className='position-absolute right-0 w-100' style={{bottom: -25}}>
                {!isRenderingFinished && (
                  <div className='progress' style={{bottom: 20}}>
                    <div
                      className='progress-bar bg-primary'
                      role='progressbar'
                      style={{width: `${progress}%`}}
                      // eslint-disable-next-line jsx-a11y/aria-proptypes
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
