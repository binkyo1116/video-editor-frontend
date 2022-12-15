import Konva from 'konva'
import {ChangeEvent, useState} from 'react'
import {Segment, SegmentID, SelectedNodeType} from '../../model/types'
import {useEffect} from 'react'
import {CirclePicker, ColorResult, SketchPicker} from 'react-color'
import {checkMediaType} from '../../helper'

const Properties = (props: {
  selectedTransformer: Konva.Transformer | undefined
  selectedNode: SelectedNodeType
  trackList: Segment[][]
  setTrackList: (trackList: Segment[][]) => void
  updateZIndex: () => void
  projectWidth: number
  projectHeight: number
  transformer: Konva.Transformer | undefined
  selectedSegment: SegmentID | null
}) => {
  const [rotation, setRotation] = useState<number>(0)
  const [scale, setScale] = useState<number>(0)
  const [opacity, setOpacity] = useState<number>(1)
  const [textColor, setTextColor] = useState<string>()
  const [strokeColor, setStrokeColor] = useState<string>()
  const [backgroundColor, setBackgroundColor] = useState<string>()
  const [textAlign, setTextAlign] = useState<string>('left')
  const [verticalAlign, setVerticalAlign] = useState<string>('top')
  const [fontSize, setFontSize] = useState('')
  const [strokeWidth, setStrokeWidth] = useState('')
  const [isUnderline, setIsUnderline] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isTextElement, setIsTextElement] = useState(false)
  const [fonts, setFonts] = useState<string[]>([
    "'Kenia', cursive",
    "'Caveat', cursive",
    "'Diplomata SC', cursive",
    "'Encode Sans SC', sans-serif",
    "'Hanalei Fill', cursive",
    "'Kalam', cursive",
    "'Lobster', cursive",
    "'Orbitron', sans-serif",
    "'Pacifico', cursive",
    "'Permanent Marker', cursive",
    "'PT Sans Narrow', sans-serif",
    "'Rubik 80s Fade', cursive",
    "'Rubik Spray Paint', cursive",
    "'Rubik Storm', cursive",
    "'Rubik Vinyl', cursive",
    "'Satisfy', cursive",
    "'Merienda', cursive",
    "'Parisienne', cursive",
    "'Mr Dafoe', cursive",
    "'Tangerine', cursive",
    "'Combo', cursive",
    "'Sriracha', cursive",
    "'Alex Brush', cursive",
    "'Shrikhand', cursive",
    "'Monoton', cursive",
    "'Rock Salt', cursive",
    "'Reenie Beanie', cursive",
    "'Bungee Inline', cursive",
    "'Leckerli One', cursive",
    "'Rancho', cursive",
    "'Nanum Brush Script', cursive",
    "'Mansalva', cursive",
    "'Arizonia', cursive",
    "'Bowlby One SC', cursive",
    "'Henny Penny', cursive",
    "'Just Another Hand', cursive",
    "'Kristi', cursive",
    "'Qwigley', cursive",
    "'Wallpoet', cursive",
    "'Bubblegum Sans', cursive",
    "'Rubik Moonrocks', cursive",
    "'Nabla', cursive",
    "'Moo Lah Lah', cursive",
    "'Cherish', cursive",
    "'Sassy Frass', cursive",
    "'Bubblegum Sans', cursive",
    "'Kings', cursive",
    "'Oi', cursive",
    "'Are You Serious', cursive",
    "'Sevillana', cursive",
    "'Passions Conflict', cursive",
    "'Island Moments', cursive",
    "'Fleur De Leah', cursive",
    "'Geostar', cursive",
    "'Miltonian Tattoo', cursive",
    "'Neonderthaw', cursive",
    "'Ballet', cursive",
    "'M PLUS 1 Code', cursive",
    "'Hanalei', cursive",
    "'Snowburst One', cursive",
    "'Geostar Fill', cursive",
    "'Astloch ', cursive",
    "'Babylonica', cursive",
    "'Bonbon', cursive",
    "'Rubik Puddles', cursive",
    "'Rubik Wet Paint', cursive",
    "'Long Cang', cursive",
    "'Asset', cursive",
    "'Kumar One Outline', cursive",
    "'Londrina Sketch', cursive",
    "'Glass Antiqua', cursive",
    "'Sedgwick Ave Display', cursive",
    "'Birthstone Bounce', cursive",
    "'Jacques Francois Shadow', cursive",
    "'Big Shoulders Stencil Text', cursive",
    "'Lakki Reddy', cursive",
    "'Kirang Haerang', cursive",
    "'Diplomata', cursive",
    "'Fascinate', cursive",
    "'Mogra', cursive",
    "'Ribeye Marrow', cursive",
    "'Rampart One', cursive",
    "'Nosifer', cursive",
    "'Swanky and Moo Moo', cursive",
    "'Vujahday Script', cursive",
    "'Arbutus', cursive",
    "'Comforter', cursive",
    "'Rubik Microbe', cursive",
    "'Rubik Glitch', cursive",
    "'Bigelow Rules', cursive",
    "'Monofett', cursive",
    "'Akronim', cursive",
    "'Silkscreen', cursive",
    "'Bungee Shade', cursive",
    "'Dawning of a New Day', cursive",
    "'Nova Mono', cursive",
    "'Notable', cursive",
    "'Sue Ellen Francisco', cursive",
    "'Megrim', cursive",
    "'Eater', cursive",
    "'Dokdo', cursive",
    "'Geo', cursive",
    "'DotGothic16', cursive",
    "'Faster One', cursive",
    "'Freckle Face', cursive",
    "'Vast Shadow', cursive",
    "'Londrina Outline', cursive",
    "'League Script', cursive",
    "'Cormorant Unicase', cursive",
    "'Saira Stencil One', cursive",
  ])
  const [fontFamily, setFontFamily] = useState(fonts[0])

  useEffect(() => {
    if (props.selectedNode) {
      setScale(props.selectedNode?.scaleX() as number)
      setOpacity(props.selectedNode?.opacity() as number)
      setRotation(props.selectedNode?.rotation() as number)

      if (props.selectedNode instanceof Konva.Group) {
        const text = props.selectedNode.find('Text')[0] as Konva.Text
        const rect = props.selectedNode.find('Rect')[0] as Konva.Rect
        setTextColor(text.fill())
        setBackgroundColor(rect.fill())
        setTextAlign(text.align())
        setFontSize(text.fontSize().toString())
        setStrokeWidth(text.strokeWidth().toString())
        setIsItalic(text.fontStyle().includes('italic'))
        setIsBold(text.fontStyle().includes('bold'))
        setIsUnderline(text.textDecoration().includes('underline'))
        setStrokeColor(text.stroke())
        setFontFamily(text.fontFamily())
      }
      setIsTextElement(props.selectedNode instanceof Konva.Group)
    } else {
      setIsTextElement(false)
    }
  }, [props.selectedNode])

  useEffect(() => {
    if (props.selectedSegment) {
      const keyframe =
        props.trackList[props.selectedSegment.track][props.selectedSegment.index].keyframe
      const media = props.trackList[props.selectedSegment.track][props.selectedSegment.index].media
      setScale(keyframe.scaleX as number)
      setOpacity(keyframe.opacity as number)
      setRotation(keyframe.rotation as number)

      if (checkMediaType(media.file) === 'text') {
        setTextColor(keyframe.textColor)
        setBackgroundColor(keyframe.backgroundColor)
        if (keyframe.textAlign) setTextAlign(keyframe.textAlign)
        if (keyframe.verticalAlign) setVerticalAlign(keyframe.verticalAlign)
        if (media.fontSize) setFontSize(media.fontSize.toString())
      }
      setIsTextElement(checkMediaType(media.file) === 'text')
    } else {
      setIsTextElement(false)
    }
  }, [props.selectedSegment])

  const MoveToTop = () => {
    if (props.selectedNode) {
      let top = 0
      props.trackList.map((tl) => {
        top += tl.length
        return tl
      })
      const current = props.selectedNode?.zIndex() as number
      for (let i = 0; i < top - current; i++) props.selectedNode?.moveUp()
      props.updateZIndex()
    }
  }

  const MoveToBottom = () => {
    if (props.selectedNode) {
      const current = props.selectedNode?.zIndex() as number
      for (let i = 0; i < current - 1; i++) props.selectedNode?.moveDown()
      props.updateZIndex()
    }
  }

  const MoveUp = () => {
    if (props.selectedNode) {
      let top = 0
      props.trackList.map((tl) => {
        top += tl.length
        return tl
      })
      if ((props.selectedNode?.zIndex() as number) < top) {
        props.selectedNode?.moveUp()
        props.updateZIndex()
      }
    }
  }

  const MoveDown = () => {
    if (props.selectedNode) {
      if ((props.selectedNode?.zIndex() as number) > 1) {
        props.selectedNode?.moveDown()
        props.updateZIndex()
      }
    }
  }

  const updateRotation = () => {
    if (props.selectedNode) {
      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {...ti.keyframe, rotation: props.selectedNode?.rotation()},
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateOpacity = () => {
    if (props.selectedNode) {
      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {...ti.keyframe, opacity: props.selectedNode?.opacity()},
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateScale = () => {
    if (props.selectedNode) {
      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  scaleX: props.selectedNode?.scaleX(),
                  scaleY: props.selectedNode?.scaleY(),
                },
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateTextColor = (color: ColorResult) => {
    setTextColor(color.hex)
    if (props.selectedNode) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text
      text.fill(color.hex)

      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  textColor: color.hex,
                },
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateStrokeColor = (color: ColorResult) => {
    setStrokeColor(color.hex)
    if (props.selectedNode) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text
      text.stroke(color.hex)

      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  stroke: color.hex,
                },
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateBackgroudColor = (color: ColorResult) => {
    setBackgroundColor(color.hex)
    if (props.selectedNode) {
      const rect = (props.selectedNode as Konva.Group).find('Rect')[0] as Konva.Text
      rect.fill(color.hex)

      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  backgroundColor: color.hex,
                },
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateTextAlign = (event: ChangeEvent<HTMLSelectElement>) => {
    setTextAlign(event.target.value)
    if (props.selectedNode) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text
      text.align(event.target.value)

      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  textAlign: event.target.value,
                },
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateVerticalAlign = (event: ChangeEvent<HTMLSelectElement>) => {
    setVerticalAlign(event.target.value)
    if (props.selectedNode) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text
      text.verticalAlign(event.target.value)

      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  verticalAlign: event.target.value,
                },
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateFontFamily = (event: ChangeEvent<HTMLSelectElement>) => {
    setFontFamily(event.target.value)
    if (props.selectedNode) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text
      text.fontFamily(event.target.value)

      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  fontFamily: event.target.value,
                },
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateFontSize = (event: ChangeEvent<HTMLInputElement>) => {
    setFontSize(event.target.value)
    if (props.selectedNode) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text
      text.fontSize(Number(event.target.value))
      if (props.transformer) {
        const group = props.selectedNode as Konva.Group
        group.height(text.height())
        const rect = (props.selectedNode as Konva.Group).find('Rect')[0] as Konva.Text
        rect.height(text.height())
        props.transformer.forceUpdate()
      }

      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                media: {...ti.media, fontSize: Number(event.target.value)},
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateStrokeWidth = (event: ChangeEvent<HTMLInputElement>) => {
    setStrokeWidth(event.target.value)
    if (props.selectedNode) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text
      text.strokeWidth(Number(event.target.value))
      if (props.transformer) {
        const group = props.selectedNode as Konva.Group
        group.height(text.height())
        const rect = (props.selectedNode as Konva.Group).find('Rect')[0] as Konva.Text
        rect.height(text.height())
        props.transformer.forceUpdate()
      }

      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                media: {...ti.media, strokeWidth: Number(event.target.value)},
              }
            }
            return ti
          })
        })
      )
    }
  }

  const updateFontStyleAsItalic = () => {
    if (props.selectedNode && props.selectedSegment) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text

      let fontStyle =
        props.trackList[props.selectedSegment.track][props.selectedSegment.index].keyframe
          .fontStyle!
      if (isItalic) {
        fontStyle = fontStyle.replace('italic', '')
      } else {
        if (fontStyle.includes('bold')) {
          fontStyle = 'italic bold'
        } else fontStyle = 'italic'
      }
      console.log(fontStyle)

      fontStyle = fontStyle.trim()
      text.fontStyle(fontStyle)
      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  fontStyle,
                },
              }
            }
            return ti
          })
        })
      )
      setIsItalic((italic) => !italic)
    }
  }

  const updateFontStyleAsBold = () => {
    if (props.selectedNode && props.selectedSegment) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text

      let fontStyle =
        props.trackList[props.selectedSegment.track][props.selectedSegment.index].keyframe
          .fontStyle!
      if (isBold) {
        fontStyle = fontStyle.replace('bold', '')
      } else {
        if (fontStyle.includes('italic')) {
          fontStyle = 'italic bold'
        } else {
          fontStyle = 'bold'
        }
      }
      console.log(fontStyle)

      fontStyle = fontStyle.trim()
      text.fontStyle(fontStyle)
      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  fontStyle,
                },
              }
            }
            return ti
          })
        })
      )
      setIsBold((bold) => !bold)
    }
  }

  const updateFontStyleAsUnderline = () => {
    if (props.selectedNode && props.selectedSegment) {
      const text = (props.selectedNode as Konva.Group).find('Text')[0] as Konva.Text

      const textDecoration = isUnderline ? '' : 'underline'

      text.textDecoration(textDecoration)
      const id = props.selectedNode?.id()
      const track = Number(id?.split('-')[0])
      const index = Number(id?.split('-')[1])
      props.setTrackList(
        props.trackList.map((tl, t) => {
          return tl.map((ti, i) => {
            if (track === t && index === i) {
              return {
                ...ti,
                keyframe: {
                  ...ti.keyframe,
                  textDecoration,
                },
              }
            }
            return ti
          })
        })
      )
      setIsUnderline((underline) => !underline)
    }
  }

  return (
    <div className='card right-sidepanel pt-3' style={{overflowY: 'scroll', height: '50vh'}}>
      <div className='row'>
        <div className='col-xl-12  d-flex align-items-center'>
          <p className='' style={{color: '#9d9d9d', fontSize: '16px'}}>
            {' '}
            Video Details{' '}
          </p>
        </div>

        <div className='col-xl-12 mb-6 d-flex align-items-center'>
          Base Video Resolution: {props.projectWidth} X {props.projectHeight}
        </div>
        <hr />
        <div className='col-xl-12 mb-6 propertyBtn'>
          <p style={{color: '#9d9d9d', fontSize: '16px'}}>Layer Adjustment</p>
          <div className='row g-2'>
            <div className='col-xl-6'>
              <button className='w-100' onClick={MoveToTop} id='toTop'>
                Move top
              </button>
            </div>
            <div className='col-xl-6'>
              <button className='w-100' onClick={MoveToBottom} id='toBottom'>
                Move bottom
              </button>
            </div>
            <div className='col-xl-6'>
              <button className='w-100' onClick={MoveUp} id='up'>
                Move up
              </button>
            </div>
            <div className='col-xl-6'>
              <button className='w-100' onClick={MoveDown} id='down'>
                Move down
              </button>
            </div>
          </div>
        </div>
        <hr />
        <div className='col-xl-12 mb-6 propertyBtn'>
          <p style={{color: '#9d9d9d', fontSize: '16px'}}> Video Effects </p>
          <p>Rotate</p>
          <div className='row gx-2 justify-content-center'>
            <div className='col-xl-3'>
              <button
                className='w-100'
                onClick={() => {
                  props.selectedNode?.rotation(1)
                  props.selectedNode?.rotate(rotation - 1)
                  setRotation((previsousDegree) => previsousDegree - 1)
                  updateRotation()
                }}
              >
                -
              </button>
            </div>
            <div className='col-xl-6'>
              <input
                className='w-100'
                type='number'
                min={0}
                value={rotation}
                style={{textAlign: 'center'}}
                onChange={(e) => {
                  const delta = parseInt(e.target.value)
                  setRotation(delta > 360 ? (delta < 0 ? 360 : delta) : delta)
                  props.selectedNode?.rotation(1)
                  props.selectedNode?.rotate(delta)
                  updateRotation()
                }}
              />
            </div>
            <div className='col-xl-3'>
              <button
                className='w-100'
                onClick={() => {
                  props.selectedNode?.rotation(1)
                  props.selectedNode?.rotate(rotation + 1)
                  setRotation((previsousDegree) => previsousDegree + 1)
                  updateRotation()
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
        {!isTextElement && (
          <div className='col-xl-12  mb-6'>
            <p>Zoom</p>
            <input
              className='w-100'
              type='range'
              min={0.25}
              step={0.1}
              max={4}
              value={scale}
              onChange={(e) => {
                const _scale = parseFloat(e.target.value)
                if (props.selectedNode) {
                  props.selectedNode?.scaleX(_scale)
                  props.selectedNode?.scaleY(_scale)
                }
                setScale(_scale)
                updateScale()
              }}
            />
          </div>
        )}
        <div className='col-xl-12 mb-5'>
          <p>Opacity</p>
          <div className='d-flex justify-content-center'>
            <input
              className='w-100'
              type='range'
              min={0}
              step={0.05}
              max={1}
              value={opacity}
              onChange={(e) => {
                const _opacity = parseFloat(e.target.value)
                props.selectedNode?.opacity(_opacity)
                setOpacity(_opacity)
                updateOpacity()
              }}
            />
          </div>
        </div>

        {isTextElement && (
          <>
            <hr />
            <div className='col-xl-12'>
              <p style={{color: '#9d9d9d', fontSize: '16px'}}>Text Effects</p>
            </div>
            <div className='col-xl-12 mb-6 animation-select-alignment'>
              Font Family
              <select
                className='form-control select2'
                value={fontFamily}
                style={{fontSize: 20, fontFamily: fontFamily}}
                onChange={updateFontFamily}
              >
                {fonts.map((font) => (
                  <option style={{fontSize: 20, fontFamily: font}} key={font} value={font}>
                    {font.split("'")[1]}
                  </option>
                ))}
              </select>
            </div>
            <div className='row gx-2'>
              <div className='col-xl-4 mb-6 animation-select-alignment'>
                Text Align
                <select
                  className='form-control select2'
                  value={textAlign}
                  onChange={updateTextAlign}
                >
                  <option value={'left'}>Left</option>
                  <option value={'center'}>Center</option>
                  <option value={'right'}>Right</option>
                </select>
              </div>
              <div className='col-xl-4 mb-6 animation-select-alignment'>
                Vertical Align
                <select
                  className='form-control select2'
                  value={verticalAlign}
                  onChange={updateVerticalAlign}
                >
                  <option value={'top'}>Top</option>
                  <option value={'middle'}>Middle</option>
                  <option value={'bottom'}>Bottom</option>
                </select>
              </div>
              <div className='col-xl-4 mb-6 animation-select-alignment'>
                Font Size
                <input
                  className='form-control'
                  value={fontSize}
                  min={0}
                  onChange={updateFontSize}
                  type='number'
                />
              </div>
            </div>
            <div className='row gx-2'>
              <div className='col-xl-8 mb-6 animation-select-alignment'>
                Text Decoration
                <div className='row gx-2 mt-2'>
                  <div className='col-xl-4'>
                    <button
                      className={`btn ${
                        isBold ? 'btn-primary' : 'btn-secondary'
                      }  d-flex justify-content-center align-items-center`}
                      style={{width: '30px', height: '30px'}}
                      title='Bold'
                      onClick={updateFontStyleAsBold}
                    >
                      <i className='bi bi-type-bold fs-6'></i>
                    </button>
                  </div>
                  <div className='col-xl-4'>
                    <button
                      className={`btn ${
                        isItalic ? 'btn-primary' : 'btn-secondary'
                      }  d-flex justify-content-center align-items-center`}
                      style={{width: '30px', height: '30px'}}
                      title='Italic'
                      onClick={updateFontStyleAsItalic}
                    >
                      <i className='bi bi-type-italic fs-6'></i>
                    </button>
                  </div>
                  <div className='col-xl-4'>
                    <button
                      className={`btn ${
                        isUnderline ? 'btn-primary' : 'btn-secondary'
                      }  d-flex justify-content-center align-items-center`}
                      style={{width: '30px', height: '30px'}}
                      title='Underline'
                      onClick={updateFontStyleAsUnderline}
                    >
                      <i className='bi bi-type-underline fs-6'></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className='col-xl-4 mb-6 animation-select-alignment'>
                Stroke Width
                <input
                  className='form-control'
                  value={strokeWidth}
                  min={0}
                  onChange={updateStrokeWidth}
                  type='number'
                />
              </div>
            </div>

            <div className='col-xl-12 mb-6'>
              <p>Text Color:</p>
              <CirclePicker color={textColor} width='200' onChange={updateTextColor} />
            </div>
            <div className='col-xl-12 mb-6'>
              <SketchPicker color={textColor} width='200' onChange={updateTextColor} />
            </div>
            <div className='col-xl-12 mb-6'>
              <p>Background Color:</p>
              <CirclePicker color={backgroundColor} width='200' onChange={updateBackgroudColor} />
            </div>
            <div className='col-xl-12 mb-6'>
              <SketchPicker color={backgroundColor} width='200' onChange={updateBackgroudColor} />
            </div>
            <div className='col-xl-12 mb-6'>
              <p>Stroke Color:</p>
              <CirclePicker color={strokeColor} width='200' onChange={updateStrokeColor} />
            </div>
            <div className='col-xl-12 mb-6'>
              <SketchPicker color={strokeColor} width='200' onChange={updateStrokeColor} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Properties
