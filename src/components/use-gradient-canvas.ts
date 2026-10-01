'use client'

import { canvasToBlob, type RasterFormat } from '@/lib/export'
import type { FrameSize } from '@/lib/frame'
import type { GradientStyle } from '@/lib/gradient'
import { GradientRenderer } from '@/lib/gradient-renderer'
import { useCallback, useEffect, useState } from 'react'

const PREVIEW_LONG_SIDE = 1200

/**
 * Owns a WebGL gradient renderer bound to a canvas and keeps its preview current.
 * Pass `style` as undefined to pause rendering, for example while the gradient is not in use.
 */
export function useGradientCanvas(style: GradientStyle | undefined, frame: FrameSize, estimateFormat?: RasterFormat) {
  const [renderer, setRenderer] = useState<GradientRenderer | null>(null)
  const [estimatedBytes, setEstimatedBytes] = useState<number>()
  const [error, setError] = useState<string>()

  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    try {
      const created = new GradientRenderer(canvas)
      setRenderer(created)
      return () => created.dispose()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The gradient preview could not start.')
    }
  }, [])

  const renderPreview = useCallback(() => {
    if (!renderer || !style) return
    const ratio = Math.min(1, PREVIEW_LONG_SIDE / Math.max(frame.width, frame.height))
    renderer.renderPreview(style, Math.round(frame.width * ratio), Math.round(frame.height * ratio), {
      width: frame.width,
      height: frame.height,
    })
  }, [renderer, style, frame.width, frame.height])

  useEffect(() => {
    const id = requestAnimationFrame(renderPreview)
    return () => cancelAnimationFrame(id)
  }, [renderPreview])

  useEffect(() => {
    if (!renderer || !style || !estimateFormat) return
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        renderPreview()
        const snapshot = document.createElement('canvas')
        snapshot.width = renderer.canvas.width
        snapshot.height = renderer.canvas.height
        const context = snapshot.getContext('2d')
        if (!context) return
        context.drawImage(renderer.canvas, 0, 0)
        const blob = await canvasToBlob(snapshot, estimateFormat)
        if (!cancelled) setEstimatedBytes((blob.size * frame.width * frame.height) / (snapshot.width * snapshot.height))
      } catch {
        if (!cancelled) setEstimatedBytes(undefined)
      }
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [renderer, style, estimateFormat, frame.width, frame.height, renderPreview])

  /** Renders the full frame for export, then restores the preview. */
  const renderFull = useCallback(async () => {
    if (!renderer || !style) throw new Error(error ?? 'The gradient renderer is not ready.')
    await new Promise((resolve) => requestAnimationFrame(resolve))
    try {
      return renderer.renderFull({ ...style, ...frame })
    } finally {
      renderPreview()
    }
  }, [renderer, style, frame, error, renderPreview])

  return { canvasRef, error, renderFull, estimatedBytes }
}
