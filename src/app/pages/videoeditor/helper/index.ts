import {Image} from 'gif-viewer/lib/types'
import Konva from 'konva'

type mediaType = 'text' | 'audio' | 'video' | 'image' | 'unkown'

export const checkMediaType = (name: string): mediaType => {
  if (name === '') {
    return 'text'
  } else if (name.endsWith('.mp3') || name.endsWith('.wav')) {
    return 'audio'
  } else if (
    name.endsWith('.mp4') ||
    name.endsWith('.mov') ||
    name.endsWith('.wmv') ||
    name.endsWith('.avi') ||
    name.endsWith('.flv')
  ) {
    return 'video'
  } else if (
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.gif') ||
    name.endsWith('.jpeg')
  ) {
    return 'image'
  } else {
    return 'unkown'
  }
}

export const formatTime = (time: number) => {
  let s = parseFloat((time / 1000).toFixed(2))

  let currentMinute = Math.floor(s / 60)
  let currentSecond = Math.floor(s / 1) - currentMinute * 60
  let currentMillisecond = (s - Math.floor(s / 1)) * 100
  currentSecond = currentSecond + Math.floor(currentMillisecond / 30)
  currentMillisecond = currentMillisecond - 30 * Math.floor(currentMillisecond / 30)
  let minute = String(currentMinute)
  while (minute.length < (2 || 2)) {
    minute = '0' + minute
  }
  let second = String(currentSecond)
  while (second.length < (2 || 2)) {
    second = '0' + second
  }
  let millisecond = currentMillisecond.toFixed(0)
  while (millisecond.length < (2 || 2)) {
    millisecond = '0' + millisecond
  }

  return minute + ':' + second + ':' + millisecond
}

export class GifPlayer {
  images: Image[]
  imageIndex: number
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  konva: Konva.Image
  isPlaying: boolean

  constructor(_images: Image[], _canvas: HTMLCanvasElement, _konva: Konva.Image) {
    this.images = _images
    this.canvas = _canvas
    if (this.images[0].imageDescriptor) {
      this.canvas.width = this.images[0].imageDescriptor.width
      this.canvas.height = this.images[0].imageDescriptor.height
    }
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.imageIndex = 0
    this.konva = _konva
    this.isPlaying = true
  }

  sleep = (time: number) =>
    new Promise<void>((resolve) => {
      setTimeout(() => resolve(), time * 10)
    })

  playFrame = async () => {
    const image = this.images[this.imageIndex]
    const {graphicsControlExtension, imageDescriptor, subImageData} = image
    const delayTime = graphicsControlExtension?.delayTime
    const disposalMethod = graphicsControlExtension?.packedField?.disposalMethod

    if (disposalMethod === 2) {
      this.ctx.clearRect(0, 0, this.width, this.height)
    } else if (disposalMethod === 3) {
      this.update()
    }
    const imageData = subImageData?.imageData
    const img = await createImageBitmap(imageData as ImageData)

    if (imageDescriptor) {
      const {left, top, width, height} = imageDescriptor
      this.ctx.drawImage(img, left, top, width, height)
    }

    await this.sleep(delayTime as number)
    this.konva.image(this.canvas)
    this.update()
  }

  update = () => {
    this.imageIndex++
    if (this.imageIndex >= this.images.length) {
      this.imageIndex = 0
    }
    if (!this.isPlaying) return
    requestAnimationFrame(this.playFrame)
  }

  play = () => {
    this.isPlaying = true
    requestAnimationFrame(this.playFrame)
  }

  pause = () => {
    this.isPlaying = false
  }
}
