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
import { gradientFileName, gradientStyleOf, serialiseGradient, type GradientState } from '@/lib/gradient'
import { newSeed } from '@/lib/random'
import { useUrlState } from '@/lib/use-url-state'
import { useEffect, useMemo, useState } from 'react'

export function GradientGenerator({ initialState }: { initialState: GradientState }) {
  const [state, setState] = useState(initialState)
  const [format, setFormat] = useState<RasterFormat>('png')
  const [exporting, setExporting] = useState(false)
  const notify = useToast()
  const style = useMemo(() => gradientStyleOf(state), [state])
  const frame = useMemo(() => ({ width: state.width, height: state.height }), [state.width, state.height])
  const { canvasRef, error, renderFull } = useGradientCanvas(style, frame)

  useUrlState(serialiseGradient(state))

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
            <GradientColourEditor colours={state.colours} onChange={(colours) => update({ colours })} />
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
