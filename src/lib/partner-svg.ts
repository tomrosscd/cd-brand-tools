// Recolour, crop and back partner SVGs in the browser. Pure DOM, no rendering, except `trimSvg`.

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Elements whose contents define masks, clips and paints rather than visible artwork. */
const NON_ARTWORK = new Set([
  'defs',
  'mask',
  'clipPath',
  'pattern',
  'linearGradient',
  'radialGradient',
  'filter',
  'symbol',
  'marker',
])
const SHAPES = new Set(['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line', 'text', 'tspan', 'use'])

function parse(svg: string): SVGSVGElement {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const root = doc.documentElement
  if (root.nodeName !== 'svg' || doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('The file is not a valid SVG')
  }
  return root as unknown as SVGSVGElement
}

const serialise = (root: Element) => new XMLSerializer().serializeToString(root)

function insideNonArtwork(element: Element): boolean {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (NON_ARTWORK.has(node.localName)) return true
  }
  return false
}

/** Reads a paint from the attribute or inline style. */
function paint(element: Element, property: 'fill' | 'stroke'): string | null {
  const inline = element.getAttribute('style')?.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`))?.[1]
  return (inline ?? element.getAttribute(property))?.trim() ?? null
}

function setPaint(element: Element, property: 'fill' | 'stroke', colour: string) {
  element.setAttribute(property, colour)
  const style = element.getAttribute('style')
  if (style) element.setAttribute('style', style.replace(new RegExp(`(?:^|;)\\s*${property}\\s*:[^;]+;?`, 'g'), ';'))
}

/** The fill a shape would inherit if it sets none itself. SVG's default fill is black. */
function inheritedFill(element: Element): string {
  for (let node = element.parentElement; node && node.localName !== '#document'; node = node.parentElement) {
    const value = paint(node, 'fill')
    if (value && value !== 'inherit') return value
  }
  return 'black'
}

/**
 * Makes every visible paint one colour, leaving masks, clip paths and gradient definitions alone so
 * the logo keeps its shape. Pass `null` to return the original colours unchanged.
 */
export function recolourSvg(svg: string, colour: string | null): string {
  if (!colour) return svg
  const root = parse(svg)
  for (const element of Array.from(root.querySelectorAll('*'))) {
    if (NON_ARTWORK.has(element.localName) || insideNonArtwork(element)) continue
    for (const property of ['fill', 'stroke'] as const) {
      const value = paint(element, property)
      if (value && value !== 'none' && value !== 'inherit' && value !== 'currentColor')
        setPaint(element, property, colour)
      else if (value === 'currentColor') setPaint(element, property, colour)
    }
    if (SHAPES.has(element.localName) && !paint(element, 'fill') && inheritedFill(element) !== 'none') {
      element.setAttribute('fill', colour)
    }
  }
  return serialise(root)
}

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** Sets the viewBox and pixel size to a box, for example the artwork's measured bounds. */
export function cropSvg(svg: string, box: Box): string {
  const root = parse(svg)
  const round = (value: number) => Math.round(value * 1000) / 1000
  root.setAttribute('viewBox', [box.x, box.y, box.width, box.height].map(round).join(' '))
  root.setAttribute('width', String(round(box.width)))
  root.setAttribute('height', String(round(box.height)))
  return serialise(root)
}

/** Puts a solid rectangle behind everything, covering the whole viewBox. */
export function addBackground(svg: string, colour: string): string {
  const root = parse(svg)
  const [x, y, width, height] = (root.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number)
  const rect = root.ownerDocument.createElementNS(SVG_NS, 'rect')
  for (const [name, value] of Object.entries({ x, y, width, height })) rect.setAttribute(name, String(value))
  rect.setAttribute('fill', colour)
  root.insertBefore(rect, root.firstChild)
  return serialise(root)
}

/** Measures the drawn artwork in the browser and crops the SVG tightly to it. */
export function trimSvg(svg: string): string {
  const host = document.createElement('div')
  host.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden'
  host.innerHTML = svg
  document.body.append(host)
  try {
    const element = host.querySelector('svg')
    if (!element) return svg
    const box = element.getBBox()
    return box.width > 0 && box.height > 0 ? cropSvg(svg, box) : svg
  } finally {
    host.remove()
  }
}
