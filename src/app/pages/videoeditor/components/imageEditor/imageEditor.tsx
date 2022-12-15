import Konva from 'konva'
import {KonvaEventObject} from 'konva/lib/Node'
import React, {useState, createRef} from 'react'
import {Stage, Layer, Transformer} from 'react-konva'
import {Segment, SelectedNodeType} from '../../model/types'
import {useEffect} from 'react'

const ImageEditor = React.forwardRef(
  (
    props: {
      trackList: Segment[][]
      setTrackList: (segments: Segment[][]) => void
      selectedNode: SelectedNodeType
      setSelectedNode: (selectedNode: SelectedNodeType) => void
      setSelectedTransformer: (selectedTransformer: Konva.Transformer | undefined) => void
      projectWidth: number
      projectHeight: number
      canvasWidth: number
      canvasHeight: number
      setStage: (stage: Konva.Stage | undefined) => void
      updateKeyFrames: () => void
    },
    ref: React.Ref<Konva.Layer>
  ) => {
    const stageRef = createRef<Konva.Stage>()
    const transformerRef = createRef<Konva.Transformer>()

    useEffect(() => {
      transformerRef.current?.zIndex(0)
    }, [props.trackList])

    useEffect(() => {
      props.setStage(stageRef.current as Konva.Stage)
    }, [stageRef.current])

    return (
      <>
        <div className='d-flex justify-content-center align-items-center'>
          <Stage
            width={
              props.projectWidth === 0
                ? 0
                : props.projectHeight < props.canvasHeight
                ? ((props.projectWidth * props.projectHeight) / props.canvasHeight) * 2
                : ((props.projectWidth / props.projectHeight) * props.canvasHeight)
            }
            height={props.projectHeight === 0 ? 0 : props.canvasHeight}
            style={{border: props.projectHeight !== 0 ? '1px solid grey' : ''}}
            ref={stageRef}
            scaleX={1}
            scaleY={1}
            x={0}
            y={0}
            onDragEnd={props.updateKeyFrames}
          >
            <Layer ref={ref}>
              <Transformer ref={transformerRef} nodes={[]} />
            </Layer>
          </Stage>
        </div>
      </>
    )
  }
)
export default ImageEditor
