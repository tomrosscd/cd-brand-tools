import type { SvgGeometry, SvgShape } from '@/brand/asset-types'

export function shapeMarkup(shape: SvgShape): string {
  if (shape.tag === 'path') return `<path d="${shape.d}"/>`
  if (shape.tag === 'polygon') return `<polygon points="${shape.points}"/>`
  return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}"/>`
}

/**
 * A clean standalone SVG of an official asset: the supplied geometry and colour, without the
 * Illustrator prolog, ids, classes or style blocks, so it pastes into Figma as tidy vector layers.
 */
export function geometryToSvg(geometry: SvgGeometry, options: { background?: string } = {}): string {
  const [minX, minY, width, height] = geometry.viewBox.split(/\s+/).map(Number)
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${geometry.viewBox}" fill="none">`,
    options.background
      ? `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${options.background}"/>`
      : '',
    `<g fill="${geometry.fill}">`,
    ...geometry.shapes.map(shapeMarkup),
    '</g></svg>',
  ].join('')
}
