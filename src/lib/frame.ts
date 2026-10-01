export interface FramePreset {
  id: string
  label: string
  group: 'Screen' | 'Social' | 'Paper'
  width: number
  height: number
  millimetres?: readonly [number, number]
}

export const framePresets: readonly FramePreset[] = [
  { id: 'slide', group: 'Screen', label: 'Widescreen slide', width: 1920, height: 1080 },
  { id: 'slide-4k', group: 'Screen', label: 'Widescreen slide, 4K', width: 3840, height: 2160 },
  { id: 'square', group: 'Social', label: 'Square post', width: 1080, height: 1080 },
  { id: 'portrait', group: 'Social', label: 'Portrait post', width: 1080, height: 1350 },
  { id: 'linkedin-banner', group: 'Social', label: 'LinkedIn banner', width: 1584, height: 396 },
  { id: 'linkedin-post', group: 'Social', label: 'LinkedIn post', width: 1200, height: 627 },
  { id: 'desktop', group: 'Screen', label: 'Desktop wallpaper', width: 2560, height: 1440 },
  { id: 'phone', group: 'Screen', label: 'Phone wallpaper', width: 1179, height: 2556 },
  { id: 'a5-portrait', millimetres: [148, 210], group: 'Paper', label: 'A5 portrait', width: 1748, height: 2480 },
  { id: 'a5-landscape', millimetres: [210, 148], group: 'Paper', label: 'A5 landscape', width: 2480, height: 1748 },
  { id: 'a4-portrait', millimetres: [210, 297], group: 'Paper', label: 'A4 portrait', width: 2480, height: 3508 },
  { id: 'a4-landscape', millimetres: [297, 210], group: 'Paper', label: 'A4 landscape', width: 3508, height: 2480 },
  { id: 'a3-portrait', millimetres: [297, 420], group: 'Paper', label: 'A3 portrait', width: 3508, height: 4961 },
  { id: 'a3-landscape', millimetres: [420, 297], group: 'Paper', label: 'A3 landscape', width: 4961, height: 3508 },
]

export const frameLimits = {
  minSide: 16,
  maxSide: 8192,
  /** Safari's canvas area limit is the practical ceiling. */
  maxPixels: 40_000_000,
} as const

export interface FrameSize {
  paperPreset?: string
  ppi?: number
  width: number
  height: number
}

export function presetFor(size: FrameSize): FramePreset | undefined {
  return framePresets.find((p) => p.width === size.width && p.height === size.height)
}

/** Returns an error message for a size that cannot be exported, or undefined when it can. */
export function frameSizeError(size: FrameSize): string | undefined {
  const { width, height } = size
  if (!Number.isInteger(width) || !Number.isInteger(height)) return 'Width and height must be whole numbers.'
  if (width < frameLimits.minSide || height < frameLimits.minSide)
    return `Width and height must be at least ${frameLimits.minSide}px.`
  if (width > frameLimits.maxSide || height > frameLimits.maxSide)
    return `Width and height must be ${frameLimits.maxSide}px or less.`
  if (width * height > frameLimits.maxPixels) return 'This size is over 40 megapixels. Choose a smaller size.'
  return undefined
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Reads a finite number from a query value, falling back when missing or invalid. */
export function readNumber(value: string | null | undefined, fallback: number, min: number, max: number): number {
  if (value === null || value === undefined || value.trim() === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback
}

export function readFrame(params: URLSearchParams, fallback: FrameSize): FrameSize {
  const size = {
    width: Math.round(readNumber(params.get('w'), fallback.width, frameLimits.minSide, frameLimits.maxSide)),
    height: Math.round(readNumber(params.get('h'), fallback.height, frameLimits.minSide, frameLimits.maxSide)),
  }
  if (frameSizeError(size)) return { width: fallback.width, height: fallback.height }
  const preset = framePresets.find((p) => p.id === params.get('paper') && p.millimetres)
  const ppi = Number(params.get('ppi'))
  if (preset && Number.isInteger(ppi) && ppi >= 72 && ppi <= 600) {
    const expected = paperFrame(preset, ppi)
    if (expected.width === size.width && expected.height === size.height) return expected
  }
  return size
}

/** Rounds to a fixed number of decimals for compact, stable URLs. */
export function round(value: number, decimals = 3): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/** Pixel dimensions for a paper preset at the requested print resolution. */
export function paperFrame(preset: FramePreset, ppi: number): FrameSize {
  if (!preset.millimetres) return { width: preset.width, height: preset.height, paperPreset: undefined, ppi: undefined }
  return {
    paperPreset: preset.id,
    ppi,
    width: Math.round((preset.millimetres[0] / 25.4) * ppi),
    height: Math.round((preset.millimetres[1] / 25.4) * ppi),
  }
}

/** Recover paper selection from shared pixel dimensions, including custom integer PPI. */
export function paperFor(size: FrameSize): { preset: FramePreset; ppi: number } | undefined {
  if (size.paperPreset && size.ppi) {
    const preset = framePresets.find((p) => p.id === size.paperPreset && p.millimetres)
    if (preset) return { preset, ppi: size.ppi }
  }
  // Only recognise fixed 300 PPI presets in old links; paper sizes share aspect ratios.
  const original = presetFor(size)
  return original?.millimetres ? { preset: original, ppi: 300 } : undefined
}

export function writePaper(params: URLSearchParams, size: FrameSize) {
  if (size.paperPreset && size.ppi) {
    params.set('paper', size.paperPreset)
    params.set('ppi', String(size.ppi))
  }
}
