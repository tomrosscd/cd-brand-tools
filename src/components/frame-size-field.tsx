'use client'

import { Select } from '@convert/product-ui'
import { framePresets, frameSizeError, presetFor, type FrameSize } from '@/lib/frame'
import { useState } from 'react'
import styles from './controls.module.css'

export function FrameSizeField({
  value,
  onValueChange,
}: {
  value: FrameSize
  onValueChange: (size: FrameSize) => void
}) {
  const preset = presetFor(value)
  const [custom, setCustom] = useState(!preset)
  const [draft, setDraft] = useState({ width: String(value.width), height: String(value.height) })

  const [synced, setSynced] = useState(value)
  if (synced.width !== value.width || synced.height !== value.height) {
    setSynced(value)
    setDraft({ width: String(value.width), height: String(value.height) })
  }

  const size = { width: Number(draft.width), height: Number(draft.height) }
  const error = custom ? frameSizeError(size) : undefined

  const update = (next: typeof draft) => {
    setDraft(next)
    const parsed = { width: Number(next.width), height: Number(next.height) }
    if (!frameSizeError(parsed)) onValueChange(parsed)
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--cui-space-12)' }}>
      <Select
        label="Size"
        value={custom ? 'custom' : (preset?.id ?? 'custom')}
        options={[
          ...framePresets.map((p) => ({ value: p.id, label: `${p.label}, ${p.width} × ${p.height}` })),
          { value: 'custom', label: 'Custom size' },
        ]}
        onChange={(event) => {
          const next = framePresets.find((p) => p.id === event.target.value)
          setCustom(!next)
          if (next) onValueChange({ width: next.width, height: next.height })
        }}
      />
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
