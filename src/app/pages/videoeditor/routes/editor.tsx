// import styles from './editor.module.css'
import MediaPool from '../components/mediaPool/mediaPool'
import Controls from '../components/controls/controls'
import Timeline from '../components/timeline/timeline'
import { Media, Segment, SegmentID, SelectedNodeType } from '../model/types'
import React, { useState } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import LayerPool from '../components/layer/layer'
import { useLocation, useParams } from 'react-router-dom'
import ImagePool from '../components/imagePool/imagePool'
import ImageEditor from '../components/imageEditor/imageEditor'
import Konva from 'konva'
import Properties from '../components/properties/properties'
import TextEditor from '../components/textPool/textPool'
import AudioPool from '../components/audioPool/audioPool'
import { API_BASE_URL, getProjectById } from '../../project/core/_request'
import axios from 'axios'
import { checkMediaType } from '../helper'
import { useEffect } from 'react'
import { Project } from '../../project/core/_models'
import GifViewer from 'gif-viewer'
import { setProject } from '../../../../features/editor/projectSlice'
import { useAppDispatch } from '../../../hooks'

const Editor = React.forwardRef(
  (
    props: {
      mediaList: Media[]
      setMediaList: (mediaList: Media[]) => void
      trackList: Segment[][]
      setTrackList: (segments: Segment[][]) => void
      addMedia: (file: File[]) => void
      saveProject: (isRendering: boolean) => Promise<any>
      deleteVideo: (media: Media) => void
      playVideo: () => void
      pauseVideo: () => void
      projectWidth: number
      projectHeight: number
      canvasWidth: number
      canvasHeight: number
      projectFramerate: number
      projectDuration: number
      isPlaying: boolean
      currentTime: number
      setCurrentTime: (timestamp: number) => void
      dragAndDrop: (media: Media) => void
      selectedSegment: SegmentID | null
      setSelectedSegment: (selected: SegmentID | null) => void
      updateSegment: (id: SegmentID, segment: Segment) => void
      splitVideo: (timestamp: number) => Promise<void>
      muteMedia: (isMuteAll: boolean, isMuted: boolean) => void
      deleteSelectedSegment: () => void
      deleteCanvasElement: (track: number, index: number) => void
      alwaysUnmuteVideo: (isAlwaysUnmute: boolean) => void
      selectedNode: SelectedNodeType
      setSelectedNode: (selectedNode: SelectedNodeType) => void
      renderedVideoUrl: string | undefined
      setRenderedVideoUrl: (renderedVideoUrl: string | undefined) => void
      setIsPlaying: (isPlaying: boolean) => void
      updateZIndex: () => void
      setStage: (stage: Konva.Stage | undefined) => void
      updateKeyFrames: () => void
      transformer: Konva.Transformer | undefined
      notify: (message: string, type: 'success' | 'failed') => void
      setCanvasHeight: (canvasHeight: number) => void
      setCanvasWidth: (canvasWidth: number) => void
      setProjectDuration: (projectDuration: number) => void
      setProjectWidth: (projectWidth: number) => void
      setProjectHeight: (projectHeight: number) => void
      setTrackId: (trackId: number) => void
    },
    ref: React.Ref<Konva.Layer>
  ) => {
    const [scaleFactor, setScaleFactor] = useState<number>(0.1)

    const [selectedTransformer, setSelectedTransformer] = useState<Konva.Transformer>()

    const { search } = useLocation()

    const { id } = useParams()

    const [isRenderingFinished, setIsRenderingFinished] = useState<boolean>(true)

    const [renderedTime, setRenderedTime] = useState('')

    const [projectName, setProjectName] = useState('')

    const dispatch = useAppDispatch()

    useEffect(() => {
      loadProject().catch((error) => console.log(error))
    }, [])

    const loadProject = async (): Promise<Project | undefined> => {
      try {
        const currentProject = await getProjectById(id as string)
        if (currentProject) {
          if (currentProject) {
            props.setProjectDuration(currentProject.projectDuration)
            props.setProjectWidth(currentProject.width)
            props.setProjectHeight(currentProject.height)
            props.setCanvasHeight(currentProject.canvasHeight)
            props.setCanvasWidth(currentProject.canvasWidth)
            setProjectName(currentProject.name)
            if (currentProject.mediaList !== '') {
              const _mediaList = JSON.parse(currentProject.mediaList) as any[]
              props.setMediaList(
                await Promise.all(
                  _mediaList.map(async (media) => {
                    let elm: any
                    const gifViewer = new GifViewer()
                    if (checkMediaType(media.file) === 'video') {
                      elm = document.createElement('video') as HTMLVideoElement
                      elm.preload = 'auto'

                      elm.crossOrigin = 'anonymous'

                      await new Promise<void>((resolve) => {
                        elm.onloadeddata = () => resolve()
                        elm.src = media.file
                        elm.muted = media.source.isMute
                        elm.currentTime = 0
                      })
                    } else if (checkMediaType(media.file) === 'audio') {
                      elm = document.createElement('audio') as HTMLAudioElement
                      elm.currentTime = 0
                      elm.muted = media.source.isMute
                      elm.crossOrigin = 'anonymous'
                      elm.src = media.file
                    } else if (checkMediaType(media.file) === 'image') {
                      elm = document.createElement('img') as HTMLImageElement
                      elm.crossOrigin = 'anonymous'

                      await new Promise<void>((resolve) => {
                        elm.onload = () => resolve()
                        elm.src = media.file
                      })

                      if (media.file.endsWith('.gif')) {
                        await gifViewer.decode(await fetch(`${media.file}`).then((r) => r.blob()))
                      }
                    } else {
                      elm = document.createElement('p') as HTMLParagraphElement
                    }
                    return {
                      ...media,
                      source: { ...media.source, element: elm },
                      gifImages: gifViewer.gif.images,
                    }
                  })
                )
              )
            }
            if (currentProject.trackList !== '') {
              const _trackList = JSON.parse(currentProject.trackList) as any[][]
              props.setTrackList(
                await Promise.all(
                  _trackList.map(
                    async (tl) =>
                      await Promise.all(
                        tl.map(async (t) => {
                          let elm: any
                          const gifViewer = new GifViewer()
                          if (checkMediaType(t.media.file) === 'video') {
                            elm = document.createElement('video') as HTMLVideoElement
                            elm.preload = 'auto'

                            elm.crossOrigin = 'anonymous'

                            await new Promise<void>((resolve) => {
                              elm.onloadeddata = () => resolve()
                              elm.src = t.media.file
                              elm.currentTime = 0
                              elm.muted = t.media.source.isMute
                            })
                          } else if (checkMediaType(t.media.file) === 'audio') {
                            elm = document.createElement('audio') as HTMLAudioElement
                            elm.currentTime = 0
                            elm.muted = t.media.source.isMute
                            elm.crossOrigin = 'anonymous'
                            elm.src = t.media.file
                          } else if (checkMediaType(t.media.file) === 'image') {
                            elm = document.createElement('img') as HTMLImageElement
                            elm.crossOrigin = 'anonymous'

                            await new Promise<void>((resolve) => {
                              elm.onload = () => resolve()
                              elm.src = t.media.file
                            })

                            if (t.media.file.endsWith('.gif')) {
                              await gifViewer.decode(
                                await fetch(`${t.media.file}`).then((r) => r.blob())
                              )
                            }
                          } else {
                            elm = document.createElement('p') as HTMLParagraphElement
                          }

                          return {
                            ...t,
                            media: {
                              ...t.media,
                              source: { ...t.media.source, element: elm },
                              gifImages: gifViewer.gif.images,
                            },
                          }
                        })
                      )
                  )
                )
              )
            }
            props.setTrackId(currentProject.trackId)
            props.setRenderedVideoUrl(currentProject.renderedVideoUrl)
          }
          dispatch(setProject(currentProject))
          setIsRenderingFinished(!currentProject?.isRendering)
          setRenderedTime(currentProject.lastRenderedTime as string)

          if (currentProject.isRendering) {
            let timerId = window.setInterval(() => { }, 0)
            while (timerId--) clearInterval(timerId)
            const timer = setInterval(async () => {
              const loadedProject = await getProjectById(id as string)
              if (loadedProject) {
                if (!loadedProject.isRendering) {
                  clearInterval(timer)
                  props.setRenderedVideoUrl(loadedProject.renderedVideoUrl)
                  setRenderedTime(loadedProject.lastRenderedTime as string)
                  setIsRenderingFinished(true)
                  props.notify('Rendered successfully', 'success')
                }
              }
            }, 1000)
          }
        }

        return currentProject
      } catch (error) {
        return undefined
      }
    }

    const handleOnDragEnd = (result: any) => {
      if (!result.destination) return

      const { source, destination } = result

      if (source.droppableId === destination.droppableId) {
        const items = props.mediaList.slice()
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)
        props.setMediaList(items)
      } else {
        if (result.source.droppableId === 'texts') {
          props.dragAndDrop(props.mediaList[result.source.index])
        } else {
          props.dragAndDrop(props.mediaList[result.source.index])
          const items = props.mediaList.slice()
          props.setMediaList(items)
        }
      }
    }

    const renderSwitch = () => {
      switch (new URLSearchParams(search).get('type')?.toString() as string) {
        case 'layer':
          return (
            <LayerPool
              trackList={props.trackList}
              setTrackList={props.setTrackList}
              deleteCanvasElement={props.deleteCanvasElement}
            />
          )
        case 'video':
          return (
            <MediaPool
              className=''
              mediaList={props.mediaList}
              setMediaList={props.setMediaList}
              addMedia={props.addMedia}
              deleteVideo={props.deleteVideo}
              dragAndDrop={props.dragAndDrop}
              projectDuration={props.projectDuration}
            />
          )
        case 'text':
          return <TextEditor addMedia={props.addMedia} />
        case 'image':
          return (
            <ImagePool
              mediaList={props.mediaList}
              setMediaList={props.setMediaList}
              addMedia={props.addMedia}
              deleteVideo={props.deleteVideo}
              dragAndDrop={props.dragAndDrop}
              projectDuration={props.projectDuration}
            ></ImagePool>
          )
        case 'audio':
          return (
            <AudioPool
              mediaList={props.mediaList}
              setMediaList={props.setMediaList}
              addMedia={props.addMedia}
              deleteVideo={props.deleteVideo}
              dragAndDrop={props.dragAndDrop}
              projectDuration={props.projectDuration}
            ></AudioPool>
          )
      }
    }

    const stretchImage = () => {
      if (props.selectedSegment) {
        props.setTrackList(
          props.trackList.map((tl, track) => {
            return tl.map((t, index) => {
              if (props.selectedSegment?.track === track && props.selectedSegment.index === index)
                return { ...t, duration: props.projectDuration }
              return t
            })
          })
        )
      }
    }

    const exportProject = async () => {
      const updatedProject = await props.saveProject(true)
      if (updatedProject) {
        setIsRenderingFinished(false)
        const ratio = props.projectWidth / props.canvasWidth
        try {
          await axios.post(`${API_BASE_URL}/api/media/create_video`, {
            projectId: id,
            medias: await Promise.all(
              props.trackList.map(async (tl) => {
                return await Promise.all(
                  tl.map(async (item) => {
                    let path = item.media.file
                    const rotation = item.keyframe.rotation
                    const opacity = item.keyframe.opacity ?? 1
                    let width = Math.round(
                      (item.keyframe.width as number) * ratio * (item.keyframe.scaleX as number)
                    )
                    let height = Math.round(
                      (item.keyframe.height as number) * ratio * (item.keyframe.scaleY as number)
                    )
                    const x = (item.keyframe.x as number) * ratio ?? 0
                    const y = (item.keyframe.y as number) * ratio ?? 0
                    if (checkMediaType(item.media.file) === 'text') {
                      const group = new Konva.Group({
                        width: (item.keyframe.width as number) * ratio,
                        height: (item.keyframe.height as number) * ratio,
                      })
                      const textNode = new Konva.Text({
                        fill: item.keyframe.textColor as string,
                        text: item.media.thumbnail as string,
                        height: (item.keyframe.height as number) * ratio,
                        width: (item.keyframe.width as number) * ratio,
                        fontSize: (item.media.fontSize as number) * ratio,
                        align: item.keyframe.textAlign,
                        verticalAlign: item.keyframe.verticalAlign,
                        fontStyle: item.keyframe.fontStyle, // normal italic bold,
                        textDecoration: item.keyframe.textDecoration, // underline, line-through, ''
                        stroke: item.keyframe.stroke,
                        strokeWidth: item.keyframe.strokeWidth,
                        fontFamily: item.keyframe.fontFamily,
                      })
                      const rect = new Konva.Rect({
                        fill: item.keyframe.backgroundColor as string,
                        width: (item.keyframe.width as number) * ratio,
                        height: (item.keyframe.height as number) * ratio,
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
                      height = textNode.height()
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
                      zIndex: item.keyframe.zIndex as number,
                    }
                  })
                )
              })
            ),
            projectDuration: props.projectDuration / 1000,
            width: props.projectWidth,
            height: props.projectHeight,
          })
          await loadProject()
          props.notify('Rendered successfully', 'success')
        } catch (err) {
          props.notify('Something went wrong', 'failed')
        }
      }
    }

    const download = async () => {
      if (props.renderedVideoUrl) {
        const blob = await fetch(
          `${API_BASE_URL}/media/${id}/video/${props.renderedVideoUrl}`
        ).then((res) => res.blob())
        const tempUrl = URL.createObjectURL(blob)
        const aTag = document.createElement('a') as HTMLAnchorElement
        aTag.href = tempUrl
        aTag.download = props.renderedVideoUrl

        document.body.appendChild(aTag)

        aTag.click()
        URL.revokeObjectURL(tempUrl)
        aTag.remove()
      }
    }

    return (
      <div>
        <div
          className='position-absolute align-items-center'
          style={{ top: 0, width: 'calc(100vw - 100px)', height: 40 }}
        >
          <div className='row'>
            <div className='col-xl-5'></div>
            <div className='col-xl-2 text-center'>
              <h4 style={{ textTransform: 'capitalize', fontWeight: 'normal' }}>{projectName}</h4>
            </div>
            <div className='col-xl-5 d-flex justify-content-end'>
              <button
                id='RenderButton'
                className='btn btn-primary d-flex justify-content-center align-items-center mx-2'
                onClick={exportProject}
                style={{
                  height: '28px',
                  borderRadius: '0',
                  background: '#2f2f36',
                  textTransform: 'capitalize',
                  fontWeight: 'normal',
                }}
                title='Render'
              >
                <span>
                  {props.renderedVideoUrl === '' || props.renderedVideoUrl === undefined
                    ? !isRenderingFinished
                      ? 'Rendering ...'
                      : 'Render'
                    : !isRenderingFinished
                      ? 'Rendering ...'
                      : 'Re-render'}
                </span>
              </button>
              {props.renderedVideoUrl !== '' && props.renderedVideoUrl !== undefined && (
                <button
                  className='btn btn-primary d-flex justify-content-center align-items-center mx-2'
                  onClick={download}
                  style={{
                    height: '28px',
                    borderRadius: '0',
                    background: '#2f2f36',
                    textTransform: 'capitalize',
                    fontWeight: 'normal',
                  }}
                  title='Download'
                >
                  <span>
                    Download (Rendered at {new Date(renderedTime as string).toLocaleDateString()},
                    {new Date(renderedTime as string).toLocaleTimeString()})
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className='row h-100'>
            <div className=''></div>
            <div
              className='position-absolute'
              style={{
                border: '1px solid rgb(65 65 65)',
                background: ' #07070c',
                top: 40,
                height: '50vh',
                width: 'calc(68% - 30px)',
                right: '17%',
                zIndex: 3,
              }}
            >
              <div className='d-flex justify-content-center align-items-center h-100'>
                <ImageEditor
                  updateKeyFrames={props.updateKeyFrames}
                  setStage={props.setStage}
                  selectedNode={props.selectedNode}
                  setSelectedNode={props.setSelectedNode}
                  setSelectedTransformer={setSelectedTransformer}
                  trackList={props.trackList}
                  setTrackList={props.setTrackList}
                  projectWidth={props.projectWidth}
                  projectHeight={props.projectHeight}
                  canvasWidth={props.canvasWidth}
                  canvasHeight={props.canvasHeight}
                  ref={ref}
                />
              </div>
            </div>
            <div
              className='col-xl-2 position-absolute'
              style={{ top: 40, height: '50vh', width: '17%', zIndex: 3, right: 0 }}
            >
              <Properties
                selectedSegment={props.selectedSegment}
                transformer={props.transformer}
                projectWidth={props.projectWidth}
                projectHeight={props.projectHeight}
                selectedNode={props.selectedNode}
                selectedTransformer={selectedTransformer}
                setTrackList={props.setTrackList}
                trackList={props.trackList}
                updateZIndex={props.updateZIndex}
              />
            </div>
          </div>
        </div>
        <div
          className='position-absolute'
          style={{
            width: 'calc(100vw - 100px)',
            top: 40,
            zIndex: 2,
            bottom: 5,
          }}
        >
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <div className='overflow-auto' style={{ display: 'flex', flexDirection: 'column' }}>
              <div className='row' style={{ height: '50vh', overflow: 'hidden' }}>
                <div className='col-xl-2 left-sidebar'>{renderSwitch()}</div>
              </div>
              <div className='my-5'>
                <div className='row'>
                  <Controls
                    playVideo={props.playVideo}
                    pauseVideo={props.pauseVideo}
                    isPlaying={props.isPlaying}
                    currentTime={props.currentTime}
                    projectDuration={props.projectDuration}
                    projectWidth={props.projectWidth}
                    projectHeight={props.projectHeight}
                    setCurrentTime={props.setCurrentTime}
                    trackList={props.trackList}
                    selectedSegment={props.selectedSegment}
                    deleteSelectedSegment={props.deleteSelectedSegment}
                    splitVideo={props.splitVideo}
                    setScaleFactor={setScaleFactor}
                    scaleFactor={scaleFactor}
                    stretchImage={stretchImage}
                    muteMedia={props.muteMedia}
                    alwaysUnmuteVideo={props.alwaysUnmuteVideo}
                    saveProject={props.saveProject}
                    notify={props.notify}
                  />
                </div>
                <div
                  className='row mx-3 position-absolute'
                  style={{
                    height: '30vh',
                    width: 'calc(100vw - 100px)',
                    overflow: 'auto',
                    bottom: 0,
                  }}
                >
                  <Timeline
                    trackList={props.trackList}
                    projectDuration={props.projectDuration}
                    selectedSegment={props.selectedSegment}
                    setSelectedSegment={props.setSelectedSegment}
                    currentTime={props.currentTime}
                    setCurrentTime={props.setCurrentTime}
                    updateSegment={props.updateSegment}
                    scaleFactor={scaleFactor}
                    setTrackList={props.setTrackList}
                    isPlaying={props.isPlaying}
                    setIsPlaying={props.setIsPlaying}
                  />
                </div>
              </div>
            </div>
          </DragDropContext>
        </div>
      </div>
    )
  }
)

export default Editor
