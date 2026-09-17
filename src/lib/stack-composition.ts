import { logoAssets } from '@/brand/assets.generated'
import type { BrandAsset } from '@/brand/asset-types'
import { getBrandColour, isBrandColourId, type BrandColourId } from '@/brand/colours'
import { stacks } from '@/brand/stacks.generated'
import type { StackArtwork } from '@/brand/stack-types'
import { readFrame, readNumber, round, type FrameSize } from './frame'
import {
  defaultGradient,
  gradientStyleOf,
  parseGradientStyle,
  writeGradientStyle,
  type GradientStyle,
} from './gradient'
import { shapeMarkup } from './svg-markup'

export const overlayKinds = ['none', 'Logo', 'Straight', 'Icon'] as const
export type OverlayKind = (typeof overlayKinds)[number]

export const overlayColours = ['White', 'Light Green', 'Dark Green', 'Black'] as const
export type OverlayColour = (typeof overlayColours)[number]

export const overlayPositions = [
  'top-left',
  'top-centre',
  'top-right',
  'centre-left',
  'centre',
  'centre-right',
  'bottom-left',
  'bottom-centre',
  'bottom-right',
] as const
export type OverlayPosition = (typeof overlayPositions)[number]

export interface StackComposition extends FrameSize {
  stackId: string
  stackColour: BrandColourId
  /** A brand colour, transparent, or the gradient described by `gradient`. */
  background: BrandColourId | 'none' | 'gradient'
  /** Used when `background` is `gradient`. Kept when switching away so it can be switched back. */
  gradient: GradientStyle
  /** Stack centre as a fraction of frame width. May be outside 0 to 1 to crop. */
  x: number
  /** Stack centre as a fraction of frame height. */
  y: number
  /** Stack width as a fraction of frame width. */
  scale: number
  overlay: {
    kind: OverlayKind
    colour: OverlayColour
    position: OverlayPosition
    /** Overlay height as a fraction of the frame's shorter side. */
    size: number
  }
}

export const compositionLimits = {
  position: { min: -0.5, max: 1.5 },
  scale: { min: 0.05, max: 3 },
  overlaySize: { min: 0.02, max: 0.5 },
} as const

export const defaultComposition: StackComposition = {
  width: 1920,
  height: 1080,
  stackId: 'stack-01',
  stackColour: 'light-green',
  background: 'dark-green',
  gradient: gradientStyleOf(defaultGradient),
  x: 0.72,
  y: 0.55,
  scale: 0.75,
  overlay: { kind: 'Logo', colour: 'White', position: 'bottom-left', size: 0.05 },
}

export function getStack(id: string): StackArtwork {
  return stacks.find((s) => s.id === id) ?? stacks[0]
}

/** Picks a different stack. Every other setting is kept. */
export function randomiseStack(state: StackComposition, random = Math.random): StackComposition {
  const others = stacks.filter((s) => s.id !== state.stackId)
  const next = others[Math.floor(random() * others.length)] ?? stacks[0]
  return { ...state, stackId: next.id }
}

export function overlayAsset(kind: OverlayKind, colour: OverlayColour): BrandAsset | undefined {
  if (kind === 'none') return undefined
  return logoAssets.find((a) => a.family === kind && a.colour === colour && a.format === 'svg' && !a.clearSpace)
}

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export function stackBox(state: StackComposition): Box & { factor: number } {
  const stack = getStack(state.stackId)
  const width = state.width * state.scale
  const factor = width / stack.width
  const height = stack.height * factor
  return { x: state.x * state.width - width / 2, y: state.y * state.height - height / 2, width, height, factor }
}

export function overlayBox(state: StackComposition, asset: BrandAsset): Box {
  const [, , vbWidth, vbHeight] = asset.geometry!.viewBox.split(/\s+/).map(Number)
  const shortSide = Math.min(state.width, state.height)
  const height = shortSide * state.overlay.size
  const width = (vbWidth / vbHeight) * height
  const margin = shortSide * 0.06
  const [vertical, horizontal = 'centre'] =
    state.overlay.position === 'centre' ? ['centre'] : state.overlay.position.split('-')
  const x =
    horizontal === 'left' ? margin : horizontal === 'right' ? state.width - margin - width : (state.width - width) / 2
  const y =
    vertical === 'top' ? margin : vertical === 'bottom' ? state.height - margin - height : (state.height - height) / 2
  return { x, y, width, height }
}

const num = (value: number) => String(round(value, 3))

/**
 * The composition as a standalone SVG document. Uses no element IDs or classes, so several exports
 * can be inlined into one page without collisions. Geometry is emitted exactly as supplied.
 */
export function compositionToSvg(
  state: StackComposition,
  options: {
    /** Raster image of the gradient background. Without it a gradient background is left out, for layering over a canvas. */
    gradientHref?: string
  } = {},
): string {
  const stack = getStack(state.stackId)
  const box = stackBox(state)
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${state.width}" height="${state.height}" viewBox="0 0 ${state.width} ${state.height}">`,
  ]
  if (state.background === 'gradient') {
    if (options.gradientHref) {
      parts.push(
        `<image href="${options.gradientHref}" width="${state.width}" height="${state.height}" preserveAspectRatio="none"/>`,
      )
    }
  } else if (state.background !== 'none') {
    parts.push(`<rect width="${state.width}" height="${state.height}" fill="${getBrandColour(state.background).hex}"/>`)
  }
  parts.push(
    `<g transform="translate(${num(box.x)} ${num(box.y)}) scale(${num(box.factor)})" fill="${getBrandColour(state.stackColour).hex}">`,
    ...stack.paths.map((d) => `<path d="${d}"/>`),
    '</g>',
  )
  const asset = overlayAsset(state.overlay.kind, state.overlay.colour)
  if (asset?.geometry) {
    const box = overlayBox(state, asset)
    const [minX, minY, vbWidth] = asset.geometry.viewBox.split(/\s+/).map(Number)
    const factor = box.width / vbWidth
    parts.push(
      `<g transform="translate(${num(box.x)} ${num(box.y)}) scale(${num(factor)}) translate(${-minX} ${-minY})" fill="${asset.geometry.fill}">`,
      ...asset.geometry.shapes.map(shapeMarkup),
      '</g>',
    )
  }
  parts.push('</svg>')
  return parts.join('')
}

const isOneOf = <T extends string>(values: readonly T[], value: string | null): value is T =>
  value !== null && (values as readonly string[]).includes(value)

export function parseComposition(params: URLSearchParams): StackComposition {
  const d = defaultComposition
  const stackParam = params.get('stack')
  const stackColour = params.get('colour')
  const background = params.get('bg')
  const kind = params.get('logo')
  const colour = params.get('logoColour')
  const position = params.get('logoPos')
  const { position: pos, scale, overlaySize } = compositionLimits
  return {
    ...readFrame(params, d),
    stackId: stacks.some((s) => s.id === `stack-${stackParam}`) ? `stack-${stackParam}` : d.stackId,
    stackColour: stackColour && isBrandColourId(stackColour) ? stackColour : d.stackColour,
    background:
      background === 'none' || background === 'gradient' || (background && isBrandColourId(background))
        ? background
        : d.background,
    gradient: params.has('gColours') ? parseGradientStyle(params, 'g') : d.gradient,
    x: readNumber(params.get('x'), d.x, pos.min, pos.max),
    y: readNumber(params.get('y'), d.y, pos.min, pos.max),
    scale: readNumber(params.get('scale'), d.scale, scale.min, scale.max),
    overlay: {
      kind: isOneOf(overlayKinds, kind) ? kind : d.overlay.kind,
      colour: isOneOf(overlayColours, colour) ? colour : d.overlay.colour,
      position: isOneOf(overlayPositions, position) ? position : d.overlay.position,
      size: readNumber(params.get('logoSize'), d.overlay.size, overlaySize.min, overlaySize.max),
    },
  }
}

export function serialiseComposition(state: StackComposition): URLSearchParams {
  const params = new URLSearchParams({
    stack: state.stackId.replace('stack-', ''),
    colour: state.stackColour,
    bg: state.background,
    x: String(round(state.x)),
    y: String(round(state.y)),
    scale: String(round(state.scale)),
    w: String(state.width),
    h: String(state.height),
    logo: state.overlay.kind,
  })
  if (state.background === 'gradient') writeGradientStyle(params, state.gradient, 'g')
  if (state.overlay.kind !== 'none') {
    params.set('logoColour', state.overlay.colour)
    params.set('logoPos', state.overlay.position)
    params.set('logoSize', String(round(state.overlay.size)))
  }
  return params
}

export function compositionFileName(state: StackComposition, extension: string): string {
  return `convert-${state.stackId}-${state.stackColour}-${state.width}x${state.height}.${extension}`
}
