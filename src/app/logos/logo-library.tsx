'use client'

import { Badge, EmptyState, Grid, Icon, SegmentedControl, Select, Switch } from '@convert/product-ui'
import { logoAssets } from '@/brand/assets.generated'
import type { BrandAsset } from '@/brand/asset-types'
import styles from '@/components/guide.module.css'
import { formatBytes } from '@/lib/export'
import { useState } from 'react'

const families = ['Logo', 'Straight', 'Icon', 'Profile icon'] as const

/** A background that keeps each official colour visible. */
function previewBackground(asset: BrandAsset): string {
  if (asset.colour === 'White' || asset.colour === 'Light Green') return 'var(--cui-colour-forest)'
  return 'var(--cui-surface-band)'
}

export function LogoLibrary() {
  const [family, setFamily] = useState<string>('Logo')
  const [colour, setColour] = useState('all')
  const [format, setFormat] = useState('svg')
  const [clearSpace, setClearSpace] = useState(false)

  const isProfile = family === 'Profile icon'
  const assets = logoAssets.filter(
    (a) =>
      a.family === family &&
      (isProfile || ((colour === 'all' || a.colour === colour) && a.format === format && a.clearSpace === clearSpace)),
  )

  return (
    <Stack>
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
      </div>
      <p className={styles.prose} role="status">
        {assets.length} {assets.length === 1 ? 'file' : 'files'}
      </p>
      {assets.length === 0 ? (
        <EmptyState heading="No files match" description="Try another colour or format." live />
      ) : (
        <Grid columns={4} minItemWidth={220}>
          {assets.map((asset) => {
            const name = asset.source.split('/').pop()!
            return (
              <article key={asset.id} className={styles.assetCard}>
                <div className={styles.preview} style={{ background: previewBackground(asset) }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- originals must be shown unaltered */}
                  <img src={asset.href} alt="" loading="lazy" />
                </div>
                <div>
                  <strong style={{ fontSize: 'var(--cui-type-compact)' }}>
                    {asset.colour ?? name.replace(/\.[a-z]+$/, '').replace(/_/g, ' ')}
                  </strong>
                  <div className={styles.assetMeta}>
                    <span>
                      <Badge>{asset.format.toUpperCase()}</Badge> {formatBytes(asset.bytes)}
                    </span>
                    <a
                      href={asset.href}
                      download={name}
                      aria-label={`Download ${name}`}
                      style={{
                        display: 'inline-flex',
                        gap: 'var(--cui-space-4)',
                        alignItems: 'center',
                        color: 'var(--cui-text-accent)',
                      }}
                    >
                      <Icon name="download" /> Download
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </Grid>
      )}
    </Stack>
  )
}

function Stack({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gap: 'var(--cui-space-24)' }}>{children}</div>
}
