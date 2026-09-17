// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { partners } from '@/brand/partners.generated'
import { addBackground, cropSvg, recolourSvg } from '@/lib/partner-svg'

const source = (file: string) => readFileSync(`assets/source/CD_Partner_Logos/${file}`, 'utf8')
const vectorFiles = partners.flatMap((p) => p.files.filter((f) => f.vector))

function visiblePaints(svg: string): Set<string> {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const paints = new Set<string>()
  for (const element of Array.from(doc.querySelectorAll('*'))) {
    if (element.closest('defs, mask, clipPath, linearGradient, radialGradient, pattern')) continue
    for (const property of ['fill', 'stroke']) {
      const value = element.getAttribute(property)
      if (value && value !== 'none') paints.add(value.toLowerCase())
    }
  }
  return paints
}

describe('partner manifest', () => {
  it('treats SVGs that wrap a PNG as not vector', () => {
    const wrapped = partners.flatMap((p) => p.files).filter((f) => f.file.includes('embedded-raster'))
    expect(wrapped.length).toBe(3)
    expect(wrapped.every((f) => !f.vector)).toBe(true)
  })

  it('gives every partner either a vector file or a place on the to-do list', () => {
    for (const partner of partners) {
      expect(partner.vector === null || partner.files.some((f) => f.file === partner.vector && f.vector)).toBe(true)
    }
  })
})

describe('recolouring partner SVGs', () => {
  it('turns every visible paint into the one chosen colour', () => {
    for (const file of vectorFiles) {
      expect([...visiblePaints(recolourSvg(source(file.file), '#faf9f7'))], file.file).toEqual(['#faf9f7'])
    }
  })

  it('leaves masks and clip paths untouched so logos keep their shape', () => {
    const svg = recolourSvg(source('triple-whale.svg'), '#171717')
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const maskFills = Array.from(doc.querySelectorAll('mask *')).map((el) => el.getAttribute('fill'))
    expect(maskFills.length).toBeGreaterThan(0)
    expect(maskFills.every((fill) => fill === 'white')).toBe(true)
  })

  it('keeps the original when no colour is chosen', () => {
    expect(recolourSvg(source('pattern.svg'), null)).toBe(source('pattern.svg'))
  })
})

describe('cropping and backgrounds', () => {
  it('crops to a box and puts the background first, covering it', () => {
    const cropped = cropSvg(source('humii.svg'), { x: 10.5, y: 20, width: 100, height: 40 })
    expect(cropped).toMatch(/viewBox="10.5 20 100 40"/)
    expect(cropped).toMatch(/width="100"/)
    const backed = addBackground(cropped, '#27382f')
    const root = new DOMParser().parseFromString(backed, 'image/svg+xml').documentElement
    const first = root.firstElementChild!
    expect(first.localName).toBe('rect')
    expect([first.getAttribute('x'), first.getAttribute('width'), first.getAttribute('fill')]).toEqual([
      '10.5',
      '100',
      '#27382f',
    ])
  })
})
