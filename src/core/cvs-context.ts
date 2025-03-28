import type CanvasRoi from './'
import { PathTypes, Point, RoiPath } from '../types'
import { getVirtualRectPoints, countDistance } from './utils'

function setCtxStyles(this: CanvasRoi): void {
  const { globalStyles, canvasScale } = this.$opts
  if (this.$ctx)
    Object.assign(this.$ctx, globalStyles, {
      lineWidth: globalStyles.lineWidth * canvasScale
    })
}

function createCvsPath(
  this: CanvasRoi,
  type: PathTypes,
  points: Point[],
  stroke?: boolean
): void {
  if (!this.$ctx) return
  this.$ctx.beginPath()
  switch (type) {
    case 'point':
      this.$ctx.arc(
        points[0].x,
        points[0].y,
        this.$ctx.lineWidth * 1.4,
        0,
        2 * Math.PI
      )
      break
    case 'line':
    case 'rect':
    case 'polygon': {
      const truePoints = type === 'rect' ? getVirtualRectPoints(points) : points
      truePoints.forEach((point, idx) => {
        const { x, y } = point
        idx === 0 ? this.$ctx?.moveTo(x, y) : this.$ctx?.lineTo(x, y)
        stroke && type === 'polygon' && this.$ctx?.stroke()
      })
      break
    }
    case 'circle': {
      const center = points[0]
      const radius = countDistance(center, points[1])
      this.$ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
      break
    }
    default:
      break
  }
  this.$ctx.closePath()
}

function clearExistRoiPath(this: CanvasRoi) {
  if (!this.$ctx) return
  this.$ctx.clip()
  this.clearCanvas()
}

function drawNewRoiPath(this: CanvasRoi, path: RoiPath, movePoint?: Point) {
  if (!path || !this.$ctx) return
  const { type } = path
  const points = path.points.concat(movePoint ? [movePoint] : [])
  if (points.length < 2) return
  this.$ctx.save()
  this.$ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  this._createCvsPath(type, points, type === 'polygon')
  this.$ctx.fill()
  type !== 'polygon' && this.$ctx.stroke()
  type === 'polygon' && drawPointSign.call(this, points)
  this.$ctx.restore()
}

function drawExistRoiPath(
  this: CanvasRoi,
  path: RoiPath,
  index: number,
  stroke = true,
  fill = true
): void {
  if (!this.$ctx) return
  this.$ctx.save()
  const { type, points, styles, inner } = path
  if (!points || points.length < 1) return undefined
  const { blurStrokeOpacity, focusStyles } = this.$opts
  styles && Object.assign(this.$ctx, styles)
  this._createCvsPath(type, points)
  if (focusStyles) {
    index === this.choseIndex && Object.assign(this.$ctx, focusStyles)
  } else {
    this.$ctx.globalAlpha = index !== this.choseIndex ? blurStrokeOpacity : 1
  }
  if (type === 'point') {
    this.$ctx.fillStyle = this.$ctx.strokeStyle
    this.$ctx.fill()
  } else if (fill) {
    inner ? this.$ctx.fill() : clearExistRoiPath.call(this)
  }
  type !== 'point' && stroke && this.$ctx.stroke()
  !this.$opts.readonly && type === 'polygon' && drawPointSign.call(this, points)
  !focusStyles && (this.$ctx.globalAlpha = 1)

  type == 'rect' && drawRectName.call(this, path)

  this.$ctx.restore()
}

function drawRoiPaths(
  this: CanvasRoi,
  movePoint?: Point,
  notClear?: boolean
): void {
  if (!this.$cvs || !this.$ctx) return
  !notClear && this.clearCanvas()

  this.hasInvertPath = this.paths.some((path: RoiPath) => !path.inner)
  if (this.hasInvertPath) {
    /* 如果存在反选路径，则绘制反选遮层，然后镂空所有反选选区。最后对所有选区描边及非反选填充 */
    this.$ctx.fillRect(0, 0, this.$cvs.width, this.$cvs.height)
    this.paths.forEach(
      (path: RoiPath, idx: number) =>
        !path.inner && this._drawExistRoiPath(path, idx, false)
    )
    this.paths.forEach((path: RoiPath, idx: number) =>
      this._drawExistRoiPath(path, idx, true, path.inner)
    )
  } else {
    this.paths.forEach((path: RoiPath, idx: number) =>
      this._drawExistRoiPath(path, idx)
    )
  }

  this.drawing && drawNewRoiPath.call(this, this.newPath, movePoint)
}

function drawPointSign(this: CanvasRoi, points: Point[]) {
  if (!this.$ctx) return
  this.$ctx.save()
  const ctx = this.$ctx
  points.forEach((point) => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, ctx.lineWidth * 1.4, 0, 2 * Math.PI)
    ctx.fillStyle = ctx.strokeStyle
    ctx.fill()
  })
  this.$ctx.restore()
}

function drawRectName(this: CanvasRoi, path: RoiPath) {
  if (!this.$ctx) return
  const { points, name } = path
  const xOffset = this.$opts.rectText?.xOffset || 15
  const yOffset = this.$opts.rectText?.yOffset || 40
  const font = this.$opts.rectText?.font || '30px Arial'
  const styles = path.styles || this.$opts.globalStyles || {}
  if (!name) return
  if (!points || points.length < 2) return

  const ctx = this.$ctx
  ctx.save()

  const getLeftTopPoint = (points: Point[]) => {
    if (points.length === 0) return { x: 0, y: 0 }
    let { x, y } = points[0]
    for (let i = 0; i < points.length; i++) {
      const { x: x1, y: y1 } = points[i]
      x = x < x1 ? x : x1
      y = y < y1 ? y : y1
    }
    return { x, y }
  }

  const { x, y } = getLeftTopPoint(points)
  ctx.font = font
  ctx.fillStyle = 'yellow'
  if (styles.strokeStyle) {
    ctx.fillStyle = styles.strokeStyle
  }
  ctx.fillText(name, x + xOffset, y + yOffset)

  ctx.restore()
}

function drawOpeDragPoint(this: CanvasRoi, point: Point) {
  if (!this.$ctx) return
  this.$ctx.save()
  this.$ctx.beginPath()
  const {
    operateCircle: { radius, styles },
    canvasScale
  } = this.$opts
  styles && Object.assign(this.$ctx, styles)
  this.$ctx.arc(point.x, point.y, radius * canvasScale, 0, 2 * Math.PI)
  this.$ctx.stroke()
  this.$ctx.fill()
  this.$ctx.restore()
}

function drawRoiPathsWithOpe(this: CanvasRoi, circlePoint?: Point): void {
  this._drawRoiPaths()
  circlePoint && drawOpeDragPoint.call(this, circlePoint)
}

export default {
  setCtxStyles,
  createCvsPath,
  drawExistRoiPath,
  drawRoiPaths,
  drawRoiPathsWithOpe
}
