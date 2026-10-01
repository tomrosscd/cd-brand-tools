'use client'

import { Alert, Button, Icon, PageHeader, SegmentedControl, Stack } from '@convert/product-ui'
import { getBrandColour } from '@/brand/colours'
import { FrameSizeField } from '@/components/frame-size-field'
import { GradientColourEditor } from '@/components/gradient-colour-editor'
import { RangeField } from '@/components/range-field'
import { useToast } from '@/components/toast-provider'
import styles from '@/components/tool-layout.module.css'
import { useGradientCanvas } from '@/components/use-gradient-canvas'
import { canvasToBlob, downloadBlob, formatBytes, type RasterFormat } from '@/lib/export'
import {
  gradientFileName,
  gradientStyleOf,
  serialiseGradient,
  gradientHistory,
  gradientPoints,
  type GradientState,
} from '@/lib/gradient'
import { newSeed } from '@/lib/random'
import { useUrlState } from '@/lib/use-url-state'
import { useEffect, useMemo, useReducer, useState, type PointerEvent } from 'react'
import { clamp, round } from '@/lib/frame'

export function GradientGenerator({ initialState }: { initialState: GradientState }) {
  const [history, dispatch] = useReducer(gradientHistory, { present: initialState, past: [] })
  const state = history.present
  const [showPosition, setShowPosition] = useState(false)
  const anchor = gradientPoints(state.seed, state.colours.length)[1]
  const moveGlow = (event: PointerEvent<HTMLDivElement>) => {
    if (!showPosition) return
    const rect = event.currentTarget.getBoundingClientRect()
    dispatch({
      type: 'update',
      group: 'position',
      patch: {
        offsetX: round(clamp((event.clientX - rect.left) / rect.width, 0, 1) - anchor.x, 4),
        offsetY: round(clamp((event.clientY - rect.top) / rect.height, 0, 1) - anchor.y, 4),
      },
    })
  }
  const [format, setFormat] = useState<RasterFormat>('png')
  const [exporting, setExporting] = useState(false)
  const notify = useToast()
  const style = useMemo(() => gradientStyleOf(state), [state])
  const frame = useMemo(() => ({ width: state.width, height: state.height }), [state.width, state.height])
  const { canvasRef, error, renderFull, estimatedBytes } = useGradientCanvas(style, frame, format)

  useUrlState(serialiseGradient(state))

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (
        event.code !== 'Space' ||
        target.closest('input, select, textarea, button, a, summary, [contenteditable], [role="radio"]')
      )
        return
      event.preventDefault()
      if (!event.repeat) dispatch({ type: 'vary', seed: newSeed() })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const update = (patch: Partial<GradientState>, group?: string) => dispatch({ type: 'update', patch, group })
  const control = (
    name: 'glowSize' | 'balance' | 'softness' | 'flow' | 'variation' | 'chaos' | 'grain',
    label: string,
    hint: string,
  ) => (
    <RangeField
      label={label}
      value={state[name]}
      min={0}
      max={1}
      step={0.01}
      displayScale={100}
      unit="%"
      hint={hint}
      onValueChange={(value) => update({ [name]: value }, name)}
    />
  )

  const exportImage = async () => {
    setExporting(true)
    try {
      const canvas = await renderFull()
      const blob = await canvasToBlob(canvas, format)
      downloadBlob(blob, gradientFileName(state, format))
      notify('Gradient exported', `${state.width} × ${state.height} ${format.toUpperCase()}, ${formatBytes(blob.size)}`)
    } catch (caught) {
      notify('Export failed', caught instanceof Error ? caught.message : 'Try a smaller size.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Stack gap={32}>
      <div
        onPointerUp={() => dispatch({ type: 'end' })}
        onPointerCancel={() => dispatch({ type: 'end' })}
        onBlur={() => dispatch({ type: 'end' })}
      >
        <PageHeader
          heading="Gradient generator"
          description="Soft mesh gradients with grain, made only from Convert colours. Press the space bar for a subtle variation."
          actions={
            <div className={styles.row}>
              <Button onClick={() => dispatch({ type: 'vary', seed: newSeed() })} disabled={state.variation === 0}>
                Make a variation
              </Button>
              <Button variant="secondary" onClick={() => dispatch({ type: 'arrange', seed: newSeed() })}>
                New arrangement
              </Button>
              <Button variant="quiet" disabled={history.past.length === 0} onClick={() => dispatch({ type: 'undo' })}>
                Undo
              </Button>
            </div>
          }
        />
        <div className={styles.layout} style={{ marginTop: 32 }}>
          <div className={styles.stage}>
            <div className={styles.canvasArea}>
              <div
                className={styles.frame}
                style={{
                  aspectRatio: `${state.width} / ${state.height}`,
                  cursor: showPosition ? 'crosshair' : undefined,
                }}
                onPointerDown={(event) => {
                  if (!showPosition || event.button !== 0) return
                  event.preventDefault()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  moveGlow(event)
                }}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) moveGlow(event)
                }}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId))
                    event.currentTarget.releasePointerCapture(event.pointerId)
                }}
              >
                {showPosition ? (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: `${clamp(anchor.x + state.offsetX, 0, 1) * 100}%`,
                      top: `${clamp(anchor.y + state.offsetY, 0, 1) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '2px solid var(--cui-surface-card)',
                      boxShadow: '0 0 0 2px var(--cui-text-primary)',
                      pointerEvents: 'none',
                    }}
                  />
                ) : null}
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label={`Gradient of ${state.colours.map((id) => getBrandColour(id).name).join(', ')}`}
                />
              </div>
            </div>
            <p className={styles.caption}>
              Preview scaled from {state.width} × {state.height}. Seed {state.seed}.{' '}
              {state.grainSize === 0
                ? 'Original per-pixel grain looks finer when the export is scaled down.'
                : 'Grain size is relative to the artwork; very fine texture can soften when scaled down.'}
            </p>
            {error ? (
              <Alert heading="The gradient preview is unavailable" tone="error">
                {error} Use a current version of Chrome, Edge, Firefox or Safari.
              </Alert>
            ) : null}
          </div>

          <div className={styles.panel}>
            <section className={styles.section} aria-labelledby="gradient-colours">
              <h2 id="gradient-colours" className={styles.heading}>
                Colours
              </h2>
              <GradientColourEditor colours={state.colours} onChange={(colours) => update({ colours })} />
            </section>

            <section className={styles.section} aria-labelledby="gradient-composition">
              <h2 id="gradient-composition" className={styles.heading}>
                Composition
              </h2>
              {control('glowSize', 'Glow size', 'A small highlight or a broad wash of accent colour.')}
              {control('balance', 'Colour balance', 'Higher values give the first colour more space.')}
              {control('softness', 'Softness', 'Higher values blend the colours more gradually.')}
              {control('flow', 'Flow', 'Gentle curves across the colour fields.')}
              <details className={styles.section}>
                <summary>Glow position</summary>
                <div className={styles.section} style={{ marginTop: 16 }}>
                  <Button
                    variant="secondary"
                    aria-pressed={showPosition}
                    onClick={() => setShowPosition(!showPosition)}
                  >
                    {showPosition ? 'Finish positioning' : 'Position on canvas'}
                  </Button>
                  <p className={styles.caption}>
                    Move the accent colours together. Drag on the canvas or use the sliders below.
                  </p>
                  <RangeField
                    label="Horizontal position"
                    value={state.offsetX}
                    min={-1.2}
                    max={1.2}
                    step={0.01}
                    displayScale={100}
                    unit="%"
                    hint="Shift left or right from the original arrangement."
                    onValueChange={(offsetX) => update({ offsetX }, 'offsetX')}
                  />
                  <RangeField
                    label="Vertical position"
                    value={state.offsetY}
                    min={-1.2}
                    max={1.2}
                    step={0.01}
                    displayScale={100}
                    unit="%"
                    hint="Shift up or down from the original arrangement."
                    onValueChange={(offsetY) => update({ offsetY }, 'offsetY')}
                  />
                  <Button variant="quiet" onClick={() => update({ offsetX: 0, offsetY: 0 })}>
                    Reset position
                  </Button>
                </div>
              </details>
            </section>
            <section className={styles.section} aria-labelledby="gradient-variation">
              <h2 id="gradient-variation" className={styles.heading}>
                Variation
              </h2>
              {control(
                'variation',
                'Variation amount',
                'Small changes to glow position and size. Colours and grain stay the same.',
              )}
            </section>
            <section className={styles.section} aria-labelledby="gradient-texture">
              <h2 id="gradient-texture" className={styles.heading}>
                Texture
              </h2>
              {control('grain', 'Grain amount', 'How strongly the texture appears.')}
              <RangeField
                label="Grain size"
                value={state.grainSize}
                min={0}
                max={12}
                step={0.5}
                hint={
                  state.grainSize === 0
                    ? 'Original per-pixel grain. Choose a size above 0 for consistent preview and export scale.'
                    : 'Fine to coarse. Size stays relative to the artwork when exporting.'
                }
                onValueChange={(grainSize) => update({ grainSize }, 'grainSize')}
              />
              <details className={styles.section}>
                <summary>Advanced distortion</summary>
                <div style={{ marginTop: 16 }}>
                  {control('chaos', 'Chaos', 'Stronger folds and swirls. Keep low for a soft gradient.')}
                </div>
              </details>
            </section>

            <section className={styles.section} aria-labelledby="gradient-export">
              <h2 id="gradient-export" className={styles.heading}>
                Export
              </h2>
              <FrameSizeField value={state} onValueChange={(size) => update(size)} />
              <SegmentedControl
                label="Format"
                value={format}
                options={[
                  { value: 'png', label: 'PNG' },
                  { value: 'jpg', label: 'JPEG' },
                ]}
                onValueChange={(value) => setFormat(value as RasterFormat)}
              />
              <p className={styles.hint}>
                Estimated {format.toUpperCase()} size:{' '}
                {estimatedBytes === undefined ? 'calculating…' : `about ${formatBytes(estimatedBytes)}`}. Based on the
                preview; grain and compression can change the final size. JPEG usually makes a smaller file.
              </p>
              <div className={styles.row}>
                <Button
                  leadingIcon={<Icon name="download" />}
                  loading={exporting}
                  disabled={Boolean(error)}
                  onClick={exportImage}
                >
                  Download {format === 'png' ? 'PNG' : 'JPEG'}
                </Button>
                <Button
                  variant="quiet"
                  leadingIcon={<Icon name="copy" />}
                  onClick={async () => {
                    const link = new URL(window.location.href)
                    link.search = serialiseGradient(state).toString()
                    await navigator.clipboard.writeText(link.href)
                    notify('Link copied', 'Anyone with the link sees this gradient.')
                  }}
                >
                  Copy link
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Stack>
  )
}
