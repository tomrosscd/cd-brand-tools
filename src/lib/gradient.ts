import { brandColours, getBrandColour, isBrandColourId, type BrandColourId } from '@/brand/colours'
import { readFrame, readNumber, round, type FrameSize } from './frame'
import { seededRandom } from './random'

export const gradientColourLimits = { min: 2, max: 5 } as const

export interface GradientState extends FrameSize {
  /** Brand colours in order. Earlier colours get slightly more weight. */
  colours: readonly BrandColourId[]
  /** 0 is smooth soft fields, 1 is heavily warped and swirled. */
  chaos: number
  /** Film grain strength, 0 to 1. */
  grain: number
  seed: number
}

export interface GradientPalette {
  id: string
  label: string
  colours: readonly BrandColourId[]
}

export const gradientPalettes: readonly GradientPalette[] = [
  { id: 'greens', label: 'Greens', colours: ['dark-green', 'forest-green', 'light-green'] },
  { id: 'deep', label: 'Deep forest', colours: ['dark-green', 'black', 'forest-green'] },
  { id: 'soft', label: 'Soft light', colours: ['white', 'light-green', 'forest-green'] },
  { id: 'warm-accent', label: 'Warm accent', colours: ['dark-green', 'forest-green', 'orange'] },
  { id: 'sunlit', label: 'Sunlit', colours: ['light-green', 'yellow', 'white', 'forest-green'] },
  { id: 'full', label: 'Full palette', colours: ['dark-green', 'forest-green', 'light-green', 'yellow', 'orange'] },
]

export const defaultGradient: GradientState = {
  colours: gradientPalettes[0].colours,
  chaos: 0.35,
  grain: 0.12,
  seed: 20260917,
  width: 1920,
  height: 1080,
}

export interface GradientPoint {
  x: number
  y: number
  weight: number
}

/**
 * Places one soft field per colour. Positions are in 0 to 1 frame units, may sit slightly outside
 * the frame, and keep a minimum spacing so two colours never collapse onto one spot.
 */
export function gradientPoints(seed: number, count: number): GradientPoint[] {
  const random = seededRandom(seed)
  const points: GradientPoint[] = []
  const minSpacing = 0.55 / Math.sqrt(count)
  for (let i = 0; i < count; i += 1) {
    let candidate = { x: 0, y: 0 }
    for (let attempt = 0; attempt < 40; attempt += 1) {
      candidate = { x: -0.1 + random() * 1.2, y: -0.1 + random() * 1.2 }
      if (points.every((p) => Math.hypot(p.x - candidate.x, p.y - candidate.y) >= minSpacing)) break
    }
    points.push({ ...candidate, weight: 0.75 + random() * 0.5 + (i === 0 ? 0.25 : 0) })
  }
  return points
}

export function gradientHexes(state: GradientState): string[] {
  return state.colours.map((id) => getBrandColour(id).hex)
}

export function parseGradient(params: URLSearchParams): GradientState {
  const colours = (params.get('colours') ?? '').split(',').filter(isBrandColourId).slice(0, gradientColourLimits.max)
  return {
    colours: colours.length >= gradientColourLimits.min ? colours : defaultGradient.colours,
    chaos: readNumber(params.get('chaos'), defaultGradient.chaos, 0, 1),
    grain: readNumber(params.get('grain'), defaultGradient.grain, 0, 1),
    seed: Math.round(readNumber(params.get('seed'), defaultGradient.seed, 0, 999_999_999)),
    ...readFrame(params, defaultGradient),
  }
}

export function serialiseGradient(state: GradientState): URLSearchParams {
  return new URLSearchParams({
    colours: state.colours.join(','),
    chaos: String(round(state.chaos, 2)),
    grain: String(round(state.grain, 2)),
    seed: String(state.seed),
    w: String(state.width),
    h: String(state.height),
  })
}

/** Colours not yet in the gradient, in brand order. */
export function availableColours(state: GradientState): BrandColourId[] {
  return brandColours.map((c) => c.id).filter((id) => !state.colours.includes(id))
}

export function gradientFileName(state: GradientState, extension: string): string {
  return `convert-gradient-${state.colours.join('-')}-${state.seed}-${state.width}x${state.height}.${extension}`
}
