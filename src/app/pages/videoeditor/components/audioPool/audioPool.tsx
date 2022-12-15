import styles from './audio.module.css'
import React, {createElement, useState} from 'react'
import {Media} from '../../model/types'
import {Droppable, Draggable} from 'react-beautiful-dnd'
import {KTSVG} from '../../../../../_metronic/helpers/components/KTSVG'
import {checkMediaType} from '../../helper'

const options = {
  types: [
    {
      accept: {
        'audio/*': ['.mp3', '.wav'],
      },
    },
  ],
  multiple: true,
  excludeAcceptAllOption: true,
}

export default function AudioPool(props: any) {
  const [status, setStatus] = useState<string>('')
  const [draggedOn, setDraggedOn] = useState<String>('')
  const listItems = props.mediaList.map((item: Media, index: number) => {
    if (item.file) {
      const name = item.file.split('//')[1].split('/')[2]
      const file = name.split('.')[0].split('---')[0] + '.' + name.split('.')[1]
      return (
        <>
          {checkMediaType(file) === 'audio' && (
            <div className='col-xl-12 hover-border hover-border-primary position-relative'>
              <Draggable key={file} draggableId={file} index={index}>
                {(provided: any) => (
                  <div
                    key={file}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <div
                      className='row m-0'
                      style={{
                        border: '1px solid rgb(65, 65, 65)',
                        padding: '5px',
                        paddingBottom: '2px',
                        background: '#2f2f36',
                      }}
                    >
                      <div className='col-xl-3'>
                        <img
                          className='rounded-2 w-100'
                          src={item.thumbnail as string}
                          alt={file}
                          style={{height: '45px'}}
                        />
                      </div>
                      <div className='col-xl-9'>
                        <p className='mt-5'>
                          {file.length > 15 ? file.slice(0, 15) + '...' : file}
                        </p>
                      </div>
                    </div>

                    <div
                      className='position-absolute'
                      style={{top: '20px', right: '20px'}}
                      onClick={() => props.deleteVideo(item)}
                    >
                      <span className='badge bg-secondry'>
                        <i className='bi bi-trash text-danger'></i>
                      </span>
                    </div>
                  </div>
                )}
              </Draggable>
            </div>
          )}
        </>
      )
    }
  })

  const onClick = async () => {
    const fileInput = document.createElement('input') as HTMLInputElement
    fileInput.type = 'file'
    fileInput.click()
    fileInput.addEventListener('change', async (e) => {
      setStatus('Loading...')
      if (fileInput.files !== null) await props.addMedia(fileInput.files)
      setStatus('')
    })
    // try {
    //   const files: File[] = []
    //   //@ts-ignore
    //   const Handle = await window.showOpenFilePicker(options)

    //   setStatus('Loading...')
    //   for (const entry of Handle) {
    //     let file = await entry.getFile()
    //     files.push(file)
    //   }
    //   await props.addMedia(files)
    //   setStatus('')
    // } catch (error) {}
  }

  const onDrag = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setStatus('Loading...')
    setDraggedOn('')
    if (!e.dataTransfer) return
    const files: File[] = []

    for (const item of Object.values(e.dataTransfer.items)) {
      const file = item.getAsFile()

      if (file !== null && file.type.includes('audio/')) files.push(file)
      else alert(`Could not upload file: ${file?.name}. Only upload videos or images.`)
    }

    await props.addMedia(files)
    setStatus('')
  }

  return (
    <div
      onDragOver={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setDraggedOn('draggedOn')
      }}
      onDragEnter={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setDraggedOn('draggedOn')
      }}
      onDragLeave={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setDraggedOn('')
      }}
      onDrop={onDrag}
      className='card rounded-2 p-6 h-100'
      style={{height: '510px', overflowY: 'scroll'}}
    >
      <Droppable droppableId='videos'>
        {(provided: any) => (
          <div className='videos' key={provided}>
            <div className='row g-4' {...provided.droppableProps} ref={provided.innerRef}>
              <p className='mb-0 mt-1'> Upload Audio </p>
              <div className='col-xl-12'>
                <div
                  className='card d-flex justify-content-center align-items-center h-100'
                  onClick={onClick}
                  style={{border: '1px dashed'}}
                >
                  <KTSVG
                    path='/media/icons/duotune/arrows/arr075.svg'
                    className='svg-icon-3x svg-icon-primary d-block my-2 flex justify-content-center text-white'
                  />
                </div>
              </div>
              {listItems}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>

      <p className={styles.loader}>{status}</p>
    </div>
  )
}
