/* eslint-disable no-loop-func */
import Editor from '../routes/editor'
import {ElementType, Media, Segment, SegmentID, SelectedNodeType, Source} from './types'
import {useEffect, useRef, useState} from 'react'
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import About from '../routes/about'
import ExportPage from '../routes/exportPage'
import Login from '../routes/login'
import Konva from 'konva'
import {API_BASE_URL, createThumbnail, updateProject} from '../../project/core/_request'
import {checkMediaType, GifPlayer} from '../helper'
import {Image} from 'gif-viewer/lib/types'
import {Box} from 'konva/lib/shapes/Transformer'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {selectProject, setProject} from '../../../../features/editor/projectSlice'

const PlaybackController = (props: {
  mediaList: Media[]
  setMediaList: (mediaList: Media[]) => void
  trackList: Segment[][]
  setTrackList: (segments: Segment[][]) => void
  addMedia: (file: File[]) => void
  deleteVideo: (media: Media) => void
  dragAndDrop: (media: Media) => void
  setSelectedSegment: (selected: SegmentID | null) => void
  selectedSegment: SegmentID | null
  updateSegment: (id: SegmentID, segment: Segment) => void
  splitVideo: (timestamp: number) => Promise<void>
  projectWidth: number
  projectHeight: number
  projectFramerate: number
  projectDuration: number
  setProjectDuration: (duration: number) => void
  segments: Segment[]
  setSegments: (segments: Segment[]) => void
  setSelectedNode: (selectedNode: SelectedNodeType) => void
  selectedNode: SelectedNodeType
  muteMedia: (isMuteAll: boolean, isMuted: boolean) => void
  trackId: number
  canvasHeight: number
  canvasWidth: number
  alwaysUnmuteVideo: (isAlwaysUnmute: boolean) => void
  renderedVideoUrl: string | undefined
  setRenderedVideoUrl: (renderedVideoUrl: string | undefined) => void
  notify: (message: string, type: 'success' | 'failed') => void
  setCanvasHeight: (canvasHeight: number) => void
  setCanvasWidth: (canvasWidth: number) => void
  setProjectWidth: (projectWidth: number) => void
  setProjectHeight: (projectHeight: number) => void
  setTrackId: (trackId: number) => void
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, _setCurrentTime] = useState<number>(0)
  const trackListRef = useRef(props.trackList)
  const playbackStartTimeRef = useRef(0)
  const lastPlaybackTimeRef = useRef(0)
  const projectDurationRef = useRef(0)
  const mediaListRef = useRef<Media[]>([])
  const isPlayingRef = useRef(false)
  const layerRef = useRef<Konva.Layer>(new Konva.Layer())
  const gifplayerMapRef = useRef(new Map<number, GifPlayer>())
  const elementMap = useRef(new Map<number, any>())
  const [stage, setStage] = useState<Konva.Stage>()
  const [transformer, setTransfomer] = useState<Konva.Transformer>()
  const animationRef = useRef<Konva.Animation>()
  const [mutePortionStart, setMutePortionStart] = useState(0)
  const [mutePortionEnd, setMutePortionEnd] = useState(0)
  const frameIndex = useRef(0)
  const isRendering = useRef(false)
  const dispatch = useAppDispatch()
  const project = useAppSelector(selectProject)
  let isDeleteSegment = useRef(false)

  trackListRef.current = props.trackList
  projectDurationRef.current = props.projectDuration
  mediaListRef.current = props.mediaList
  isPlayingRef.current = isPlaying

  const setCurrentTime = (timestamp: number) => {
    lastPlaybackTimeRef.current = timestamp
    playbackStartTimeRef.current = performance.now()
    _setCurrentTime(timestamp)
    renderFrame(false)
  }

  useEffect(() => {
    // for (let i = 0; i < props.trackList.length - 1; i++) {
    //   for (let j = 0; j < props.trackList[i].length; j++) {
    //     if (checkMediaType(props.trackList[i][j].media.file) === 'audio') {
    //       const res = props.trackList[i][j]
    //       setMutePortionStart(res.start)
    //       setMutePortionEnd(res.start + res.duration)
    //       break
    //     }
    //   }
    // }

    if (
      project?.trackList !==
      JSON.stringify(
        props.trackList.map((tl) =>
          tl.map((t) => {
            return {
              media: {
                source: {
                  isMute: t.media.source.isMute,
                  id: t.media.source.id,
                  isAlwaysUnmute: t.media.source.isAlwaysUnmute,
                },
                file: t.media.file,
                thumbnail: t.media.thumbnail,
                frameBackground: t.media.frameBackground,
                fontSize: t.media.fontSize,
                frameCompletion: t.media.frameCompletion,
                gifImages: t.media.gifImages,
                waveForm: t.media.waveForm,
              },
              start: t.start,
              duration: t.duration,
              mediaStart: t.mediaStart,
              keyframe: t.keyframe,
            }
          })
        )
      )
    ) {
      props.setRenderedVideoUrl(undefined)
    }

    trackListRef.current = props.trackList

    // if (isDeleteSegment.current) {
    //   if (props.selectedSegment) {

    //   }
    // }

    // if (!isPlayingRef.current) {
    renderFrame(false)
    // }

    // if (props.selectedSegment === null) return
    // const segment = props.trackList[props.selectedSegment.track][props.selectedSegment.index]
    // playbackStartTimeRef.current = segment.start
    // setCurrentTime(segment.start)
  }, [props.trackList])

  useEffect(() => {
    const result = layerRef.current.find('#transformer')[0]
    if (result) {
      result.remove()
    }
    if (props.selectedNode) {
      const _transformer = new Konva.Transformer({
        id: 'transformer',
        anchorCornerRadius: 30,
        anchorSize: 15,
        centeredScaling: true,
      })

      layerRef.current.add(_transformer)
      _transformer.on('transformend', updateKeyFrames)

      // if (props.selectedNode instanceof Konva.Group) {
      //   _transformer.enabledAnchors(['middle-left', 'middle-right'])
      // }

      _transformer.nodes(props.selectedNode ? [props.selectedNode] : [])
      _transformer.boundBoxFunc((oldBox: Box, newBox: Box) => {
        // limit resize
        if (newBox.width < 15 || newBox.height < 15) {
          return oldBox
        }
        return newBox
      })

      setTransfomer(_transformer)
      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setSelectedSegment({track, index})
    }
  }, [props.selectedNode])

  useEffect(() => {
    if (props.selectedSegment)
      props.setSelectedNode(
        elementMap.current.get(
          props.trackList[props.selectedSegment.track][props.selectedSegment.index].media.source.id
        )
      )
    else props.setSelectedNode(undefined)
  }, [props.selectedSegment])

  useEffect(() => {
    if (currentTime > props.projectDuration) setCurrentTime(props.projectDuration)
  }, [props.projectDuration])

  useEffect(() => {
    animationRef.current = new Konva.Animation(() => {}, layerRef.current)
  }, [])

  const updateKeyFrames = () => {
    const id = props.selectedNode?.id()
    const track = Number(id?.split('-')[0])
    const index = Number(id?.split('-')[1])
    if (props.selectedNode instanceof Konva.Group) {
      const text = props.selectedNode.findOne('Text') as Konva.Text
      const rect = props.selectedNode.findOne('Rect') as Konva.Rect
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (index === i && t === track) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  x: props.selectedNode?.x(),
                  y: props.selectedNode?.y(),
                  rotation: props.selectedNode?.rotation(),
                  zIndex: props.selectedNode?.getZIndex(),
                  width: props.selectedNode?.width(),
                  height: props.selectedNode?.height(),
                  textColor: text.fill(),
                  backgroundColor: rect.fill(),
                  textAlign: text.align(),
                  align: text.align(),
                  verticalAlign: text.verticalAlign(),
                  fontStyle: text.fontStyle(), // normal italic bold,
                  textDecoration: text.textDecoration(), // underline, line-through, ''
                  stroke: text.stroke(),
                  strokeWidth: text.strokeWidth(),
                  fontFamily: text.fontFamily(),
                },
                media: {
                  ...ti.media,
                  fontSize: text.fontSize(),
                },
              }
            }
            return ti
          })
        })
      )
    } else {
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (index === i && t === track) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  x: props.selectedNode?.x(),
                  y: props.selectedNode?.y(),
                  scaleX: props.selectedNode?.scaleX(),
                  scaleY: props.selectedNode?.scaleY(),
                  rotation: props.selectedNode?.rotation(),
                  zIndex: props.selectedNode?.getZIndex(),
                },
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateZIndex = () => {
    props.setTrackList(
      props.trackList.map((tl, track) => {
        return tl.map((t, index) => {
          const child = layerRef.current.children?.find(
            (child) => child.id() === `${track}-${index}`
          ) as Konva.Image
          return {
            ...t,
            keyframe: child ? {...t.keyframe, zIndex: child.zIndex()} : t.keyframe,
          }
        })
      })
    )
  }

  const deleteCanvasElement = (track: number, index: number) => {
    console.log(elementMap.current)

    const id = props.trackList[track][index].media.source.id as number

    const konvaElement = elementMap.current.get(id) as Konva.Image
    konvaElement?.destroy()
    elementMap.current.delete(id)
    isDeleteSegment.current = false
    console.log(elementMap.current)
  }

  const deleteSelectedSegment = () => {
    if (props.selectedSegment === null) return

    const audios = document.getElementsByTagName('audio')

    const source =
      props.trackList[props.selectedSegment.track][props.selectedSegment.index].media.source
    if (source.element instanceof HTMLVideoElement || source.element instanceof HTMLAudioElement) {
      source.element.pause()
    }

    let newTrackList = [
      ...props.trackList.slice(0, props.selectedSegment.track),
      [
        ...props.trackList[props.selectedSegment.track].slice(0, props.selectedSegment.index),
        ...props.trackList[props.selectedSegment.track].slice(props.selectedSegment.index + 1),
      ],
      ...props.trackList.slice(props.selectedSegment.track + 1),
    ]

    // Clean Tracklist
    while (newTrackList.length > 0 && newTrackList[newTrackList.length - 1].length === 0)
      newTrackList.pop()
    newTrackList.push([])
    props.setSelectedNode(undefined)
    isDeleteSegment.current = true
    deleteCanvasElement(props.selectedSegment?.track, props.selectedSegment?.index)
    props.setSelectedSegment(null)
    props.setTrackList(newTrackList)

    for (const audio of audios) {
      audio.muted = true
    }

    const videos = document.getElementsByTagName('video')

    for (const video of videos) {
      video.muted = true
    }
    pause()
  }

  const renderFrame = async (update: boolean) => {
    // let curTime = currentTime
    const t1 = performance.now()
    let curTime = performance.now() - playbackStartTimeRef.current + lastPlaybackTimeRef.current
    if (!update) curTime = lastPlaybackTimeRef.current
    if (curTime >= projectDurationRef.current) curTime = projectDurationRef.current

    _setCurrentTime(curTime)

    for (let i = 0; i < props.trackList.length - 1; i++) {
      for (let j = 0; j < props.trackList[i].length; j++) {
        const segment = props.trackList[i][j]
        const source = segment.media.source as Source
        const element = source.element as ElementType
        const isAlwaysUnmute = source.isAlwaysUnmute
        if (curTime >= segment.start && curTime < segment.start + segment.duration) {
          let mediaTime = curTime - segment.start + segment.mediaStart
          if (element instanceof HTMLVideoElement) {
            if (curTime >= mutePortionStart && curTime <= mutePortionEnd) {
              if (!isAlwaysUnmute) {
                if (!element.muted) {
                  element.muted = true
                }
              } else {
                if (element.muted) {
                  element.muted = false
                }
              }
            } else {
              if (element.muted !== source.isMute) {
                element.muted = source.isMute
              }
            }
          }
          if (elementMap.current.get(source.id) === undefined) {
            if (element instanceof HTMLVideoElement || element instanceof HTMLImageElement) {
              let img: any

              if (segment.media.file.endsWith('.gif')) {
                const canvas = document.createElement('canvas') as HTMLCanvasElement
                img = new Konva.Image({
                  id: `${i}-${j}`,
                  image: canvas,
                  draggable: true,
                  x: segment.keyframe.x,
                  y: segment.keyframe.y,
                  scaleX: segment.keyframe.scaleX,
                  scaleY: segment.keyframe.scaleY,
                  rotation: segment.keyframe.rotation,
                  opacity: segment.keyframe.opacity,
                  width: segment.keyframe.width as number,
                  height: segment.keyframe.height as number,
                })

                const gifplayer = new GifPlayer(segment.media.gifImages as Image[], canvas, img)
                gifplayerMapRef.current.set(source.id, gifplayer)
                gifplayer.play()
              } else {
                img = new Konva.Image({
                  id: `${i}-${j}`,
                  image: element,
                  draggable: true,
                  x: segment.keyframe.x,
                  y: segment.keyframe.y,
                  scaleX: segment.keyframe.scaleX,
                  scaleY: segment.keyframe.scaleY,
                  rotation: segment.keyframe.rotation,
                  opacity: segment.keyframe.opacity,
                  width: segment.keyframe.width as number,
                  height: segment.keyframe.height as number,
                })
              }

              if (element instanceof HTMLVideoElement) {
                img.stroke('gray')
                img.strokeWidth(props.projectWidth)
                img.draggable(false)
                if (curTime >= mutePortionStart && curTime <= mutePortionEnd) {
                  if (!element.muted) element.muted = true
                } else {
                  element.muted = source.isMute
                }
              }

              layerRef.current.add(img)

              img.on('mousedown', () => {
                props.setSelectedNode(img)
                pause()
              })

              img.zIndex(segment.keyframe.zIndex as number)
              elementMap.current.set(source.id, img)
            } else if (element instanceof HTMLParagraphElement) {
              const group = new Konva.Group({
                id: `${i}-${j}`,
                x: segment.keyframe.x,
                y: segment.keyframe.y,
                width: segment.keyframe.width,
                height: segment.keyframe.height,
                rotation: segment.keyframe.rotation,
                opacity: segment.keyframe.opacity,
                draggable: true,
              })

              const textNode = new Konva.Text({
                fill: segment.keyframe.textColor as string,
                text: segment.media.thumbnail as string,
                width: segment.keyframe.width,
                height: segment.keyframe.height,
                draggable: false,
                fontSize: segment.media.fontSize,
                align: segment.keyframe.textAlign,
                verticalAlign: segment.keyframe.verticalAlign,
                fontStyle: segment.keyframe.fontStyle, // normal italic bold,
                textDecoration: segment.keyframe.textDecoration, // underline, line-through, ''
                stroke: segment.keyframe.stroke,
                strokeWidth: segment.keyframe.strokeWidth,
                fontFamily: segment.keyframe.fontFamily,
              })

              const rect = new Konva.Rect({
                fill: segment.keyframe.backgroundColor as string,
                draggable: false,
                width: segment.keyframe.width,
                height: segment.keyframe.height,
              })

              group.on('transform', function () {
                group.width(group.width() * group.scaleX())
                group.scaleX(1)
                group.height(group.height() * group.scaleY())
                group.scaleY(1)
                textNode.width(group.width())
                textNode.height(group.height())
                rect.width(group.width())
                rect.height(textNode.height())
              })

              textNode.on('dblclick dbltap', () => {
                textNode.hide()
                const tr = layerRef.current.find('#transformer')[0] as Konva.Transformer
                tr.hide()

                const container = (stage as Konva.Stage).container() as HTMLDivElement

                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop

                var areaPosition = {
                  x: container.getBoundingClientRect().left + scrollLeft + group.x(),
                  y: container.getBoundingClientRect().top + scrollTop + group.y(),
                }

                const textarea = document.createElement('textarea') as HTMLTextAreaElement
                document.body.appendChild(textarea)

                textarea.value = textNode.text()
                textarea.style.position = 'absolute'
                textarea.style.zIndex = '1000'
                textarea.style.top = areaPosition.y + 'px'
                textarea.style.left = areaPosition.x + 'px'
                textarea.style.width = group.width() - textNode.padding() * 2 + 'px'
                textarea.style.height = group.height() - textNode.padding() * 2 + 'px'
                textarea.style.fontSize = textNode.fontSize() + 'px'
                textarea.style.border = 'none'
                textarea.style.padding = '0px'
                textarea.style.margin = '0px'
                textarea.style.overflow = 'hidden'
                textarea.style.background = 'none'
                textarea.style.outline = 'none'
                textarea.style.resize = 'none'
                textarea.style.lineHeight = textNode.lineHeight() + ''
                textarea.style.fontFamily = textNode.fontFamily()
                textarea.style.transformOrigin = 'left top'
                textarea.style.textAlign = textNode.align()
                textarea.style.color = textNode.fill()
                const rotation = group.rotation()
                var transform = ''
                if (rotation) {
                  transform += 'rotateZ(' + rotation + 'deg)'
                }

                var px = 0

                var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
                if (isFirefox) {
                  px += 2 + Math.round(textNode.fontSize() / 20)
                }
                transform += 'translateY(-' + px + 'px)'

                textarea.style.transform = transform

                textarea.style.height = 'auto'

                textarea.style.height = textarea.scrollHeight + 3 + 'px'

                textarea.focus()

                function removeTextarea() {
                  ;(textarea.parentNode as ParentNode).removeChild(textarea)
                  window.removeEventListener('click', handleOutsideClick)
                  textNode.show()
                  tr.show()
                  tr.forceUpdate()
                }

                function setTextareaWidth(newWidth: number) {
                  if (!newWidth) {
                    newWidth = textNode.text().length * textNode.fontSize()
                  }

                  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
                  var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
                  if (isSafari || isFirefox) {
                    newWidth = Math.ceil(newWidth)
                  }

                  var isEdge = /Edge/.test(navigator.userAgent)
                  if (isEdge) {
                    newWidth += 1
                  }
                  textarea.style.width = newWidth + 'px'
                }

                textarea.addEventListener('change', function (e) {
                  props.setTrackList(
                    trackListRef.current.map((tl, t) => {
                      return tl.map((ti, index) => {
                        if (index === j && t === i) {
                          return {
                            ...ti,
                            media: {...ti.media, thumbnail: textarea.value},
                          }
                        }
                        return ti
                      })
                    })
                  )
                  // if (e.keyCode === 13 && !e.shiftKey) {
                  //   textNode.text(textarea.value)

                  //   removeTextarea()
                  // }
                  // if (e.keyCode === 27) {
                  //   removeTextarea()
                  // }

                  // group.height(textNode.height())
                  const scale = textNode.getAbsoluteScale().x
                  setTextareaWidth(textNode.width() * scale)
                  textarea.style.height = 'auto'
                  textarea.style.height = textarea.scrollHeight + textNode.fontSize() + 'px'
                  // if (textNode.height() < textarea.scrollHeight) {
                  //   textNode.height(textarea.scrollHeight)
                  //   rect.height(textarea.scrollHeight)
                  // }
                })

                function handleOutsideClick(e: any) {
                  if (e.target !== textarea) {
                    textNode.text(textarea.value)
                    textNode.fill(textarea.style.color)
                    removeTextarea()
                  }
                }
                setTimeout(() => {
                  window.addEventListener('click', handleOutsideClick)
                })
              })

              layerRef.current.add(group)

              textNode.on('mousedown', () => {
                props.setSelectedNode(group)
                pause()
              })

              rect.on('mousedown', () => {
                props.setSelectedNode(group)
                pause()
              })

              group.on('mousedown', () => {
                props.setSelectedNode(group)
                pause()
              })

              group.add(rect)
              group.add(textNode)

              group.zIndex(segment.keyframe.zIndex as number)
              elementMap.current.set(source.id, group)
            }
          } else {
            const konvaElement = elementMap.current.get(source.id)
            if (konvaElement !== undefined) {
              konvaElement.x(segment.keyframe.x as number)
              konvaElement.y(segment.keyframe.y as number)
              konvaElement.rotation(segment.keyframe.rotation as number)
              konvaElement.width(segment.keyframe.width as number)
              konvaElement.opacity(segment.keyframe.opacity as number)
              if (konvaElement instanceof Konva.Image) {
                konvaElement.height(segment.keyframe.height as number)
                konvaElement.scaleX(segment.keyframe.scaleX as number)
                konvaElement.scaleY(segment.keyframe.scaleY as number)
              }
              if (konvaElement instanceof Konva.Group) {
                const text = konvaElement.find('Text')[0] as Konva.Text
                text.fontSize(segment.media.fontSize as number)
                text.text(segment.media.thumbnail as string)
                text.fill(segment.keyframe.textColor as string)
                text.align(segment.keyframe.textAlign as string)

                const rect = konvaElement.find('Rect')[0] as Konva.Rect
                rect.fill(segment.keyframe.backgroundColor as string)
              }
            }
          }

          if (element instanceof HTMLVideoElement || element instanceof HTMLAudioElement) {
            if (element.paused || !update) {
              element.currentTime = mediaTime / 1000
              element.play()
            }
            if (!isPlayingRef.current) {
              if (element instanceof HTMLVideoElement || element instanceof HTMLAudioElement) {
                element.pause()
              }
            }
          }
        } else {
          if (element instanceof HTMLVideoElement || element instanceof HTMLAudioElement) {
            element.pause()
          }

          const konvaElement = elementMap.current.get(source.id) as Konva.Image
          if (update) props.setSelectedNode(undefined)
          konvaElement?.destroy()
          elementMap.current.delete(source.id)
          if (segment.media.file.endsWith('.gif')) {
            const player = gifplayerMapRef.current.get(source.id)
            player?.pause()

            gifplayerMapRef.current.delete(source.id)
          }
        }
      }
    }

    frameIndex.current++

    if (!isPlayingRef.current) {
      return
    }

    if (curTime === projectDurationRef.current) {
      pause()
      return
    }

    setTimeout(() => {
      renderFrame(true)
    }, (1 / props.projectFramerate) * 1000) as unknown as number
  }

  const play = async () => {
    if (currentTime >= projectDurationRef.current) {
      setCurrentTime(0)
    }

    setIsPlaying(true)
    if (animationRef.current) animationRef.current.start()
    props.setSelectedNode(undefined)
    lastPlaybackTimeRef.current = currentTime
    playbackStartTimeRef.current = performance.now()
    isPlayingRef.current = true
    frameIndex.current = 0
    isRendering.current = false
    renderFrame(true)
  }

  const saveProject = async (isRendering: boolean) => {
    if (project) {
      const thumbnailUrl = await createThumbnailOfProject()

      const updatedProject = await updateProject({
        ...project,
        width: props.projectWidth,
        height: props.projectHeight,
        canvasWidth: props.canvasWidth,
        canvasHeight: props.canvasHeight,
        projectDuration: props.projectDuration,
        mediaList: JSON.stringify(
          props.mediaList.map((media) => {
            return {
              source: {
                isMute: media.source.isMute,
                id: media.source.id,
              },
              file: media.file,
              thumbnail: media.thumbnail,
              frameBackground: media.frameBackground,
              fontSize: media.fontSize,
              frameCompletion: media.frameCompletion,
              waveForm: media.waveForm,
            }
          })
        ),
        trackList: JSON.stringify(
          props.trackList.map((tl) =>
            tl.map((t) => {
              return {
                media: {
                  source: {
                    isMute: t.media.source.isMute,
                    id: t.media.source.id,
                    isAlwaysUnmute: t.media.source.isAlwaysUnmute,
                  },
                  file: t.media.file,
                  thumbnail: t.media.thumbnail,
                  frameBackground: t.media.frameBackground,
                  fontSize: t.media.fontSize,
                  frameCompletion: t.media.frameCompletion,
                  waveForm: t.media.waveForm,
                },
                start: t.start,
                duration: t.duration,
                mediaStart: t.mediaStart,
                keyframe: t.keyframe,
              }
            })
          )
        ),
        trackId: props.trackId,
        renderedVideoUrl: props.renderedVideoUrl ?? '',
        isRendering,
        thumbnailUrl:
          thumbnailUrl === ''
            ? '/media/imageeditor/DarkGray.png'
            : `${API_BASE_URL}/${project._id}/${thumbnailUrl}`,
      })

      if (updatedProject) {
        dispatch(setProject(updatedProject))
      }
      return updatedProject
    }
  }

  const createThumbnailOfProject = async (): Promise<string> => {
    if (project) {
      const stage = new Konva.Stage({
        container: '#thumbnail',
        width: props.canvasWidth,
        height: props.canvasHeight,
      })
      const layer = new Konva.Layer({
        width: props.canvasWidth,
        height: props.canvasHeight,
      })

      stage.add(layer)
      const medias = props.trackList
        .reduce((previous, next) => previous.concat(next))
        .filter((item) => checkMediaType(item.media.file) !== 'audio')

      for (const media of medias) {
        const segment = media
        const source = segment.media.source as Source
        const element = source.element as ElementType
        if (segment.start === 0) {
          if (element instanceof HTMLVideoElement || element instanceof HTMLImageElement) {
            if (element instanceof HTMLVideoElement) {
              element.currentTime = 0
            }
            const img = new Konva.Image({
              image: element,
              draggable: true,
              x: media.keyframe.x,
              y: media.keyframe.y,
              scaleX: media.keyframe.scaleX,
              scaleY: media.keyframe.scaleY,
              rotation: media.keyframe.rotation,
              opacity: media.keyframe.opacity,
              width: media.keyframe.width as number,
              height: media.keyframe.height as number,
            })
            if (element instanceof HTMLVideoElement) {
              img.stroke('gray')
              img.strokeWidth(props.canvasWidth)
              img.draggable(false)
            }
            layer.add(img)
            img.zIndex(media.keyframe.zIndex as number)
          } else if (element instanceof HTMLParagraphElement) {
            const group = new Konva.Group({
              x: media.keyframe.x,
              y: media.keyframe.y,
              width: media.keyframe.width,
              height: media.keyframe.height,
              rotation: media.keyframe.rotation,
              opacity: media.keyframe.opacity,
              draggable: true,
            })

            const textNode = new Konva.Text({
              fill: media.keyframe.textColor as string,
              text: media.media.thumbnail as string,
              width: media.keyframe.width,
              height: media.keyframe.height,
              draggable: false,
              fontSize: media.media.fontSize,
              align: media.keyframe.textAlign,
              verticalAlign: media.keyframe.verticalAlign,
              fontStyle: media.keyframe.fontStyle, // normal italic bold,
              textDecoration: media.keyframe.textDecoration, // underline, line-through, ''
              stroke: media.keyframe.stroke,
              strokeWidth: media.keyframe.strokeWidth,
              fontFamily: segment.keyframe.fontFamily,
            })

            const rect = new Konva.Rect({
              fill: media.keyframe.backgroundColor as string,
              draggable: false,
              width: media.keyframe.width,
              height: media.keyframe.height,
            })
            layer.add(group)
            group.add(rect)
            group.add(textNode)
            group.zIndex(media.keyframe.zIndex as number)
          }
        }
      }

      const thumbnailUrl = await createThumbnail(project._id as string, layer.toDataURL())
      return thumbnailUrl
    }
    return ''
  }

  const pause = () => {
    setIsPlaying(false)
    if (animationRef.current) animationRef.current.stop()
  }

  return (
    <>
      <div style={{display: 'none'}} id='thumbnail'></div>
      <Routes>
        <Route path='/about' element={<About />} />
        <Route
          path='/:id/editor'
          element={
            <>
              <Editor
                {...props}
                transformer={transformer}
                updateKeyFrames={updateKeyFrames}
                deleteSelectedSegment={deleteSelectedSegment}
                deleteCanvasElement={deleteCanvasElement}
                saveProject={saveProject}
                setStage={setStage}
                updateZIndex={updateZIndex}
                selectedNode={props.selectedNode}
                setSelectedNode={props.setSelectedNode}
                playVideo={play}
                pauseVideo={pause}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                ref={layerRef}
                alwaysUnmuteVideo={props.alwaysUnmuteVideo}
                renderedVideoUrl={props.renderedVideoUrl}
                setRenderedVideoUrl={props.setRenderedVideoUrl}
                notify={props.notify}
              />
            </>
          }
        />
        <Route
          path='/:id/export'
          element={
            <ExportPage
              trackList={trackListRef.current}
              canvasWidth={props.canvasWidth}
              canvasHeight={props.canvasHeight}
              projectDuration={projectDurationRef.current}
              ratio={props.projectWidth / props.canvasWidth}
              baseWidth={props.projectWidth}
              baseHeight={props.projectHeight}
              renderedVideoUrl={props.renderedVideoUrl}
              setRenderedVideoUrl={props.setRenderedVideoUrl}
              saveProject={saveProject}
              renderFrame={renderFrame}
            ></ExportPage>
          }
        />
        <Route path='/' element={<Login />} />
      </Routes>
    </>
  )
}

export default PlaybackController
