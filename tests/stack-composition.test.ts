import { describe, expect, it } from 'vitest'
import { stacks } from '@/brand/stacks.generated'
import { frameSizeError } from '@/lib/frame'
import {
  compositionToSvg,
  defaultComposition,
  overlayAsset,
  overlayBox,
  parseComposition,
  randomiseStack,
  serialiseComposition,
  stackBox,
} from '@/lib/stack-composition'

describe('stack composition', () => {
  it('round-trips through the URL', () => {
    const state = {
      ...defaultComposition,
      stackId: 'stack-17',
      stackColour: 'orange' as const,
      background: 'none' as const,
      x: 1.2,
      y: -0.3,
      scale: 1.6,
      width: 1584,
      height: 396,
      overlay: { kind: 'Icon' as const, colour: 'Black' as const, position: 'top-right' as const, size: 0.2 },
    }
    expect(parseComposition(serialiseComposition(state))).toEqual(state)
  })

  it('rejects colours outside the palette and unknown stacks', () => {
    const state = parseComposition(new URLSearchParams('colour=hotpink&stack=99'))
    expect(state.stackColour).toBe(defaultComposition.stackColour)
    expect(state.stackId).toBe(defaultComposition.stackId)
  })

  it('randomise changes only the stack', () => {
    const next = randomiseStack(defaultComposition, () => 0.5)
    expect(next.stackId).not.toBe(defaultComposition.stackId)
    expect({ ...next, stackId: defaultComposition.stackId }).toEqual(defaultComposition)
  })

  it('keeps the stack aspect ratio when scaling', () => {
    const stack = stacks[0]
    const box = stackBox({ ...defaultComposition, stackId: stack.id, scale: 2 })
    expect(box.width / box.height).toBeCloseTo(stack.width / stack.height, 6)
  })

  it('writes the stack paths exactly as supplied, in one colour, with no ids', () => {
    for (const stack of stacks) {
      const svg = compositionToSvg({ ...defaultComposition, stackId: stack.id })
      for (const d of stack.paths) expect(svg).toContain(`<path d="${d}"/>`)
      expect(svg).not.toMatch(/\sid=|class=/)
    }
  })

  it('omits the background rectangle when transparent', () => {
    const svg = compositionToSvg({
      ...defaultComposition,
      background: 'none',
      overlay: { ...defaultComposition.overlay, kind: 'none' },
    })
    expect(svg).not.toContain('<rect')
  })

  it('finds an official SVG for every overlay kind and colour', () => {
    for (const kind of ['Logo', 'Straight', 'Icon'] as const) {
      for (const colour of ['White', 'Light Green', 'Dark Green', 'Black'] as const) {
        expect(overlayAsset(kind, colour)?.geometry, `${kind} ${colour}`).toBeDefined()
      }
    }
  })

  it('keeps a bottom-right overlay inside the frame', () => {
    const state = {
      ...defaultComposition,
      overlay: { ...defaultComposition.overlay, position: 'bottom-right' as const },
    }
    const box = overlayBox(state, overlayAsset('Logo', 'White')!)
    expect(box.x + box.width).toBeLessThan(state.width)
    expect(box.y + box.height).toBeLessThan(state.height)
  })
})

describe('frame limits', () => {
  it('accepts presets and rejects oversized frames', () => {
    expect(frameSizeError({ width: 3840, height: 2160 })).toBeUndefined()
    expect(frameSizeError({ width: 8192, height: 8192 })).toMatch(/megapixels/)
    expect(frameSizeError({ width: 10, height: 100 })).toMatch(/at least/)
  })
})

describe('gradient backgrounds', () => {
  const gradientState = {
    ...defaultComposition,
    background: 'gradient' as const,
    gradient: { colours: ['orange', 'dark-green'] as const, chaos: 0.9, grain: 0.2, seed: 99 },
  }

  it('round-trips the gradient through the URL', () => {
    expect(parseComposition(serialiseComposition(gradientState))).toEqual(gradientState)
  })

  it('leaves gradient settings out of the URL for other backgrounds', () => {
    expect(serialiseComposition(defaultComposition).has('gColours')).toBe(false)
  })

  it('embeds the gradient image only when one is supplied', () => {
    expect(compositionToSvg(gradientState)).not.toContain('<image')
    const svg = compositionToSvg(gradientState, { gradientHref: 'data:image/png;base64,AAAA' })
    expect(svg).toContain('<image href="data:image/png;base64,AAAA" width="1920" height="1080"')
    expect(svg.indexOf('<image')).toBeLessThan(svg.indexOf('<path'))
  })
})
