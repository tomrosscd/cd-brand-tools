import { describe, expect, it } from 'vitest'
import { hexToOklab, oklabToRgb, hexToRgb } from '@/lib/colour-space'
import { defaultGradient, gradientPoints, parseGradient, serialiseGradient } from '@/lib/gradient'

describe('gradient state', () => {
  it('round-trips through the URL', () => {
    const state = {
      ...defaultGradient,
      colours: ['black', 'orange', 'white'] as const,
      chaos: 0.8,
      grain: 0.3,
      seed: 42,
      width: 1080,
      height: 1350,
    }
    expect(parseGradient(serialiseGradient(state))).toEqual(state)
  })

  it('ignores colours outside the brand palette', () => {
    const state = parseGradient(new URLSearchParams('colours=dark-green,hotpink,orange'))
    expect(state.colours).toEqual(['dark-green', 'orange'])
  })

  it('falls back to defaults when fewer than two valid colours remain', () => {
    expect(parseGradient(new URLSearchParams('colours=hotpink,orange')).colours).toEqual(defaultGradient.colours)
  })

  it('clamps chaos and grain, and rejects an oversized frame', () => {
    const state = parseGradient(new URLSearchParams('chaos=4&grain=-1&w=9000&h=9000'))
    expect(state.chaos).toBe(1)
    expect(state.grain).toBe(0)
    expect(state.width).toBe(defaultGradient.width)
  })

  it('places the same points for the same seed, and different points for another', () => {
    expect(gradientPoints(7, 4)).toEqual(gradientPoints(7, 4))
    expect(gradientPoints(7, 4)).not.toEqual(gradientPoints(8, 4))
  })

  it('keeps points near the frame', () => {
    for (const p of gradientPoints(123, 5)) {
      expect(p.x).toBeGreaterThanOrEqual(-0.1)
      expect(p.x).toBeLessThanOrEqual(1.1)
    }
  })
})

describe('colour space', () => {
  it('converts brand colours to OKLab and back without drift', () => {
    for (const hex of ['#27382f', '#c9deb6', '#499e6b', '#ffa366']) {
      expect(oklabToRgb(hexToOklab(hex))).toEqual(hexToRgb(hex))
    }
  })
})
