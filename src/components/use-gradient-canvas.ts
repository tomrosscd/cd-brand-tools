'use client'

import type { FrameSize } from '@/lib/frame'
import type { GradientStyle } from '@/lib/gradient'
import { GradientRenderer } from '@/lib/gradient-renderer'
import { useCallback, useEffect, useState } from 'react'

const PREVIEW_LONG_SIDE = 1200

/**
 * Owns a WebGL gradient renderer bound to a canvas and keeps its preview current.
 * Pass `style` as undefined to pause rendering, for example while the gradient is not in use.
 */
export function useGradientCanvas(style: GradientStyle | undefined, frame: FrameSize) {
  const [renderer, setRenderer] = useState<GradientRenderer | null>(null)
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
    renderer.renderPreview(style, Math.round(frame.width * ratio), Math.round(frame.height * ratio))
  }, [renderer, style, frame.width, frame.height])

  useEffect(() => {
    const id = requestAnimationFrame(renderPreview)
    return () => cancelAnimationFrame(id)
  }, [renderPreview])

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

  return { canvasRef, error, renderFull }
}
