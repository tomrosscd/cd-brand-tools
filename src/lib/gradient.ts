import { brandColours, getBrandColour, isBrandColourId, type BrandColourId } from '@/brand/colours'
import { clamp, writePaper, readFrame, readNumber, round, type FrameSize } from './frame'
import { seededRandom } from './random'

export const gradientColourLimits = { min: 2, max: 5 } as const

export interface GradientStyle {
  /** Brand colours in order. Earlier colours get slightly more weight. */
  colours: readonly BrandColourId[]
  /** 0 is smooth soft fields, 1 is heavily warped and swirled. */
  chaos: number
  /** Film grain strength, 0 to 1. */
  grain: number
  /** Grain spacing per 1000 units on the shorter side; 0 preserves legacy pixel grain. */
  grainSize: number
  /** Broad, gentle bending, independent of legacy chaos. */
  flow: number
  glowSize: number
  balance: number
  softness: number
  /** Shift the accent fields in frame units without changing their seed. */
  offsetX: number
  offsetY: number
  variation: number
  seed: number
}

export interface GradientState extends GradientStyle, FrameSize {}

export interface GradientPalette {
  id: string
  label: string
  colours: readonly BrandColourId[]
}

export const gradientPalettes: readonly GradientPalette[] = [
  { id: 'dark-glow', label: 'Dark glow', colours: ['dark-green', 'light-green'] },
  { id: 'dark-forest-glow', label: 'Dark forest glow', colours: ['dark-green', 'forest-green', 'light-green'] },
  { id: 'greens', label: 'Greens', colours: ['dark-green', 'forest-green', 'light-green'] },
  { id: 'deep', label: 'Deep forest', colours: ['dark-green', 'black', 'forest-green'] },
  { id: 'soft', label: 'Soft light', colours: ['white', 'light-green', 'forest-green'] },
  { id: 'warm-accent', label: 'Warm accent', colours: ['dark-green', 'forest-green', 'orange'] },
  { id: 'sunlit', label: 'Sunlit', colours: ['light-green', 'yellow', 'white', 'forest-green'] },
  { id: 'full', label: 'Full palette', colours: ['dark-green', 'forest-green', 'light-green', 'yellow', 'orange'] },
]

export const defaultGradient: GradientState = {
  colours: gradientPalettes[0].colours,
  chaos: 0,
  flow: 0.15,
  glowSize: 0.5,
  balance: 0.5,
  softness: 0.5,
  offsetX: 0,
  offsetY: 0,
  variation: 0.2,
  grain: 0.18,
  grainSize: 2,
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
    // The first colour leads: it gets roughly three times the pull of the others, so it fills most of the frame.
    points.push({ ...candidate, weight: i === 0 ? 2.6 + random() * 0.4 : 0.7 + random() * 0.4 })
  }
  return points
}

export function gradientHexes(state: Pick<GradientStyle, 'colours'>): string[] {
  return state.colours.map((id) => getBrandColour(id).hex)
}

export const gradientControlKeys = [
  'flow',
  'glowSize',
  'balance',
  'softness',
  'offsetX',
  'offsetY',
  'variation',
] as const

const paramKey = (prefix: string, name: string) => (prefix ? `${prefix}${name[0].toUpperCase()}${name.slice(1)}` : name)

/** Reads a gradient style. A prefix namespaces the keys, e.g. `g` reads `gColours`, `gChaos`. */
export function parseGradientStyle(params: URLSearchParams, prefix = ''): GradientStyle {
  const key = (name: string) => paramKey(prefix, name)
  const colours = (params.get(key('colours')) ?? '')
    .split(',')
    .filter(isBrandColourId)
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, gradientColourLimits.max)
  return {
    colours: colours.length >= gradientColourLimits.min ? colours : defaultGradient.colours,
    chaos: readNumber(params.get(key('chaos')), defaultGradient.chaos, 0, 1),
    ...(Object.fromEntries(
      gradientControlKeys.map((name) => [
        name,
        readNumber(
          params.get(key(name)),
          name === 'flow' && params.has(key('chaos')) ? 0 : defaultGradient[name],
          name === 'offsetX' || name === 'offsetY' ? -1.2 : 0,
          name === 'offsetX' || name === 'offsetY' ? 1.2 : 1,
        ),
      ]),
    ) as Pick<GradientStyle, (typeof gradientControlKeys)[number]>),
    grain: readNumber(params.get(key('grain')), defaultGradient.grain, 0, 1),
    grainSize: readNumber(
      params.get(key('grainSize')),
      params.has(key('grain')) || params.has(key('seed')) ? 0 : defaultGradient.grainSize,
      0,
      12,
    ),
    seed: Math.round(readNumber(params.get(key('seed')), defaultGradient.seed, 0, 999_999_999)),
  }
}

export function writeGradientStyle(params: URLSearchParams, style: GradientStyle, prefix = '') {
  const key = (name: string) => paramKey(prefix, name)
  params.set(key('colours'), style.colours.join(','))
  params.set(key('chaos'), String(round(style.chaos, 2)))
  params.set(key('grain'), String(round(style.grain, 2)))
  params.set(key('grainSize'), String(round(style.grainSize, 2)))
  params.set(key('seed'), String(style.seed))
  for (const name of gradientControlKeys) params.set(key(name), String(style[name]))
}

export function parseGradient(params: URLSearchParams): GradientState {
  return { ...parseGradientStyle(params), ...readFrame(params, defaultGradient) }
}

export function serialiseGradient(state: GradientState): URLSearchParams {
  const params = new URLSearchParams()
  writeGradientStyle(params, state)
  params.set('w', String(state.width))
  params.set('h', String(state.height))
  writePaper(params, state)
  return params
}

export function gradientStyleOf(state: GradientStyle): GradientStyle {
  const { colours, chaos, grain, grainSize, seed, flow, glowSize, balance, softness, offsetX, offsetY, variation } =
    state
  return { colours, chaos, grain, grainSize, seed, flow, glowSize, balance, softness, offsetX, offsetY, variation }
}

/** Colours not yet in the gradient, in brand order. */
export function availableColours(state: Pick<GradientStyle, 'colours'>): BrandColourId[] {
  return brandColours.map((c) => c.id).filter((id) => !state.colours.includes(id))
}

export function gradientFileName(state: GradientState, extension: string): string {
  return `convert-gradient-${state.colours.join('-')}-${state.seed}-${state.width}x${state.height}.${extension}`
}

/** Move the current composition a little, leaving palette, texture and seed intact. */
export function varyGradient<T extends GradientStyle>(state: T, variationSeed: number): T {
  if (state.variation === 0) return state
  const random = seededRandom(variationSeed)
  const nudge = (value: number, span: number, min: number, max: number) =>
    round(clamp(value + (random() * 2 - 1) * span * state.variation, min, max), 4) || 0
  return {
    ...state,
    offsetX: nudge(state.offsetX, 0.18, -1.2, 1.2),
    offsetY: nudge(state.offsetY, 0.18, -1.2, 1.2),
    glowSize: nudge(state.glowSize, 0.15, 0, 1),
  }
}

export interface GradientHistory {
  present: GradientState
  past: GradientState[]
  group?: string
}
export type GradientAction =
  | { type: 'update'; patch: Partial<GradientState>; group?: string }
  | { type: 'vary'; seed: number }
  | { type: 'arrange'; seed: number }
  | { type: 'undo' }
  | { type: 'end' }

/** One undo step per drag or keyboard edit, with a bounded history. */
export function gradientHistory(history: GradientHistory, action: GradientAction): GradientHistory {
  if (action.type === 'end') return { ...history, group: undefined }
  if (action.type === 'undo') {
    const present = history.past.at(-1)
    return present ? { present, past: history.past.slice(0, -1) } : history
  }
  const present =
    action.type === 'vary'
      ? varyGradient(history.present, action.seed)
      : action.type === 'arrange'
        ? { ...history.present, seed: action.seed, offsetX: 0, offsetY: 0 }
        : { ...history.present, ...action.patch }
  if (JSON.stringify(present) === JSON.stringify(history.present)) return history
  const group = action.type === 'update' ? action.group : undefined
  return {
    present,
    past: group && group === history.group ? history.past : [...history.past.slice(-49), history.present],
    group,
  }
}
