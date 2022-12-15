import {ChangeEvent} from 'react'
import {useState} from 'react'
import {Segment, SegmentID} from '../../model/types'
import {useEffect} from 'react'
import {checkMediaType, formatTime} from '../../helper'
import 'react-toastify/dist/ReactToastify.css'

export default function Controls({
  playVideo,
  pauseVideo,
  isPlaying,
  currentTime,
  projectDuration,
  setCurrentTime,
  splitVideo,
  trackList,
  selectedSegment,
  deleteSelectedSegment,
  setScaleFactor,
  scaleFactor,
  stretchImage,
  muteMedia,
  saveProject,
  notify,
}: {
  playVideo: any
  pauseVideo: any
  isPlaying: boolean
  currentTime: number
  projectDuration: number
  projectWidth: number
  projectHeight: number
  splitVideo: (timestamp: number) => Promise<void>
  setCurrentTime: (timestamp: number) => void
  trackList: Segment[][]
  selectedSegment: SegmentID | null
  deleteSelectedSegment: any
  setScaleFactor: (scale: number) => void
  scaleFactor: number
  stretchImage: () => void
  muteMedia: (isMuteAll: boolean, isMute: boolean) => void
  saveProject: (isRendering: boolean) => Promise<any>
  alwaysUnmuteVideo: (isAlwaysUnmute: boolean) => void
  notify: (message: string, type: 'success' | 'failed') => void
}) {
  const [isMuted, setIsMuted] = useState(false)
  const [isPossibleStreched, setIsPossibleStreched] = useState(false)
  const [isPossibleMuted, setIsPossibleMuted] = useState(true)
  const [isVideo, setIsVideo] = useState(false)
  const [isAlwaysMute, setIsAlwaysMute] = useState(false)

  useEffect(() => {
    if (selectedSegment) {
      const source = trackList[selectedSegment.track][selectedSegment.index].media.source
      setIsMuted(source.isMute)

      const file = trackList[selectedSegment.track][selectedSegment.index].media.file

      if (checkMediaType(file) === 'image' || checkMediaType(file) === 'text') {
        setIsVideo(false)
        setIsPossibleStreched(true)
        setIsPossibleMuted(false)
      } else {
        setIsPossibleStreched(false)
        setIsPossibleMuted(true)
        if (checkMediaType(file) === 'video') {
          setIsAlwaysMute(source.isAlwaysUnmute as boolean)
          setIsVideo(true)
        } else {
          setIsVideo(false)
        }
      }
    } else {
      let unmuted = false
      trackList.forEach((track) =>
        track.forEach((ti) => {
          if (
            checkMediaType(ti.media.file) === 'video' ||
            checkMediaType(ti.media.file) === 'audio'
          ) {
            unmuted ||= !ti.media.source.isMute
          }
        })
      )
      setIsMuted(!unmuted)
      setIsPossibleStreched(false)
      setIsPossibleMuted(true)
      setIsVideo(false)
    }
  }, [selectedSegment, trackList])

  const togglePlaying = () => {
    if (isPlaying) {
      pauseVideo()
    } else {
      playVideo()
    }
  }

  const increaseScale = () => {
    setScaleFactor(Math.min(1, scaleFactor * 1.2))
  }

  const decreaseScale = () => {
    setScaleFactor(Math.max(0.0001, scaleFactor * 0.8))
  }

  const onSeek = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(+event.target.value * projectDuration)
  }

  const createSplit = async () => {
    await splitVideo(currentTime)
  }

  const mute = () => {
    muteMedia(selectedSegment === null, !isMuted)
    setIsMuted(!isMuted)
  }

  const save = async () => {
    const updatedProject = await saveProject(false)
    if (updatedProject) {
      notify('🦄 Saved successfully', 'success')
    }
  }

  return (
    <>
      <div className='row mt-1'>
        <div className='col-xl-1' style={{width: '70px', height: '25px', marginRight: '5px'}}>
          <button
            className='btn btn-primary d-flex justify-content-center align-items-center'
            style={{width: '70px', height: '25px'}}
            onClick={togglePlaying}
          >
            {isPlaying ? (
              <i className='bi bi-stop-fill fs-5'></i>
            ) : (
              <i className='bi bi-play-fill fs-5'></i>
            )}
            <span> {isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
        <div className='col-xl-1' style={{width: '70px', height: '25px', marginRight: '5px'}}>
          <button
            className='btn btn-secondary d-flex justify-content-center align-items-center'
            style={{width: '70px', height: '25px'}}
            onClick={createSplit}
            title='Split'
          >
            <i className='bi bi-scissors fs-5'></i>
            <span> Trim</span>
          </button>
        </div>
        <div className='col-xl-1' style={{width: '70px', height: '25px', marginRight: '5px'}}>
          <button
            className='btn btn-secondary d-flex justify-content-center align-items-center'
            style={{width: '70px', height: '25px'}}
            onClick={save}
            title='Save Project'
          >
            <i className='bi bi-files fs-5'></i>
            <span> Save </span>
          </button>
        </div>

        {/* {isVideo && (
          <div className='col-xl-2'>
            <div className='form-check form-check-custom form-check-solid'>
              <input
                className='form-check-input'
                onChange={(e) => {
                  setIsAlwaysMute(e.target.checked)
                  alwaysUnmuteVideo(e.target.checked)
                }}
                checked={isAlwaysMute}
                type='checkbox'
                id='flexCheckDefault'
              />
              <label className='form-check-label' htmlFor='flexCheckDefault'>
                Is always unmute?
              </label>
            </div>
          </div>
        )} */}

        {isPossibleMuted && (
          <div className='col-xl-1' style={{width: '95px', height: '25px', marginRight: '5px'}}>
            <button
              className='btn btn-secondary d-flex justify-content-center align-items-center'
              style={{width: '95px', height: '25px'}}
              onClick={mute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <i className='bi bi-volume-up fs-3'></i>
              ) : (
                <i className='bi bi-volume-mute fs-3'></i>
              )}
              <span> {isMuted ? 'mute' : 'Unmute'} </span>
            </button>
          </div>
          // <div className='col-xl-1'  style={{width: '70px', height: '25px',marginRight:'5px'}}>
        )}
        {isPossibleStreched && (
          <div className='col-xl-1' style={{width: '90px', height: '25px', marginRight: '5px'}}>
            <button
              className='btn btn-secondary d-flex justify-content-center align-items-center'
              style={{width: '90px', height: '25px'}}
              onClick={stretchImage}
              title='Stretch'
            >
              <i className='bi bi-arrow-left-right fs-3'></i>
              <span>Stretch</span>
            </button>
          </div>
        )}
        {selectedSegment && (
          <div className='col-xl-1' style={{width: '95px', height: '25px', marginRight: '5px'}}>
            <button
              className='btn btn-secondary d-flex justify-content-center align-items-center'
              style={{width: '95px', height: '25px'}}
              onClick={deleteSelectedSegment}
              title='Delete'
            >
              <i className='bi bi-trash fs-3'></i>
              <span> Delete </span>
            </button>
          </div>
        )}

        <div className='col-xl-3 row'>
          <div className='col-xl-2'>
            <button
              className='btn d-flex justify-content-center align-items-center'
              onClick={decreaseScale}
              title='Zoom-out'
            >
              <i className='bi bi-zoom-out fs-5'></i>
            </button>
          </div>
          <div className='col-xl-8 d-flex justify-content-center'>
            <input
              className='w-100'
              type='range'
              min='0'
              max='1'
              step={0.1}
              onChange={onSeek}
            ></input>
          </div>
          <div className='col-xl-2'>
            <button
              className='btn d-flex justify-content-center align-items-center'
              onClick={increaseScale}
              title='Zoom-in'
            >
              <i className='bi bi-zoom-in fs-5'></i>
            </button>
          </div>
        </div>
        <div className='col-auto'></div>
        {/* <div className='col-xl-2 col-auto' style={{height: '25px', marginRight: '5px'}}>
          <button
            className='btn btn-primary d-flex justify-content-center align-items-center'
            onClick={deleteSelectedSegment}
            style={{height: '25px'}}
            title='Export Project'
          >
            <span> Export Project </span>
          </button>
        </div> */}
      </div>
      <div className='row mt-1 mb-5'>
        <div className='col-xl-1 text-center'>{formatTime(currentTime)}</div>
        <div className='col-xl-10 row'>
          <input
            type='range'
            min='0'
            max='1'
            step={0.001}
            onChange={onSeek}
            value={projectDuration === 0 ? 0 : currentTime / projectDuration}
          ></input>
        </div>
        <div className='col-xl-1 text-center'>{formatTime(projectDuration)}</div>
      </div>
    </>
  )
}
