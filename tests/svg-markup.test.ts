import { describe, expect, it } from 'vitest'
import { logoAssets } from '@/brand/assets.generated'
import { geometryToSvg } from '@/lib/svg-markup'

describe('clean SVG for copying', () => {
  const svgs = logoAssets.filter((a) => a.geometry)

  it('covers every official SVG', () => {
    expect(svgs).toHaveLength(logoAssets.filter((a) => a.format === 'svg').length)
  })

  it('drops Illustrator ids, classes and style blocks but keeps geometry and colour', () => {
    for (const asset of svgs) {
      const svg = geometryToSvg(asset.geometry!)
      expect(svg).not.toMatch(/\sid=|class=|<style|<\?xml/)
      expect(svg).toContain(`viewBox="${asset.geometry!.viewBox}"`)
      expect(svg).toContain(`fill="${asset.geometry!.fill}"`)
      expect(svg.match(/<(path|polygon|rect)\b/g)).toHaveLength(asset.geometry!.shapes.length)
    }
  })
})

describe('logo backgrounds', () => {
  const asset = logoAssets.find((a) => a.geometry && a.clearSpace)!

  it('adds a background covering the whole viewBox, behind the artwork, only when asked', () => {
    expect(geometryToSvg(asset.geometry!)).not.toContain('<rect x=')
    const svg = geometryToSvg(asset.geometry!, { background: '#27382f' })
    const [x, y, w, h] = asset.geometry!.viewBox.split(/\s+/)
    expect(svg).toContain(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#27382f"/>`)
    expect(svg.indexOf('fill="#27382f"')).toBeLessThan(svg.indexOf('<g fill'))
  })
})
