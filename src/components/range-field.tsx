'use client'

import { useId } from 'react'
import styles from './controls.module.css'

interface RangeFieldProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onValueChange: (value: number) => void
  /** Shown value is `value * displayScale`, e.g. 100 for percentages. */
  displayScale?: number
  unit?: string
  hint?: string
}

/** A slider paired with a number input, so a value can be dragged or typed exactly. */
export function RangeField({
  label,
  value,
  min,
  max,
  step,
  onValueChange,
  displayScale = 1,
  unit,
  hint,
}: RangeFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const shown = Math.round(value * displayScale * 100) / 100
  const commit = (raw: number) => {
    if (Number.isFinite(raw)) onValueChange(Math.min(max, Math.max(min, raw)))
  }
  return (
    <div>
      <label htmlFor={id} className={styles.legend} style={{ display: 'block' }}>
        {label}
      </label>
      <div className={styles.range}>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-describedby={hint ? hintId : undefined}
          aria-valuetext={`${shown}${unit ?? ''}`}
          onChange={(event) => commit(Number(event.target.value))}
        />
        <input
          className={styles.number}
          type="number"
          aria-label={`${label}${unit ? ` (${unit.trim()})` : ''}`}
          min={min * displayScale}
          max={max * displayScale}
          step={step * displayScale}
          value={shown}
          onChange={(event) => commit(Number(event.target.value) / displayScale)}
        />
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
