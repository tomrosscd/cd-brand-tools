import type { StackArtwork } from '@/brand/stack-types'

export interface StackDownloadOptions {
  fill: string
  /** A solid background colour, or undefined for transparent. */
  background?: string
  /** Output width in pixels. Height follows the artwork's proportions. */
  width?: number
}

/** Pixel size of a tightly cropped stack at the requested width. */
export function stackDownloadSize(stack: StackArtwork, width = stack.bounds.width) {
  return { width: Math.round(width), height: Math.round((stack.bounds.height / stack.bounds.width) * width) }
}

/** A standalone SVG cropped exactly to the artwork, with source geometry untouched. */
export function stackToSvg(stack: StackArtwork, { fill, background, width }: StackDownloadOptions): string {
  const { x, y, width: w, height: h } = stack.bounds
  const size = stackDownloadSize(stack, width)
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="${x} ${y} ${w} ${h}">`,
    background ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${background}"/>` : '',
    `<g fill="${fill}">`,
    ...stack.paths.map((d) => `<path d="${d}"/>`),
    '</g></svg>',
  ].join('')
}

export function stackDownloadName(stack: StackArtwork, colourId: string, background: string | undefined, ext: string) {
  return `convert-${stack.id}-${colourId}${background ? `-on-${background}` : ''}.${ext}`
}
