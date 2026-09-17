'use client'

import { Button, Icon, Select } from '@convert/product-ui'
import { getBrandColour, type BrandColourId } from '@/brand/colours'
import { availableColours, gradientColourLimits, gradientPalettes } from '@/lib/gradient'
import { SwatchPicker } from './swatch-picker'
import styles from './tool-layout.module.css'

interface GradientColourEditorProps {
  colours: readonly BrandColourId[]
  onChange: (colours: readonly BrandColourId[]) => void
}

/** Choose, order and remove the brand colours in a gradient. */
export function GradientColourEditor({ colours, onChange }: GradientColourEditorProps) {
  const move = (index: number, direction: -1 | 1) => {
    const next = [...colours]
    const [item] = next.splice(index, 1)
    next.splice(index + direction, 0, item)
    onChange(next)
  }
  const unused = availableColours({ colours })

  return (
    <>
      <Select
        label="Starting palette"
        value={gradientPalettes.find((p) => p.colours.join() === colours.join())?.id ?? 'custom'}
        options={[
          ...gradientPalettes.map((p) => ({ value: p.id, label: p.label })),
          { value: 'custom', label: 'Custom', disabled: true },
        ]}
        onChange={(event) => {
          const palette = gradientPalettes.find((p) => p.id === event.target.value)
          if (palette) onChange(palette.colours)
        }}
      />
      <ol className={styles.orderList} aria-label="Colours in this gradient, strongest first">
        {colours.map((id, index) => {
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
                  disabled={index === colours.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <Icon name="chevron" />
                </Button>
                <Button
                  variant="quiet"
                  size="icon"
                  aria-label={`Remove ${colour.name}`}
                  disabled={colours.length <= gradientColourLimits.min}
                  onClick={() => onChange(colours.filter((c) => c !== id))}
                >
                  <Icon name="close" />
                </Button>
              </span>
            </li>
          )
        })}
      </ol>
      {colours.length < gradientColourLimits.max && unused.length > 0 ? (
        <SwatchPicker
          label="Add a colour"
          value=""
          colours={unused}
          onValueChange={(id) => onChange([...colours, id as BrandColourId])}
        />
      ) : (
        <p className={styles.caption}>A gradient uses up to five colours.</p>
      )}
    </>
  )
}
