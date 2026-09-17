'use client'

import { Alert, Button, Icon, PageHeader, SegmentedControl, Select, Stack } from '@convert/product-ui'
import { getBrandColour, type BrandColourId } from '@/brand/colours'
import { FrameSizeField } from '@/components/frame-size-field'
import { RangeField } from '@/components/range-field'
import { SwatchPicker } from '@/components/swatch-picker'
import { useToast } from '@/components/toast-provider'
import styles from '@/components/tool-layout.module.css'
import { canvasToBlob, downloadBlob, formatBytes, type RasterFormat } from '@/lib/export'
import {
  availableColours,
  gradientColourLimits,
  gradientFileName,
  gradientPalettes,
  serialiseGradient,
  type GradientState,
} from '@/lib/gradient'
import { GradientRenderer } from '@/lib/gradient-renderer'
import { newSeed } from '@/lib/random'
import { useUrlState } from '@/lib/use-url-state'
import { useCallback, useEffect, useRef, useState } from 'react'

const PREVIEW_LONG_SIDE = 1200

export function GradientGenerator({ initialState }: { initialState: GradientState }) {
  const [state, setState] = useState(initialState)
  const [format, setFormat] = useState<RasterFormat>('png')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string>()
  const [addColour, setAddColour] = useState<BrandColourId | ''>('')
  const rendererRef = useRef<GradientRenderer | null>(null)
  const notify = useToast()

  useUrlState(serialiseGradient(state))

  const [renderer, setRenderer] = useState<GradientRenderer | null>(null)

  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    try {
      const created = new GradientRenderer(canvas)
      rendererRef.current = created
      setRenderer(created)
      return () => created.dispose()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The preview could not start.')
    }
  }, [])

  useEffect(() => {
    if (!renderer) return
    const ratio = Math.min(1, PREVIEW_LONG_SIDE / Math.max(state.width, state.height))
    const frame = requestAnimationFrame(() =>
      renderer.renderPreview(state, Math.round(state.width * ratio), Math.round(state.height * ratio)),
    )
    return () => cancelAnimationFrame(frame)
  }, [state, renderer])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.code !== 'Space' || target.closest('input, select, textarea, button, a, [role="radio"]')) return
      event.preventDefault()
      setState((current) => ({ ...current, seed: newSeed() }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const update = (patch: Partial<GradientState>) => setState((current) => ({ ...current, ...patch }))

  const move = (index: number, direction: -1 | 1) => {
    const colours = [...state.colours]
    const [item] = colours.splice(index, 1)
    colours.splice(index + direction, 0, item)
    update({ colours })
  }

  const exportImage = async () => {
    const renderer = rendererRef.current
    if (!renderer) return
    setExporting(true)
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const canvas = renderer.renderFull(state)
      const blob = await canvasToBlob(canvas, format)
      downloadBlob(blob, gradientFileName(state, format))
      notify('Gradient exported', `${state.width} × ${state.height} ${format.toUpperCase()}, ${formatBytes(blob.size)}`)
    } catch (caught) {
      notify('Export failed', caught instanceof Error ? caught.message : 'Try a smaller size.')
    } finally {
      const ratio = Math.min(1, PREVIEW_LONG_SIDE / Math.max(state.width, state.height))
      renderer.renderPreview(state, Math.round(state.width * ratio), Math.round(state.height * ratio))
      setExporting(false)
    }
  }

  const unused = availableColours(state)

  return (
    <Stack gap={32}>
      <PageHeader
        heading="Gradient generator"
        description="Soft mesh gradients with grain, made only from Convert colours. Press the space bar for a new arrangement."
        actions={
          <Button variant="secondary" leadingIcon={<Icon name="loading" />} onClick={() => update({ seed: newSeed() })}>
            Generate another
          </Button>
        }
      />
      <div className={styles.layout}>
        <div className={styles.stage}>
          <div className={styles.canvasArea}>
            <div className={styles.frame} style={{ aspectRatio: `${state.width} / ${state.height}` }}>
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Gradient of ${state.colours.map((id) => getBrandColour(id).name).join(', ')}`}
              />
            </div>
          </div>
          <p className={styles.caption}>
            Preview scaled from {state.width} × {state.height}. Seed {state.seed}. Grain is drawn per pixel, so it looks
            finer in the full-size export.
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
            <Select
              label="Starting palette"
              value={gradientPalettes.find((p) => p.colours.join() === state.colours.join())?.id ?? 'custom'}
              options={[
                ...gradientPalettes.map((p) => ({ value: p.id, label: p.label })),
                { value: 'custom', label: 'Custom', disabled: true },
              ]}
              onChange={(event) => {
                const palette = gradientPalettes.find((p) => p.id === event.target.value)
                if (palette) update({ colours: palette.colours })
              }}
            />
            <ol className={styles.orderList} aria-label="Colours in this gradient, strongest first">
              {state.colours.map((id, index) => {
                const colour = getBrandColour(id)
                return (
                  <li key={id} className={styles.orderItem}>
                    <span className={styles.dot} style={{ background: colour.hex }} aria-hidden="true" />
                    <span>{colour.name}</span>
                    <span className={styles.row}>
                      <Button
                        variant="quiet"
                        size="icon"
                        aria-label={`Move ${colour.name} up`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <Icon name="chevron-up" />
                      </Button>
                      <Button
                        variant="quiet"
                        size="icon"
                        aria-label={`Move ${colour.name} down`}
                        disabled={index === state.colours.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <Icon name="chevron" />
                      </Button>
                      <Button
                        variant="quiet"
                        size="icon"
                        aria-label={`Remove ${colour.name}`}
                        disabled={state.colours.length <= gradientColourLimits.min}
                        onClick={() => update({ colours: state.colours.filter((c) => c !== id) })}
                      >
                        <Icon name="close" />
                      </Button>
                    </span>
                  </li>
                )
              })}
            </ol>
            {state.colours.length < gradientColourLimits.max && unused.length > 0 ? (
              <div className={styles.section}>
                <SwatchPicker
                  label="Add a colour"
                  value={addColour}
                  colours={unused}
                  onValueChange={(id) => {
                    setAddColour('')
                    update({ colours: [...state.colours, id as BrandColourId] })
                  }}
                />
              </div>
            ) : (
              <p className={styles.caption}>A gradient uses up to five colours.</p>
            )}
          </section>

          <section className={styles.section} aria-labelledby="gradient-texture">
            <h2 id="gradient-texture" className={styles.heading}>
              Texture
            </h2>
            <RangeField
              label="Chaos"
              value={state.chaos}
              min={0}
              max={1}
              step={0.01}
              displayScale={100}
              unit="%"
              hint="How far the colour fields warp and swirl."
              onValueChange={(chaos) => update({ chaos })}
            />
            <RangeField
              label="Grain"
              value={state.grain}
              min={0}
              max={1}
              step={0.01}
              displayScale={100}
              unit="%"
              hint="Film grain strength."
              onValueChange={(grain) => update({ grain })}
            />
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
                  await navigator.clipboard.writeText(window.location.href)
                  notify('Link copied', 'Anyone with the link sees this gradient.')
                }}
              >
                Copy link
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Stack>
  )
}
