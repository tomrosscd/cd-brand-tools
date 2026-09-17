export type RasterFormat = 'png' | 'jpg'

const mimeTypes: Record<RasterFormat | 'svg', string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml',
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: RasterFormat, quality = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('The browser could not encode this image. Try a smaller size.')),
      mimeTypes[format],
      quality,
    )
  })
}

export function svgBlob(svg: string): Blob {
  return new Blob([svg], { type: mimeTypes.svg })
}

/** Rasterises an SVG document at its own width and height. */
export async function svgToCanvas(svg: string, width: number, height: number): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(svgBlob(svg))
  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not create a canvas for export')
    context.drawImage(image, 0, 0, width, height)
    return canvas
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
