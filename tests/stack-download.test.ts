import { describe, expect, it } from 'vitest'
import { stacks } from '@/brand/stacks.generated'
import { stackDownloadSize, stackToSvg } from '@/lib/stack-download'

describe('stack downloads', () => {
  it('crops every stack to within a pixel of its artwork', () => {
    for (const stack of stacks) {
      const { x, y, width, height } = stack.bounds
      expect(x).toBeGreaterThanOrEqual(-1)
      expect(y).toBeGreaterThanOrEqual(-1)
      expect(x + width).toBeLessThanOrEqual(stack.width + 1)
      expect(y + height).toBeLessThanOrEqual(stack.height + 1)
      expect(stackToSvg(stack, { fill: '#c9deb6' })).toContain(`viewBox="${x} ${y} ${width} ${height}"`)
    }
  })

  it('keeps the artwork proportions at a requested width', () => {
    const stack = stacks[4]
    const size = stackDownloadSize(stack, 2000)
    expect(size.width).toBe(2000)
    expect(size.height / size.width).toBeCloseTo(stack.bounds.height / stack.bounds.width, 2)
  })

  it('adds a background rectangle only when asked', () => {
    expect(stackToSvg(stacks[0], { fill: '#c9deb6' })).not.toContain('<rect')
    expect(stackToSvg(stacks[0], { fill: '#c9deb6', background: '#27382f' })).toContain('fill="#27382f"')
  })
})
