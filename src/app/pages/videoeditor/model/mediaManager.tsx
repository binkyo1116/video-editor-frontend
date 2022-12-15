import {useEffect, useState} from 'react'
import PlaybackController from './playbackController'
import {ElementType, Media, Segment, SegmentID, SelectedNodeType} from './types'
import {API_BASE_URL, uploadFile} from '../../project/core/_request'
import {checkMediaType} from '../helper'
import GifViewer from 'gif-viewer'
import axios from 'axios'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {Project} from '../../project/core/_models'
import {useAppSelector} from '../../../hooks'
import {selectProject} from '../../../../features/editor/projectSlice'

export default function MediaManager(props: {
  projectHeight: number
  setProjectHeight: (height: number) => void
  projectWidth: number
  setProjectWidth: (width: number) => void
  projectFramerate: number
  setProjectFramerate: (framerate: number) => void
  projectDuration: number
  setProjectDuration: (duration: number) => void
}) {
  const [mediaList, setMediaList] = useState<Media[]>([
    {
      source: {element: document.createElement('p'), isMute: false, id: -2},
      file: '',
      thumbnail: 'Header Text',
      fontSize: 32,
    },
    {
      source: {element: document.createElement('p'), isMute: false, id: -3},
      file: '',
      thumbnail: 'Large Text',
      fontSize: 24,
    },
    {
      source: {element: document.createElement('p'), isMute: false, id: -4},
      file: '',
      thumbnail: 'Default Text',
      fontSize: 16,
    },
  ])

  const [trackList, setTrackList] = useState<Segment[][]>([[]])
  const [selectedSegment, setSelectedSegment] = useState<SegmentID | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedNode, setSelectedNode] = useState<SelectedNodeType>()
  const [canvasWidth, setCanvasWidth] = useState<number>(0)
  const [canvasHeight, setCanvasHeight] = useState<number>(0)
  const [trackId, setTrackId] = useState(0)
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | undefined>('')
  const project = useAppSelector(selectProject)
  let browserHeight =
    Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - 40

  useEffect(() => {
    // console.log(trackList)
    let duration = 0
    for (const track of trackList) {
      if (track.length === 0) continue
      duration = Math.max(
        duration,
        track[track.length - 1].start + track[track.length - 1].duration
      )
    }
    props.setProjectDuration(duration)
  }, [trackList])

  const generateThumbnail = async (file: string) => {
    if (checkMediaType(file) === 'video') {
      let elm = document.createElement('video') as HTMLVideoElement
      elm.preload = 'auto'

      elm.crossOrigin = 'anonymous'

      await new Promise<void>((resolve) => {
        elm.onloadeddata = () => resolve()
        elm.src = file
        elm.currentTime = 0
      })

      // Generate Thumbnail
      const thumbnail = await axios
        .post(`${API_BASE_URL}/api/media/create_video_preview`, {
          projectId: project?._id,
          videoUrl: file,
        })
        .then((res) => res.data)
        .then((res) => res.previewUrl)

      const waveForm = await axios
        .post(`${API_BASE_URL}/api/media/create_waveform`, {
          projectId: project?._id,
          mediaUrl: file,
        })
        .then((res) => res.data)
        .then((res) => res.waveForm)

      let media: Media = {
        source: {element: elm, isMute: false, id: -1},
        file: file,
        thumbnail,
        frameBackground: '',
        frameCompletion: 0,
        waveForm: `${API_BASE_URL}/${project?._id}/${waveForm}`,
      }

      return media
    } else if (checkMediaType(file) === 'image') {
      let elm = document.createElement('img') as HTMLImageElement
      elm.crossOrigin = 'anonymous'

      await new Promise<void>((resolve) => {
        elm.onload = () => resolve()
        elm.src = file
      })

      let media: Media = {
        source: {element: elm, isMute: false, id: -1},
        file: file,
        thumbnail: file,
      }

      return media
    } else if (checkMediaType(file) === 'audio') {
      const waveForm = await axios
        .post(`${API_BASE_URL}/api/media/create_waveform`, {
          projectId: project?._id,
          mediaUrl: file,
        })
        .then((res) => res.data)
        .then((res) => res.waveForm)

      const elem = document.createElement('audio') as HTMLAudioElement
      elem.currentTime = 0
      elem.crossOrigin = 'anonymous'
      elem.src = file
      let media: Media = {
        source: {element: elem, isMute: false, id: -1},
        file: file,
        thumbnail: '/media/imageeditor/waveform.png',
        waveForm: `${API_BASE_URL}/${project?._id}/${waveForm}`,
      }

      return media
    }
  }

  const addMedia = async (files: File[]) => {
    let uniqueFiles: File[] = []
    let found = false
    for (let file of files) {
      for (let i = 0; i < mediaList.length; i++) {
        if (
          mediaList[i].file !== undefined &&
          mediaList[i].file.includes(file.name.split('.')[0])
        ) {
          found = true
          break
        }
      }
      if (found) continue
      uniqueFiles.push(file)
    }

    let filesList: Media[] = []

    const form = new FormData()
    for (let file of uniqueFiles) {
      form.append('files', file)
    }
    const fileNames = await uploadFile(project?._id as string, form)

    if (fileNames.length > 0) {
      for (let file of fileNames) {
        filesList.push(
          (await generateThumbnail(`${API_BASE_URL}/${project?._id}/${file}`)) as Media
        )
      }
    }

    setMediaList([...mediaList, ...filesList])

    uniqueFiles.forEach(async (_, i) => {
      if (checkMediaType(fileNames[i]) === 'video') {
        const res = await axios.post(`${API_BASE_URL}/api/media/create_video_thumbnail`, {
          videoUrl: fileNames[i],
          projectId: project?._id,
        })
        filesList[i].frameBackground = `${API_BASE_URL}/${project?._id}/${res.data.thumbnailUrl}`
        filesList[i].frameCompletion = 100
        setMediaList([...mediaList, ...filesList])
      }
      if (fileNames[i].endsWith('.gif')) {
        const gifViewer = new GifViewer()
        await gifViewer.decode(
          await fetch(`${API_BASE_URL}/${project?._id}/${fileNames[i]}`).then((r) => r.blob())
        )
        filesList[i].gifImages = gifViewer.gif.images
        // console.log(gifViewer.gif.images, JSON.stringify(gifViewer.gif.images))
        setMediaList([...mediaList, ...filesList])
      }
    })
  }

  const dragAndDrop = async (m: Media) => {
    const media: Media = {
      ...m,
    }
    let videoCount = 0,
      trackCount = 1
    const element = media.source.element
    let width =
      element instanceof HTMLVideoElement
        ? (element as HTMLVideoElement).videoWidth
        : element instanceof HTMLImageElement
        ? element.width
        : 200
    let height =
      element instanceof HTMLVideoElement
        ? (element as HTMLVideoElement).videoHeight
        : element instanceof HTMLImageElement
        ? element.height
        : (media.fontSize as number)

    let realWidth = width
    let realHeight = height

    trackList.forEach((tl) => {
      videoCount += tl.filter((t) => checkMediaType(t.media.file) === 'video').length
      trackCount += tl.filter(
        (t) =>
          t.media.source.element instanceof HTMLVideoElement ||
          t.media.source.element instanceof HTMLParagraphElement ||
          t.media.source.element instanceof HTMLImageElement
      ).length
    })

    let x = 0,
      y = 0

    if (videoCount === 0) {
      if (!(media.source.element instanceof HTMLVideoElement)) {
        alert('You should place the video for the first time')
        return
      }
      x = 0
      y = 0

      realWidth =
        height < browserHeight / 2
          ? ((width * height) / browserHeight) * 2
          : ((width / height) * browserHeight) / 2
      realHeight = browserHeight / 2

      setCanvasWidth(realWidth)
      setCanvasHeight(realHeight)
      props.setProjectWidth(width)
      props.setProjectHeight(height)
    } else {
      if (media.file !== '') {
        if (canvasHeight < canvasWidth) {
          if (height < width) {
            const rate = height / width
            const canvasRate = canvasHeight / canvasWidth

            if (rate < canvasRate) {
              realWidth = canvasWidth
              realHeight = (height * canvasWidth) / width
            } else {
              realHeight = canvasHeight
              realWidth = (width * canvasHeight) / height
            }
          } else {
            realHeight = canvasHeight
            realWidth = (width * canvasHeight) / height
          }
        } else {
          if (height > width) {
            const rate = height / width
            const canvasRate = canvasHeight / canvasWidth

            if (rate < canvasRate) {
              realWidth = canvasWidth
              realHeight = (height * canvasWidth) / width
            } else {
              realHeight = canvasHeight
              realWidth = (width * canvasHeight) / height
            }
          } else {
            realWidth = canvasWidth
            realHeight = (height * canvasWidth) / width
          }
        }
      }

      x = (canvasWidth - realWidth) / 2
      y = (canvasHeight - realHeight) / 2
    }

    let segment: Segment = {
      media: media,
      start: 0,
      duration:
        media.source.element instanceof HTMLVideoElement
          ? media.source.element.duration * 1000
          : media.source.element instanceof HTMLAudioElement
          ? media.source.element.duration * 1000
          : 5000,
      mediaStart: 0,
      keyframe: {
        start: 0,
        x,
        y,
        scaleX: 1.0,
        scaleY: 1.0,
        rotation: 0,
        width: realWidth,
        height: realHeight,
        zIndex: trackCount,
        textColor: '#000',
        backgroundColor: '#0000',
        stroke: '#000',
        strokeWidth: 0,
        fontStyle: 'normal',
      },
    }
    const newElement = media.source.element.cloneNode() as ElementType

    if (newElement instanceof HTMLVideoElement || newElement instanceof HTMLAudioElement) {
      newElement.preload = 'auto'
      await new Promise<void>((resolve) => {
        newElement.onloadeddata = () => resolve()
        newElement.currentTime = 0
      })
    }

    segment.media.source = {
      element: newElement,
      isMute: false,
      id: trackId,
      isAlwaysUnmute: false,
    }
    setTrackId((trackId) => trackId + 1)

    if (trackList[trackList.length - 1].length === 0) {
      setTrackList([...trackList.slice(0, trackList.length - 1), [segment], []])
    } else {
      setTrackList([...trackList, [segment], []])
    }
  }

  const deleteVideo = (media: Media) => {
    if (media.source.element instanceof HTMLVideoElement)
      (media.source.element as HTMLVideoElement).pause()

    if (selectedSegment && trackList[selectedSegment.track][selectedSegment.index].media === media)
      setSelectedSegment(null)
    setMediaList(mediaList.filter((item) => item !== media))

    let newTrackList = trackList.map((track) => track.filter((segment) => segment.media !== media))
    // Clean Tracklist

    while (newTrackList.length > 0 && newTrackList[newTrackList.length - 1].length === 0)
      newTrackList.pop()
    newTrackList.push([])

    setTrackList(newTrackList)
  }

  const split = async (timestamp: number) => {
    if (selectedSegment === null) return
    const segment = trackList[selectedSegment.track][selectedSegment.index]

    if (segment.start > timestamp || segment.start + segment.duration < timestamp) return

    // Find index of current keyframe at timestamp
    // There is always at least 1 keyframe in a segment

    let segmentTimeCut = timestamp - segment.start

    const element = segment.media.source.element
    let newRightElement: ElementType = element

    let frameBackground1 = segment.media.frameBackground
    let frameBackground2 = segment.media.frameBackground

    let waveForm1 = segment.media.waveForm
    let waveForm2 = segment.media.waveForm

    if (element instanceof HTMLVideoElement) {
      newRightElement = segment.media.source.element.cloneNode() as HTMLVideoElement

      const res1 = await axios.post(`${API_BASE_URL}/api/media/crop_background_image`, {
        projectId: project._id,
        imageUrl: segment.media.frameBackground,
        portion1: (timestamp - segment.start) / segment.duration,
        portion2: (segment.start + segment.duration - timestamp) / segment.duration,
      })

      frameBackground1 = `${API_BASE_URL}/${project._id}/${res1.data.previewUrls.image1}`
      frameBackground2 = `${API_BASE_URL}/${project._id}/${res1.data.previewUrls.image2}`

      const res2 = await axios.post(`${API_BASE_URL}/api/media/crop_waveform_image`, {
        projectId: project._id,
        imageUrl: segment.media.waveForm,
        portion1: (timestamp - segment.start) / segment.duration,
        portion2: (segment.start + segment.duration - timestamp) / segment.duration,
      })

      waveForm1 = `${API_BASE_URL}/${project._id}/${res2.data.previewUrls.image1}`
      waveForm2 = `${API_BASE_URL}/${project._id}/${res2.data.previewUrls.image2}`
    } else if (element instanceof HTMLAudioElement) {
      newRightElement = segment.media.source.element.cloneNode() as HTMLAudioElement
      const res = await axios.post(`${API_BASE_URL}/api/media/crop_waveform_image`, {
        projectId: project._id,
        imageUrl: segment.media.waveForm,
        portion1: (timestamp - segment.start) / segment.duration,
        portion2: (segment.start + segment.duration - timestamp) / segment.duration,
      })

      waveForm1 = `${API_BASE_URL}/${project._id}/${res.data.previewUrls.image1}`
      waveForm2 = `${API_BASE_URL}/${project._id}/${res.data.previewUrls.image2}`
    }

    const newTrackList = [
      ...trackList.slice(0, selectedSegment.track),
      [
        ...trackList[selectedSegment.track].slice(0, selectedSegment.index),
        {
          ...trackList[selectedSegment.track][selectedSegment.index],
          duration: timestamp - segment.start,
          keyframe: {...segment.keyframe, start: segment.keyframe.start - segmentTimeCut},
          media: {
            ...segment.media,
            source: {...segment.media.source, element: element},
            frameBackground: frameBackground1,
            waveForm: waveForm1,
          },
        },
        {
          media: {
            ...segment.media,
            source: {...segment.media.source, element: newRightElement, id: trackId},
            frameBackground: frameBackground2,
            waveForm: waveForm2,
          },
          start: timestamp,
          duration: segment.start + segment.duration - timestamp,
          mediaStart: timestamp - segment.start + segment.mediaStart,
          keyframe: {...segment.keyframe, start: segmentTimeCut - 1 / props.projectFramerate},
        },
        ...trackList[selectedSegment.track].slice(selectedSegment.index + 1),
      ],
      ...trackList.slice(selectedSegment.track + 1),
    ]

    setTrackId((trackId) => trackId + 1)

    setTrackList(newTrackList)
  }

  const updateSegment = (id: SegmentID, newSegment: Segment) => {
    setTrackList([
      ...trackList.slice(0, id.track),
      [
        ...trackList[id.track].slice(0, id.index),
        newSegment,
        ...trackList[id.track].slice(id.index + 1),
      ],
      ...trackList.slice(id.track + 1),
    ])
  }

  const muteMedia = (isMuteAll: boolean, isMuted: boolean) => {
    if (isMuteAll) {
      trackList.forEach((tl) =>
        tl.forEach((ti) => {
          const element = ti.media.source.element
          if (element instanceof HTMLVideoElement || element instanceof HTMLAudioElement) {
            element.muted = !element.muted
          }
        })
      )
    } else {
      if (!selectedSegment) return
      const element = trackList[selectedSegment.track][selectedSegment.index].media.source.element
      if (element instanceof HTMLVideoElement || element instanceof HTMLAudioElement) {
        element.muted = !element.muted
      }
    }
  }

  const alwaysUnmuteVideo = (isAlwaysUnmute: boolean) => {
    if (selectedSegment) {
      setTrackList(
        trackList.map((tl, track) => {
          return tl.map((ti, index) => {
            if (selectedSegment.track === track && selectedSegment.index === index) {
              return {
                ...ti,
                media: {...ti.media, source: {...ti.media.source, isAlwaysUnmute: isAlwaysUnmute}},
              }
            }
            return ti
          })
        })
      )
    }
  }

  const notify = (message: string, type: 'success' | 'failed') => {
    if (type === 'success') {
      toast.success(message, {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      })
    } else if (type === 'failed') {
      toast.error(message, {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      })
    }
  }

  return (
    <>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
      <PlaybackController
        {...props}
        // mutePortionStart={mutePortionStart}
        // mutePortionEnd={mutePortionEnd}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        trackId={trackId}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        mediaList={mediaList}
        setMediaList={setMediaList}
        trackList={trackList}
        setTrackList={setTrackList}
        addMedia={addMedia}
        deleteVideo={deleteVideo}
        dragAndDrop={dragAndDrop}
        selectedSegment={selectedSegment}
        setSelectedSegment={setSelectedSegment}
        updateSegment={updateSegment}
        splitVideo={split}
        muteMedia={muteMedia}
        segments={segments}
        setSegments={setSegments}
        alwaysUnmuteVideo={alwaysUnmuteVideo}
        renderedVideoUrl={renderedVideoUrl}
        setRenderedVideoUrl={setRenderedVideoUrl}
        notify={notify}
        setTrackId={setTrackId}
        setCanvasHeight={setCanvasHeight}
        setCanvasWidth={setCanvasWidth}
      />
    </>
  )
}
