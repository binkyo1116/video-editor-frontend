import React, {useState} from 'react'
import {Media} from '../../model/types'
import {Droppable, Draggable} from 'react-beautiful-dnd'

const textTypes = ['Header', 'Large', 'Default']
const fonts = [2, 1.5, 1]

export default function TextEditor(props: {addMedia: (file: File[]) => void}) {
  const [status, setStatus] = useState<string>('')
  const [draggedOn, setDraggedOn] = useState<String>('')

  const listItems = textTypes.map((textType: string, index: number) => (
    <div key={index} className='col-xl-12 hover-border hover-border-primary position-relative'>
     
      <Draggable key={textType} draggableId={textType} index={index}>
        {(provided: any) => (
          <div
            key={textType}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <p style={{border:'1px solid rgb(65, 65, 65)', paddingLeft:'10px', background:'#2f2f36', fontSize: `${fonts[index]}em`}} className='mt-0 mb-0'>
              {textType} Text
            </p>
          </div>
        )}
      </Draggable>
    </div>
  ))

  const onDrag = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedOn('')
    if (!e.dataTransfer) return
    const files: File[] = []

    for (const item of Object.values(e.dataTransfer.items)) {
      const file = item.getAsFile()

      if (file !== null && (file.type.includes('video/') || file.type.includes('image/')))
        files.push(file)
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
      style={{overflowY: 'auto'}}
    >
       <p> Add Text </p>
      <Droppable droppableId='texts'>
        {(provided: any) => (
          <div className='texts' key={provided}>
            <div className='row g-4' {...provided.droppableProps} ref={provided.innerRef}>
              {listItems}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  )
}
