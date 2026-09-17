export interface FramePreset {
  id: string
  label: string
  width: number
  height: number
}

export const framePresets: readonly FramePreset[] = [
  { id: 'slide', label: 'Widescreen slide', width: 1920, height: 1080 },
  { id: 'slide-4k', label: 'Widescreen slide, 4K', width: 3840, height: 2160 },
  { id: 'square', label: 'Square post', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Portrait post', width: 1080, height: 1350 },
  { id: 'linkedin-banner', label: 'LinkedIn banner', width: 1584, height: 396 },
  { id: 'linkedin-post', label: 'LinkedIn post', width: 1200, height: 627 },
  { id: 'desktop', label: 'Desktop wallpaper', width: 2560, height: 1440 },
  { id: 'phone', label: 'Phone wallpaper', width: 1179, height: 2556 },
]

export const frameLimits = {
  minSide: 16,
  maxSide: 8192,
  /** Safari's canvas area limit is the practical ceiling. */
  maxPixels: 40_000_000,
} as const

export interface FrameSize {
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
  return frameSizeError(size) ? { width: fallback.width, height: fallback.height } : size
}

/** Rounds to a fixed number of decimals for compact, stable URLs. */
export function round(value: number, decimals = 3): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
