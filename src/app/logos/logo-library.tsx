'use client'

import { Badge, Button, EmptyState, Icon, SegmentedControl, Select, Switch } from '@convert/product-ui'
import { logoAssets } from '@/brand/assets.generated'
import type { BrandAsset } from '@/brand/asset-types'
import { brandColours, getBrandColour, type BrandColourId } from '@/brand/colours'
import styles from '@/components/guide.module.css'
import { useToast } from '@/components/toast-provider'
import { withBase } from '@/lib/base-path'
import { copyPng, copySvg, imageUrlToPng } from '@/lib/clipboard'
import { canvasToBlob, downloadBlob, formatBytes, svgBlob } from '@/lib/export'
import { geometryToSvg } from '@/lib/svg-markup'
import { useState } from 'react'

const families = ['Logo', 'Straight', 'Icon', 'Profile icon'] as const

const isLight = (asset: BrandAsset) => asset.colour === 'White' || asset.colour === 'Light Green'

/** The chosen background, or a contrasting one when the choice is automatic or matches the logo. */
function backgroundFor(asset: BrandAsset, choice: BrandColourId | 'auto'): BrandColourId {
  const automatic: BrandColourId = isLight(asset) ? 'dark-green' : 'white'
  if (choice === 'auto') return automatic
  return getBrandColour(choice).name === asset.colour ? automatic : choice
}

/** Draws a raster logo over a solid colour and returns a canvas at the file's own size. */
async function rasterWithBackground(asset: BrandAsset, background: string): Promise<HTMLCanvasElement> {
  const image = new Image()
  image.src = withBase(asset.href)
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d')!
  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0)
  return canvas
}

export function LogoLibrary() {
  const [family, setFamily] = useState<string>('Logo')
  const [colour, setColour] = useState('all')
  const [format, setFormat] = useState('svg')
  const [clearSpace, setClearSpace] = useState(false)
  const [withBackground, setWithBackground] = useState(false)
  const [backgroundChoice, setBackgroundChoice] = useState<BrandColourId | 'auto'>('auto')
  const notify = useToast()

  const isProfile = family === 'Profile icon'
  // Profile icons and JPEGs already carry their own background.
  const backgroundApplies = !isProfile && format !== 'jpg'
  const assets = logoAssets.filter(
    (a) =>
      a.family === family &&
      (isProfile || ((colour === 'all' || a.colour === colour) && a.format === format && a.clearSpace === clearSpace)),
  )

  const fileName = (asset: BrandAsset) => asset.source.split('/').pop()!
  const activeBackground = (asset: BrandAsset) =>
    withBackground && backgroundApplies ? getBrandColour(backgroundFor(asset, backgroundChoice)) : undefined

  const copy = async (asset: BrandAsset) => {
    const background = activeBackground(asset)
    try {
      if (asset.geometry) {
        await copySvg(geometryToSvg(asset.geometry, { background: background?.hex }))
        notify('Copied as SVG', 'Paste into Figma with Cmd+V (Ctrl+V on Windows). It arrives as editable vectors.')
      } else {
        const png = background
          ? rasterWithBackground(asset, background.hex).then((canvas) => canvasToBlob(canvas, 'png'))
          : imageUrlToPng(withBase(asset.href))
        await copyPng(png)
        notify('Copied as an image', 'Paste into Figma with Cmd+V (Ctrl+V on Windows).')
      }
    } catch (caught) {
      notify('Could not copy', caught instanceof Error ? caught.message : 'Download the file instead.')
    }
  }

  const download = async (asset: BrandAsset) => {
    const background = activeBackground(asset)
    const name = fileName(asset)
    if (!background) {
      const link = document.createElement('a')
      link.href = withBase(asset.href)
      link.download = name
      link.click()
      return
    }
    const withSuffix = name.replace(/(\.[a-z]+)$/i, `_on_${background.name.replace(/\s/g, '_')}$1`)
    try {
      if (asset.geometry) {
        downloadBlob(svgBlob(geometryToSvg(asset.geometry, { background: background.hex })), withSuffix)
      } else {
        downloadBlob(await canvasToBlob(await rasterWithBackground(asset, background.hex), 'png'), withSuffix)
      }
    } catch (caught) {
      notify('Download failed', caught instanceof Error ? caught.message : 'Try again.')
    }
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--cui-space-24)' }}>
      <div className={styles.filters}>
        <SegmentedControl
          label="Type"
          value={family}
          options={families.map((f) => ({
            value: f,
            label: f === 'Straight' ? 'Straight logo' : f === 'Profile icon' ? 'Profile icons' : f,
          }))}
          onValueChange={setFamily}
        />
        {!isProfile ? (
          <>
            <Select
              label="Colour"
              value={colour}
              options={[
                { value: 'all', label: 'All colours' },
                ...['Dark Green', 'Light Green', 'White', 'Black'].map((c) => ({ value: c, label: c })),
              ]}
              onChange={(event) => setColour(event.target.value)}
            />
            <SegmentedControl
              label="Format"
              value={format}
              options={[
                { value: 'svg', label: 'SVG' },
                { value: 'png', label: 'PNG' },
                { value: 'jpg', label: 'JPEG' },
              ]}
              onValueChange={setFormat}
            />
            <Switch
              label="Clear space"
              checked={clearSpace}
              onChange={(event) => setClearSpace(event.target.checked)}
            />
          </>
        ) : null}
        {backgroundApplies ? (
          <>
            <Switch
              label="Background"
              checked={withBackground}
              onChange={(event) => setWithBackground(event.target.checked)}
            />
            {withBackground ? (
              <Select
                label="Background colour"
                value={backgroundChoice}
                options={[
                  { value: 'auto', label: 'Automatic contrast' },
                  ...brandColours.map((c) => ({ value: c.id, label: c.name })),
                ]}
                onChange={(event) => setBackgroundChoice(event.target.value as BrandColourId | 'auto')}
              />
            ) : null}
          </>
        ) : null}
      </div>
      <p className={styles.prose} role="status">
        {assets.length} {assets.length === 1 ? 'file' : 'files'}.{' '}
        {isProfile || format === 'jpg'
          ? 'These files already include a background.'
          : withBackground
            ? 'Copies and downloads include the background.'
            : 'Copies and downloads are transparent.'}{' '}
        Copy pastes straight into Figma.
      </p>
      {assets.length === 0 ? (
        <EmptyState heading="No files match" description="Try another colour or format." live />
      ) : (
        <div className={styles.cardGrid}>
          {assets.map((asset) => {
            const name = fileName(asset)
            const background = activeBackground(asset)
            const checker = isLight(asset) ? styles.checkerboardDark : styles.checkerboard
            return (
              <article key={asset.id} className={styles.assetCard}>
                <div
                  className={`${styles.preview} ${background || !backgroundApplies ? '' : checker}`}
                  style={
                    background
                      ? { background: background.hex }
                      : backgroundApplies
                        ? undefined
                        : { background: 'var(--cui-surface-band)' }
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- originals must be shown unaltered */}
                  <img src={withBase(asset.href)} alt="" loading="lazy" />
                </div>
                <div>
                  <strong style={{ fontSize: 'var(--cui-type-compact)' }}>
                    {asset.colour ?? name.replace(/\.[a-z]+$/, '').replace(/_/g, ' ')}
                    {background ? ` on ${background.name}` : ''}
                  </strong>
                  <div className={styles.assetMeta}>
                    <span>
                      <Badge>{asset.format.toUpperCase()}</Badge> {formatBytes(asset.bytes)}
                    </span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button
                    size="sm"
                    leadingIcon={<Icon name="copy" />}
                    aria-label={`Copy ${name}${background ? ` on ${background.name}` : ''}`}
                    onClick={() => copy(asset)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    leadingIcon={<Icon name="download" />}
                    aria-label={`Download ${name}${background ? ` on ${background.name}` : ''}`}
                    onClick={() => download(asset)}
                  >
                    Download
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
