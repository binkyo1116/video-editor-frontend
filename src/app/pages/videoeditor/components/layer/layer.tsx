import React, {useEffect} from 'react'
import {Segment} from '../../model/types'

const Layer = (props: {
  trackList: Segment[][]
  setTrackList: (segments: Segment[][]) => void
  deleteCanvasElement: (track: number, index: number) => void
}) => {
  const deleteTrack = (track: number, index: number) => {
    if (props.trackList[track][index].media.source.element instanceof HTMLVideoElement)
      (props.trackList[track][index].media.source.element as HTMLVideoElement).pause()

    let newTrackList = [
      ...props.trackList.slice(0, track),
      [...props.trackList[track].slice(0, index), ...props.trackList[track].slice(index + 1)],
      ...props.trackList.slice(track + 1),
    ]

    // Clean Tracklist
    while (newTrackList.length > 0 && newTrackList[newTrackList.length - 1].length === 0)
      newTrackList.pop()
    newTrackList.push([])

    props.setTrackList(newTrackList)
    props.deleteCanvasElement(track, index)
  }

  return (
    <div className={`card h-100`} style={{overflowY: 'scroll'}}>
      <div className='card-body pt-5 pl-2 pr-2'>
        <p> Layers </p>
        {props.trackList.slice(0, props.trackList.length - 1).map((track, trackIndex) => (
          <>
            {track.map((item, index) => {
              let itemName = ''
              if (item.media.file === '') {
                itemName = item.media.thumbnail
              } else {
                const name = item.media.file.split('//')[1].split('/')[2]
                itemName = name.split('.')[0].split('---')[0] + '.' + name.split('.')[1]
              }
              return (
                <div
                  key={trackIndex + '' + index}
                  className='d-flex align-items-center justify-content-between mb-2'
                  style={{
                    border: '1px solid rgb(65, 65, 65)',
                    padding: '5px',
                    background: '#2f2f36',
                  }}
                >
                  <div className='symbol symbol-40px me-5'>
                    <span className='symbol-label bg-light-success'>
                      {/* <KTSVG
                    path='/media/icons/duotune/abstract/abs027.svg'
                    className='svg-icon-2x svg-icon-success'
                  /> */}
                      <i className='bi bi-play fs-1 text-success'></i>
                    </span>
                  </div>
                  <div className='d-flex flex-column'>
                    <a className='text-dark text-hover-primary fs-6 fw-bold'>
                      {itemName.length > 15 ? itemName.slice(0, 15) + '...' : itemName}
                    </a>
                  </div>
                  <div
                    className='align-items-center d-flex'
                    onClick={() => {
                      deleteTrack(trackIndex, index)
                    }}
                  >
                    <div className='symbol symbol-30px me-5'>
                      <span className='symbol-label bg-secondary'>
                        <i className='bi bi-trash text-danger'></i>
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

export default Layer
