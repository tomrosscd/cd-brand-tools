import { describe, expect, it } from 'vitest'
import { hexToOklab, oklabToRgb, hexToRgb } from '@/lib/colour-space'
import {
  defaultGradient,
  gradientPoints,
  parseGradient,
  serialiseGradient,
  varyGradient,
  gradientHistory,
  parseGradientStyle,
  writeGradientStyle,
} from '@/lib/gradient'

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

describe('gradient controls and variations', () => {
  it('preserves legacy links without adding flow or changing field shape', () => {
    const state = parseGradient(new URLSearchParams('chaos=0.71&grain=0.28&seed=20260917'))
    expect(state).toMatchObject({
      chaos: 0.71,
      flow: 0,
      glowSize: 0.5,
      balance: 0.5,
      softness: 0.5,
      offsetX: 0,
      offsetY: 0,
    })
  })
  it('round-trips every new control including precise drag positions and stack prefixes', () => {
    const state = {
      ...defaultGradient,
      flow: 0.72,
      glowSize: 0.83,
      balance: 0.24,
      softness: 0.91,
      offsetX: -0.1234,
      offsetY: 0.4321,
      variation: 0.8,
    }
    expect(parseGradient(serialiseGradient(state))).toEqual(state)
    const params = new URLSearchParams()
    writeGradientStyle(params, state, 'g')
    expect(parseGradientStyle(params, 'g')).toMatchObject({ flow: 0.72, offsetX: -0.1234, variation: 0.8 })
  })
  it('bounds invalid controls and rejects non-finite inputs', () => {
    expect(
      parseGradient(
        new URLSearchParams('flow=Infinity&glowSize=-1&balance=9&softness=NaN&offsetX=-9&offsetY=9&variation=2'),
      ),
    ).toMatchObject({ flow: 0.15, glowSize: 0, balance: 1, softness: 0.5, offsetX: -1.2, offsetY: 1.2, variation: 1 })
  })
  it('makes bounded, reproducible variations without reshuffling or changing texture', () => {
    for (let seed = 0; seed < 100; seed++) {
      const next = varyGradient(defaultGradient, seed)
      expect(next).toEqual(varyGradient(defaultGradient, seed))
      expect(next).toMatchObject({
        seed: defaultGradient.seed,
        colours: defaultGradient.colours,
        grain: defaultGradient.grain,
        chaos: 0,
        flow: 0.15,
        softness: 0.5,
        balance: 0.5,
      })
      expect(Math.abs(next.offsetX)).toBeLessThanOrEqual(0.0361)
      expect(Math.abs(next.offsetY)).toBeLessThanOrEqual(0.0361)
      expect(Math.abs(next.glowSize - 0.5)).toBeLessThanOrEqual(0.0301)
      expect(parseGradient(serialiseGradient(next))).toEqual(next)
    }
    const zero = { ...defaultGradient, variation: 0 }
    expect(varyGradient(zero, 5)).toBe(zero)
  })
  it('undoes a whole slider gesture and each separate variation', () => {
    const initial = { present: defaultGradient, past: [] }
    let history = gradientHistory(initial, { type: 'update', patch: { flow: 0.3 }, group: 'flow' })
    history = gradientHistory(history, { type: 'update', patch: { flow: 0.6 }, group: 'flow' })
    expect(history.past).toHaveLength(1)
    history = gradientHistory(history, { type: 'end' })
    const before = history.present
    history = gradientHistory(history, { type: 'vary', seed: 5 })
    history = gradientHistory(history, { type: 'undo' })
    expect(history.present).toEqual(before)
    expect(gradientHistory(history, { type: 'undo' }).present).toEqual(defaultGradient)
  })
  it('new arrangements keep styling, reset position and can be undone', () => {
    const present = { ...defaultGradient, offsetX: 0.2, glowSize: 0.7 }
    const history = gradientHistory({ present, past: [] }, { type: 'arrange', seed: 99 })
    expect(history.present).toMatchObject({ seed: 99, offsetX: 0, offsetY: 0, glowSize: 0.7 })
    expect(gradientHistory(history, { type: 'undo' }).present).toEqual(present)
  })
})
