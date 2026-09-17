'use client'

import { Button, Icon, Select, Switch, TextLink } from '@convert/product-ui'
import { brandColours, getBrandColour, type BrandColourId } from '@/brand/colours'
import { stacks } from '@/brand/stacks.generated'
import type { StackArtwork } from '@/brand/stack-types'
import styles from '@/components/guide.module.css'
import { StackThumbnail } from '@/components/stack-thumbnail'
import { useToast } from '@/components/toast-provider'
import { canvasToBlob, downloadBlob, svgBlob, svgToCanvas } from '@/lib/export'
import { withBase } from '@/lib/base-path'
import { copySvg } from '@/lib/clipboard'
import { stackDownloadName, stackDownloadSize, stackToSvg } from '@/lib/stack-download'
import { useState } from 'react'

const PNG_WIDTH = 2000

export function StackLibrary() {
  const [colour, setColour] = useState<BrandColourId>('light-green')
  const [withBackground, setWithBackground] = useState(false)
  const [backgroundColour, setBackgroundColour] = useState<BrandColourId>('dark-green')
  const notify = useToast()

  const fill = getBrandColour(colour).hex
  const background = withBackground ? getBrandColour(backgroundColour).hex : undefined
  const colourOptions = brandColours.map((c) => ({ value: c.id, label: c.name }))

  const download = async (stack: StackArtwork, format: 'png' | 'svg') => {
    const svg = stackToSvg(stack, { fill, background, width: format === 'png' ? PNG_WIDTH : undefined })
    const name = stackDownloadName(stack, colour, withBackground ? backgroundColour : undefined, format)
    try {
      if (format === 'svg') {
        downloadBlob(svgBlob(svg), name)
      } else {
        const size = stackDownloadSize(stack, PNG_WIDTH)
        downloadBlob(await canvasToBlob(await svgToCanvas(svg, size.width, size.height), 'png'), name)
      }
      notify('Stack downloaded', name)
    } catch (caught) {
      notify('Download failed', caught instanceof Error ? caught.message : 'Try again.')
    }
  }

  const copy = async (stack: StackArtwork) => {
    try {
      await copySvg(stackToSvg(stack, { fill, background }))
      notify('Copied as SVG', 'Paste into Figma with Cmd+V (Ctrl+V on Windows). It arrives as editable vectors.')
    } catch (caught) {
      notify('Could not copy', caught instanceof Error ? caught.message : 'Download the SVG instead.')
    }
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--cui-space-24)' }}>
      <div className={styles.filters}>
        <Select
          label="Stack colour"
          value={colour}
          options={colourOptions}
          onChange={(event) => setColour(event.target.value as BrandColourId)}
        />
        <Switch
          label="Background"
          checked={withBackground}
          onChange={(event) => setWithBackground(event.target.checked)}
        />
        {withBackground ? (
          <Select
            label="Background colour"
            value={backgroundColour}
            options={colourOptions.filter((option) => option.value !== colour)}
            onChange={(event) => setBackgroundColour(event.target.value as BrandColourId)}
          />
        ) : null}
      </div>
      <p className={styles.prose}>
        Copies and downloads are cropped tightly to the stack. Copy pastes straight into Figma as vectors. PNGs are{' '}
        {PNG_WIDTH}px wide
        {withBackground ? '.' : ' with a transparent background.'}
      </p>
      <div className={styles.cardGrid}>
        {stacks.map((stack) => (
          <article key={stack.id} className={styles.assetCard}>
            <div
              className={`${styles.preview} ${withBackground ? '' : styles.checkerboard}`}
              style={withBackground ? { background } : undefined}
            >
              <StackThumbnail stack={stack} fill={fill} />
            </div>
            <div className={styles.assetMeta}>
              <strong>{stack.label}</strong>
              <TextLink href={`${withBase('/create/stack/')}?stack=${stack.id.replace('stack-', '')}&colour=${colour}`}>
                Use
              </TextLink>
            </div>
            <div className={styles.actions}>
              <Button
                size="sm"
                leadingIcon={<Icon name="copy" />}
                aria-label={`Copy ${stack.label} as SVG`}
                onClick={() => copy(stack)}
              >
                Copy
              </Button>
              <Button
                size="sm"
                variant="secondary"
                leadingIcon={<Icon name="download" />}
                aria-label={`Download ${stack.label} as PNG`}
                onClick={() => download(stack, 'png')}
              >
                PNG
              </Button>
              <Button
                size="sm"
                variant="secondary"
                leadingIcon={<Icon name="download" />}
                aria-label={`Download ${stack.label} as SVG`}
                onClick={() => download(stack, 'svg')}
              >
                SVG
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
