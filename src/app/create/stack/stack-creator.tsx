'use client'

import { Alert, Button, Icon, PageHeader, SegmentedControl, Select, Stack } from '@convert/product-ui'
import { getBrandColour } from '@/brand/colours'
import { stacks } from '@/brand/stacks.generated'
import { FrameSizeField } from '@/components/frame-size-field'
import { GradientColourEditor } from '@/components/gradient-colour-editor'
import { RangeField } from '@/components/range-field'
import { StackThumbnail } from '@/components/stack-thumbnail'
import { SwatchPicker } from '@/components/swatch-picker'
import { useToast } from '@/components/toast-provider'
import styles from '@/components/tool-layout.module.css'
import { useGradientCanvas } from '@/components/use-gradient-canvas'
import { canvasToBlob, downloadBlob, formatBytes, svgBlob, svgToCanvas } from '@/lib/export'
import {
  compositionFileName,
  compositionLimits,
  compositionToSvg,
  defaultComposition,
  getStack,
  overlayColours,
  overlayKinds,
  overlayPositions,
  randomiseStack,
  serialiseComposition,
  type StackComposition,
} from '@/lib/stack-composition'
import { newSeed } from '@/lib/random'
import { useUrlState } from '@/lib/use-url-state'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

type ExportFormat = 'svg' | 'png' | 'jpg'

const positionLabels: Record<(typeof overlayPositions)[number], string> = {
  'top-left': 'Top left',
  'top-centre': 'Top centre',
  'top-right': 'Top right',
  'centre-left': 'Centre left',
  centre: 'Centre',
  'centre-right': 'Centre right',
  'bottom-left': 'Bottom left',
  'bottom-centre': 'Bottom centre',
  'bottom-right': 'Bottom right',
}

export function StackCreator({ initialState }: { initialState: StackComposition }) {
  const [state, setState] = useState(initialState)
  const [history, setHistory] = useState<StackComposition[]>([])
  const [format, setFormat] = useState<ExportFormat>('png')
  const [exporting, setExporting] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startY: number; origin: StackComposition } | null>(null)
  const notify = useToast()

  useUrlState(serialiseComposition(state))
  const svg = useMemo(() => compositionToSvg(state), [state])
  const frameSize = useMemo(() => ({ width: state.width, height: state.height }), [state.width, state.height])
  const gradient = state.background === 'gradient' ? state.gradient : undefined
  const { canvasRef, error: gradientError, renderFull } = useGradientCanvas(gradient, frameSize)
  const setGradient = (patch: Partial<StackComposition['gradient']>) =>
    commit((current) => ({ ...current, gradient: { ...current.gradient, ...patch } }))

  /** Records the current state for undo, then applies a change. */
  const commit = (patch: Partial<StackComposition> | ((current: StackComposition) => StackComposition)) => {
    setHistory((past) => [...past.slice(-49), state])
    setState((current) => (typeof patch === 'function' ? patch(current) : { ...current, ...patch }))
  }

  const undo = () => {
    const previous = history.at(-1)
    if (!previous) return
    setHistory((past) => past.slice(0, -1))
    setState(previous)
  }

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === 'z' &&
        !(event.target as HTMLElement).closest('input, textarea')
      ) {
        event.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const { position, scale, overlaySize } = compositionLimits
  const clampPosition = (value: number) => Math.min(position.max, Math.max(position.min, value))

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { startX: event.clientX, startY: event.clientY, origin: state }
    setHistory((past) => [...past.slice(-49), state])
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current
    if (!drag.current || !frame) return
    const rect = frame.getBoundingClientRect()
    const { origin, startX, startY } = drag.current
    setState({
      ...origin,
      x: clampPosition(origin.x + (event.clientX - startX) / rect.width),
      y: clampPosition(origin.y + (event.clientY - startY) / rect.height),
    })
  }

  const onFrameKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.05 : 0.01
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    if (moves[event.key]) {
      event.preventDefault()
      const [dx, dy] = moves[event.key]
      commit((current) => ({ ...current, x: clampPosition(current.x + dx), y: clampPosition(current.y + dy) }))
    } else if (event.key === '+' || event.key === '=' || event.key === '-') {
      event.preventDefault()
      const factor = event.key === '-' ? 1 / 1.05 : 1.05
      commit((current) => ({ ...current, scale: Math.min(scale.max, Math.max(scale.min, current.scale * factor)) }))
    }
  }

  const exportImage = async () => {
    setExporting(true)
    try {
      const fileName = compositionFileName(state, format)
      let blob: Blob
      if (state.background === 'gradient') {
        const background = await renderFull()
        if (format === 'svg') {
          blob = svgBlob(compositionToSvg(state, { gradientHref: background.toDataURL('image/png') }))
        } else {
          const artwork = await svgToCanvas(svg, state.width, state.height)
          background.getContext('2d')!.drawImage(artwork, 0, 0)
          blob = await canvasToBlob(background, format)
        }
      } else if (format === 'svg') {
        blob = svgBlob(svg)
      } else {
        const exportState =
          format === 'jpg' && state.background === 'none' ? { ...state, background: 'white' as const } : state
        const canvas = await svgToCanvas(compositionToSvg(exportState), state.width, state.height)
        blob = await canvasToBlob(canvas, format)
      }
      downloadBlob(blob, fileName)
      notify('Image exported', `${state.width} × ${state.height} ${format.toUpperCase()}, ${formatBytes(blob.size)}`)
    } catch (caught) {
      notify('Export failed', caught instanceof Error ? caught.message : 'Try a smaller size.')
    } finally {
      setExporting(false)
    }
  }

  const backgroundKind = state.background === 'gradient' || state.background === 'none' ? state.background : 'colour'

  const stack = getStack(state.stackId)
  const stackColour = getBrandColour(state.stackColour)

  return (
    <Stack gap={32}>
      <PageHeader
        heading="Stack creator"
        description="Place one stack in a frame, choose brand colours, add a logo, and export."
        actions={
          <div className={styles.row}>
            <Button variant="quiet" disabled={history.length === 0} onClick={undo}>
              Undo
            </Button>
            <Button variant="quiet" onClick={() => commit(defaultComposition)}>
              Reset
            </Button>
            <Button variant="secondary" onClick={() => commit((current) => randomiseStack(current))}>
              Randomise stack
            </Button>
          </div>
        }
      />
      <div className={styles.layout}>
        <div className={styles.stage}>
          <div className={styles.canvasArea}>
            <div
              ref={frameRef}
              className={`${styles.frame} ${styles.draggable} ${state.background === 'none' ? styles.transparent : ''}`}
              style={{
                aspectRatio: `${state.width} / ${state.height}`,
                width: `min(100%, calc((70vh - 2 * var(--cui-space-24)) * ${state.width / state.height}))`,
              }}
              tabIndex={0}
              role="img"
              aria-label={`${stack.label} in ${stackColour.name}, centred at ${Math.round(state.x * 100)}% across and ${Math.round(state.y * 100)}% down. Use arrow keys to move, plus and minus to resize.`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onKeyDown={onFrameKey}
            >
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className={styles.layer}
                style={{ visibility: gradient ? 'visible' : 'hidden' }}
              />
              <div className={styles.layer} dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
          </div>
          <p className={styles.caption}>
            Drag the stack, or focus the preview and use the arrow keys (Shift for bigger steps) and plus or minus.
            Anything outside the frame is cropped.
          </p>
        </div>

        <div className={styles.panel}>
          <section className={styles.section} aria-labelledby="stack-artwork">
            <h2 id="stack-artwork" className={styles.heading}>
              Stack
            </h2>
            <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
              <legend className={styles.caption} style={{ marginBottom: 'var(--cui-space-8)' }}>
                Choose a stack: {stack.label}
              </legend>
              <div className={styles.stackGrid}>
                {stacks.map((option) => (
                  <label key={option.id} className={styles.stackOption} title={option.label}>
                    <input
                      type="radio"
                      name="stack"
                      value={option.id}
                      checked={option.id === state.stackId}
                      onChange={() => commit({ stackId: option.id })}
                      aria-label={option.label}
                    />
                    <StackThumbnail stack={option} fill={getBrandColour('light-green').hex} />
                  </label>
                ))}
              </div>
            </fieldset>
            <SwatchPicker
              label="Stack colour"
              value={state.stackColour}
              onValueChange={(stackColour) => commit({ stackColour })}
            />
            <RangeField
              label="Size"
              value={state.scale}
              min={scale.min}
              max={scale.max}
              step={0.01}
              displayScale={100}
              unit="%"
              hint="Stack width as a share of the frame width."
              onValueChange={(value) => commit({ scale: value })}
            />
            <>
              <RangeField
                label="Across"
                value={state.x}
                min={position.min}
                max={position.max}
                step={0.01}
                displayScale={100}
                unit="%"
                onValueChange={(x) => commit({ x })}
              />
              <RangeField
                label="Down"
                value={state.y}
                min={position.min}
                max={position.max}
                step={0.01}
                displayScale={100}
                unit="%"
                onValueChange={(y) => commit({ y })}
              />
            </>
          </section>

          <section className={styles.section} aria-labelledby="stack-background">
            <h2 id="stack-background" className={styles.heading}>
              Background
            </h2>
            <SegmentedControl
              label="Background"
              value={backgroundKind}
              options={[
                { value: 'colour', label: 'Colour' },
                { value: 'gradient', label: 'Gradient' },
                { value: 'none', label: 'Transparent' },
              ]}
              onValueChange={(kind) =>
                commit({ background: kind === 'colour' ? 'dark-green' : (kind as 'gradient' | 'none') })
              }
            />
            {backgroundKind === 'colour' ? (
              <SwatchPicker
                label="Background colour"
                value={state.background}
                onValueChange={(background) => commit({ background })}
              />
            ) : null}
            {state.background === state.stackColour ? (
              <Alert heading="The stack matches the background" tone="warning">
                Choose a different stack or background colour so the stack is visible.
              </Alert>
            ) : null}
            {gradient ? (
              <>
                <GradientColourEditor colours={gradient.colours} onChange={(colours) => setGradient({ colours })} />
                <RangeField
                  label="Chaos"
                  value={gradient.chaos}
                  min={0}
                  max={1}
                  step={0.01}
                  displayScale={100}
                  unit="%"
                  onValueChange={(chaos) => setGradient({ chaos })}
                />
                <RangeField
                  label="Grain"
                  value={gradient.grain}
                  min={0}
                  max={1}
                  step={0.01}
                  displayScale={100}
                  unit="%"
                  onValueChange={(grain) => setGradient({ grain })}
                />
                <div>
                  <Button variant="secondary" onClick={() => setGradient({ seed: newSeed() })}>
                    New arrangement
                  </Button>
                </div>
                {gradientError ? (
                  <Alert heading="Gradients are unavailable in this browser" tone="error">
                    {gradientError}
                  </Alert>
                ) : null}
              </>
            ) : null}
          </section>

          <section className={styles.section} aria-labelledby="stack-logo">
            <h2 id="stack-logo" className={styles.heading}>
              Logo
            </h2>
            <SegmentedControl
              label="Logo"
              value={state.overlay.kind}
              options={overlayKinds.map((kind) => ({ value: kind, label: kind === 'none' ? 'None' : kind }))}
              onValueChange={(kind) =>
                commit((current) => ({
                  ...current,
                  overlay: { ...current.overlay, kind: kind as StackComposition['overlay']['kind'] },
                }))
              }
            />
            {state.overlay.kind !== 'none' ? (
              <>
                <Select
                  label="Logo colour"
                  hint="Official colour versions only."
                  value={state.overlay.colour}
                  options={overlayColours.map((colour) => ({ value: colour, label: colour }))}
                  onChange={(event) =>
                    commit((current) => ({
                      ...current,
                      overlay: {
                        ...current.overlay,
                        colour: event.target.value as StackComposition['overlay']['colour'],
                      },
                    }))
                  }
                />
                <Select
                  label="Logo position"
                  value={state.overlay.position}
                  options={overlayPositions.map((value) => ({ value, label: positionLabels[value] }))}
                  onChange={(event) =>
                    commit((current) => ({
                      ...current,
                      overlay: {
                        ...current.overlay,
                        position: event.target.value as StackComposition['overlay']['position'],
                      },
                    }))
                  }
                />
                <RangeField
                  label="Logo size"
                  value={state.overlay.size}
                  min={overlaySize.min}
                  max={overlaySize.max}
                  step={0.005}
                  displayScale={100}
                  unit="%"
                  hint="Logo height as a share of the frame's shorter side."
                  onValueChange={(size) => commit((current) => ({ ...current, overlay: { ...current.overlay, size } }))}
                />
              </>
            ) : null}
          </section>

          <section className={styles.section} aria-labelledby="stack-export">
            <h2 id="stack-export" className={styles.heading}>
              Export
            </h2>
            <FrameSizeField value={state} onValueChange={(size) => commit(size)} />
            <SegmentedControl
              label="Format"
              value={format}
              options={[
                { value: 'png', label: 'PNG' },
                { value: 'jpg', label: 'JPEG' },
                { value: 'svg', label: 'SVG' },
              ]}
              onValueChange={(value) => setFormat(value as ExportFormat)}
            />
            {format === 'svg' && state.background === 'gradient' ? (
              <p className={styles.caption} role="status">
                The gradient is embedded in the SVG as an image, so the file is large. The stack and logo stay as
                vectors.
              </p>
            ) : null}
            {format === 'jpg' && state.background === 'none' ? (
              <p className={styles.caption} role="status">
                JPEG cannot be transparent, so this export uses a White background.
              </p>
            ) : null}
            <div className={styles.row}>
              <Button leadingIcon={<Icon name="download" />} loading={exporting} onClick={exportImage}>
                Download {format === 'jpg' ? 'JPEG' : format.toUpperCase()}
              </Button>
              <Button
                variant="quiet"
                leadingIcon={<Icon name="copy" />}
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href)
                  notify('Link copied', 'Anyone with the link sees this composition.')
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
