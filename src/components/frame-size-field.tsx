'use client'

import { Select } from '@convert/product-ui'
import { framePresets, frameSizeError, paperFor, paperFrame, presetFor, type FrameSize } from '@/lib/frame'
import { useState } from 'react'
import styles from './controls.module.css'

export function FrameSizeField({
  value,
  onValueChange,
}: {
  value: FrameSize
  onValueChange: (size: FrameSize) => void
}) {
  const paper = paperFor(value)
  const preset = paper?.preset ?? presetFor(value)
  const [ppiDraft, setPpiDraft] = useState(String(paper?.ppi ?? 300))
  const [resolutionMode, setResolutionMode] = useState(
    paper && ![150, 300].includes(paper.ppi) ? 'custom' : String(paper?.ppi ?? 300),
  )
  const [custom, setCustom] = useState(!preset)
  const [draft, setDraft] = useState({ width: String(value.width), height: String(value.height) })

  const [synced, setSynced] = useState(value)
  if (
    synced.width !== value.width ||
    synced.height !== value.height ||
    synced.paperPreset !== value.paperPreset ||
    synced.ppi !== value.ppi
  ) {
    setSynced(value)
    if (paper) {
      setPpiDraft(String(paper.ppi))
      if (resolutionMode !== 'custom') setResolutionMode([150, 300].includes(paper.ppi) ? String(paper.ppi) : 'custom')
    }
    setDraft({ width: String(value.width), height: String(value.height) })
  }

  const size = { width: Number(draft.width), height: Number(draft.height) }
  const error = custom ? frameSizeError(size) : undefined

  const update = (next: typeof draft) => {
    setDraft(next)
    const parsed = { width: Number(next.width), height: Number(next.height), paperPreset: undefined, ppi: undefined }
    if (!frameSizeError(parsed)) onValueChange(parsed)
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--cui-space-12)' }}>
      <Select
        label="Canvas size"
        hint={
          preset?.group === 'Paper' && !custom
            ? 'Without bleed. Set the paper size in your layout app when placing the image; PPI here controls pixel dimensions.'
            : undefined
        }
        value={custom ? 'custom' : (preset?.id ?? 'custom')}
        options={[
          ...(['Screen', 'Social', 'Paper'] as const).flatMap((group) => [
            { value: `group-${group}`, label: group, disabled: true },
            ...framePresets
              .filter((p) => p.group === group)
              .map((p) => ({
                value: p.id,
                label: p.millimetres
                  ? `  ${p.label}, ${p.millimetres[0]} × ${p.millimetres[1]} mm`
                  : `  ${p.label}, ${p.width} × ${p.height}`,
              })),
          ]),
          { value: 'group-custom', label: 'Custom', disabled: true },
          { value: 'custom', label: 'Custom size' },
        ]}
        onChange={(event) => {
          const next = framePresets.find((p) => p.id === event.target.value)
          setCustom(!next)
          if (next) {
            const candidate = paperFrame(next, Number(ppiDraft))
            onValueChange(
              Number(ppiDraft) >= 72 && Number(ppiDraft) <= 600 && !frameSizeError(candidate)
                ? candidate
                : paperFrame(next, 300),
            )
          }
        }}
      />
      {preset?.millimetres && !custom ? (
        <div>
          <Select
            label="Print resolution"
            value={resolutionMode}
            options={[
              { value: '150', label: '150 PPI — smaller file' },
              { value: '300', label: '300 PPI — detailed print' },
              { value: 'custom', label: 'Custom PPI' },
            ]}
            onChange={(event) => {
              const mode = event.target.value
              setResolutionMode(mode)
              if (mode !== 'custom') {
                setPpiDraft(mode)
                onValueChange(paperFrame(preset, Number(mode)))
              }
            }}
          />
          {resolutionMode === 'custom' ? (
            <label
              className={styles.legend}
              style={{ display: 'grid', gap: 'var(--cui-space-4)', marginTop: 'var(--cui-space-12)' }}
            >
              Pixels per inch
              <input
                className={styles.number}
                type="number"
                min={72}
                max={600}
                step={1}
                value={ppiDraft}
                aria-invalid={
                  !!frameSizeError(paperFrame(preset, Number(ppiDraft))) ||
                  Number(ppiDraft) < 72 ||
                  Number(ppiDraft) > 600
                }
                onChange={(event) => {
                  setPpiDraft(event.target.value)
                  const ppi = Number(event.target.value)
                  const next = paperFrame(preset, ppi)
                  if (Number.isInteger(ppi) && ppi >= 72 && ppi <= 600 && !frameSizeError(next)) onValueChange(next)
                }}
              />
            </label>
          ) : null}
          <p className={styles.hint} role="status">
            {Number(ppiDraft) < 72 || Number(ppiDraft) > 600
              ? 'Choose 72–600 PPI.'
              : (frameSizeError(paperFrame(preset, Number(ppiDraft))) ??
                `${preset.millimetres[0]} × ${preset.millimetres[1]} mm · ${value.width} × ${value.height} px`)}
          </p>
        </div>
      ) : null}
      {custom ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cui-space-12)' }}>
            {(['width', 'height'] as const).map((side) => (
              <label key={side} className={styles.legend} style={{ display: 'grid', gap: 'var(--cui-space-4)' }}>
                {side === 'width' ? 'Width (px)' : 'Height (px)'}
                <input
                  className={styles.number}
                  type="number"
                  inputMode="numeric"
                  min={16}
                  max={8192}
                  value={draft[side]}
                  aria-invalid={error ? true : undefined}
                  onChange={(event) => update({ ...draft, [side]: event.target.value })}
                />
              </label>
            ))}
          </div>
          <p
            className={styles.hint}
            role={error ? 'alert' : undefined}
            style={error ? { color: 'var(--cui-text-negative)' } : undefined}
          >
            {error ?? 'Up to 8192 px per side and 40 megapixels in total.'}
          </p>
        </div>
      ) : null}
    </div>
  )
}
