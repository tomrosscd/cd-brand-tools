'use client'

/**
 * Copies SVG markup as plain text. Figma, Illustrator and most design tools convert pasted SVG code
 * into editable vectors. Accepts a promise so Safari keeps the click's permission while content loads.
 */
export async function copySvg(svg: string | Promise<string>): Promise<void> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    const blob = Promise.resolve(svg).then((text) => new Blob([text], { type: 'text/plain' }))
    await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })])
    return
  }
  await navigator.clipboard.writeText(await svg)
}

/** Copies a raster image. Clipboards only accept PNG, so other formats are converted first. */
export async function copyPng(png: Promise<Blob>): Promise<void> {
  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    throw new Error('This browser cannot copy images. Download the file instead.')
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
}

/** Loads an image file and re-encodes it as PNG for the clipboard. */
export async function imageUrlToPng(url: string): Promise<Blob> {
  const image = new Image()
  image.src = url
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  canvas.getContext('2d')!.drawImage(image, 0, 0)
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare the image'))), 'image/png'),
  )
}
