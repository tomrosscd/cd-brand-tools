'use client'

import { brandColours, type BrandColourId } from '@/brand/colours'
import { useId } from 'react'
import styles from './controls.module.css'

interface SwatchPickerProps<T extends string> {
  label: string
  value: T
  onValueChange: (value: T) => void
  /** Limit the choice to these brand colours. Defaults to the whole palette. */
  colours?: readonly BrandColourId[]
  /** Adds a transparent option with this label. */
  noneLabel?: string
  disabledValues?: readonly string[]
}

/** Native radio buttons presented as brand colour swatches. Each option keeps its colour name as its label. */
export function SwatchPicker<T extends string>({
  label,
  value,
  onValueChange,
  colours,
  noneLabel,
  disabledValues = [],
}: SwatchPickerProps<T>) {
  const name = useId()
  const options = brandColours.filter((c) => !colours || colours.includes(c.id))
  const selected = options.find((c) => c.id === value)?.name ?? (value === 'none' ? noneLabel : undefined)
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        {label}
        {selected ? `: ${selected}` : ''}
      </legend>
      <div className={styles.swatches}>
        {noneLabel ? (
          <label className={styles.swatch} title={noneLabel}>
            <input
              type="radio"
              name={name}
              value="none"
              checked={value === 'none'}
              onChange={() => onValueChange('none' as T)}
              aria-label={noneLabel}
            />
            <span className={`${styles.chip} ${styles.none}`} aria-hidden="true" />
          </label>
        ) : null}
        {options.map((colour) => (
          <label key={colour.id} className={styles.swatch} title={colour.name}>
            <input
              type="radio"
              name={name}
              value={colour.id}
              checked={value === colour.id}
              disabled={disabledValues.includes(colour.id)}
              onChange={() => onValueChange(colour.id as T)}
              aria-label={colour.name}
            />
            <span className={styles.chip} style={{ background: colour.hex }} aria-hidden="true" />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
