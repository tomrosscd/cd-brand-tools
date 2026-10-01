import { describe, expect, it } from 'vitest'
import { grainGrid } from '@/lib/grain'
import { framePresets, frameSizeError, presetFor, paperFrame, paperFor } from '@/lib/frame'
import {
  defaultGradient,
  parseGradient,
  parseGradientStyle,
  serialiseGradient,
  writeGradientStyle,
  gradientStyleOf,
  varyGradient,
} from '@/lib/gradient'

describe('artwork-relative grain', () => {
  it('keeps the same texture grid when the same artwork is exported at a different resolution', () => {
    expect(grainGrid({ width: 2480, height: 3508 }, 4)).toEqual(grainGrid({ width: 4960, height: 7016 }, 4))
    expect(grainGrid({ width: 1920, height: 1080 }, 4)).toEqual(grainGrid({ width: 960, height: 540 }, 4))
  })
  it('doubles grain spacing when size doubles, without altering aspect ratio', () => {
    const fine = grainGrid({ width: 2480, height: 3508 }, 2)
    const coarse = grainGrid({ width: 2480, height: 3508 }, 4)
    expect(coarse[0]).toBe(fine[0] / 2)
    expect(coarse[1]).toBe(fine[1] / 2)
  })
  it('preserves the legacy pixel-grain mode for old shared links', () => {
    expect(parseGradient(new URLSearchParams('grain=0.3&seed=99')).grainSize).toBe(0)
    expect(grainGrid(defaultGradient, 0)).toEqual([0, 0])
    expect(parseGradient(new URLSearchParams()).grainSize).toBe(defaultGradient.grainSize)
  })
  it('round-trips grain size in gradient and stack-background links', () => {
    const state = { ...defaultGradient, grainSize: 6.5 }
    expect(parseGradient(serialiseGradient(state))).toEqual(state)
    const params = new URLSearchParams()
    writeGradientStyle(params, state, 'g')
    expect(params.get('gGrainSize')).toBe('6.5')
    expect(parseGradientStyle(params, 'g').grainSize).toBe(6.5)
    expect(gradientStyleOf(state).grainSize).toBe(6.5)
    expect(varyGradient(state, 123).grainSize).toBe(6.5)
  })
  it('clamps invalid grain sizes', () => {
    expect(parseGradient(new URLSearchParams('grainSize=99')).grainSize).toBe(12)
    expect(parseGradient(new URLSearchParams('grainSize=-9')).grainSize).toBe(0)
    expect(parseGradient(new URLSearchParams('grainSize=nope')).grainSize).toBe(defaultGradient.grainSize)
  })
})

describe('paper presets', () => {
  it('provides A3, A4 and A5 in both orientations at rounded 300 ppi dimensions', () => {
    for (const [name, mmWidth, mmHeight] of [
      ['a3', 297, 420],
      ['a4', 210, 297],
      ['a5', 148, 210],
    ] as const) {
      const portrait = framePresets.find((p) => p.id === `${name}-portrait`)!
      const landscape = framePresets.find((p) => p.id === `${name}-landscape`)!
      expect(portrait.width).toBe(Math.round((mmWidth / 25.4) * 300))
      expect(portrait.height).toBe(Math.round((mmHeight / 25.4) * 300))
      expect(landscape.width).toBe(portrait.height)
      expect(landscape.height).toBe(portrait.width)
      expect(portrait.group).toBe('Paper')
    }
  })
  it('keeps every preset selectable, unique and within export limits', () => {
    expect(new Set(framePresets.map((p) => p.id)).size).toBe(framePresets.length)
    for (const preset of framePresets) {
      expect(frameSizeError(preset)).toBeUndefined()
      expect(presetFor(preset)?.id).toBe(preset.id)
    }
  })
})

it('preserves paper identity and PPI in shared links even when paper aspect ratios match', () => {
  for (const preset of framePresets.filter((p) => p.millimetres)) {
    for (const ppi of [150, 212, 300]) {
      const size = paperFrame(preset, ppi)
      expect(paperFor(size)).toEqual({ preset, ppi })
      const parsed = parseGradient(serialiseGradient({ ...defaultGradient, ...size }))
      expect(parsed.paperPreset).toBe(preset.id)
      expect(parsed.ppi).toBe(ppi)
      expect(parsed.width).toBe(size.width)
    }
  }
})
it('reduces paper pixel count by approximately four at 150 versus 300 PPI', () => {
  const a3 = framePresets.find((p) => p.id === 'a3-portrait')!
  const low = paperFrame(a3, 150)
  const high = paperFrame(a3, 300)
  expect((high.width * high.height) / (low.width * low.height)).toBeCloseTo(4, 2)
  expect(frameSizeError(paperFrame(a3, 600))).toBeDefined()
})
