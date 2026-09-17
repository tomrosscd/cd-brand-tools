'use client'

import {
  Badge,
  Button,
  ContentList,
  ContentListItem,
  EmptyState,
  Icon,
  Input,
  Select,
  Skeleton,
  Switch,
} from '@convert/product-ui'
import { brandColours, getBrandColour, type BrandColour, type BrandColourId } from '@/brand/colours'
import type { Partner, PartnerFile } from '@/brand/partner-types'
import { partners } from '@/brand/partners.generated'
import styles from '@/components/guide.module.css'
import { useToast } from '@/components/toast-provider'
import { withBase } from '@/lib/base-path'
import { copySvg } from '@/lib/clipboard'
import { hexToRgb } from '@/lib/colour-space'
import { canvasToBlob, downloadBlob, svgBlob, svgToCanvas } from '@/lib/export'
import { addBackground, recolourSvg, trimSvg } from '@/lib/partner-svg'
import { useEffect, useMemo, useState } from 'react'

type LogoColour = BrandColourId | 'original'
type BackgroundChoice = BrandColourId | 'auto'

const PNG_WIDTH = 2000
const vectorPartners = partners.filter((p) => p.vector)
const todoPartners = partners.filter((p) => !p.vector)

const vectorFile = (partner: Partner) => partner.files.find((f) => f.file === partner.vector)!

function isLightHex(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}

/** The chosen background, or one that contrasts with the logo when automatic or when it would match. */
function backgroundFor(file: PartnerFile, logo: LogoColour, choice: BackgroundChoice): BrandColour {
  const logoIsLight = logo === 'original' ? file.originalOn === 'dark' : isLightHex(getBrandColour(logo).hex)
  const automatic = getBrandColour(logoIsLight ? 'dark-green' : 'white')
  if (choice === 'auto' || choice === logo) return automatic
  return getBrandColour(choice)
}

const dataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

const fileStem = (partner: Partner, logo: LogoColour, background?: BrandColour) =>
  `${partner.id}-logo-${logo}${background ? `-on-${background.id}` : ''}`

export function PartnerLibrary() {
  const [sources, setSources] = useState<Record<string, string>>({})
  const [loadError, setLoadError] = useState<string>()
  const [logoColour, setLogoColour] = useState<LogoColour>('original')
  const [withBackground, setWithBackground] = useState(false)
  const [backgroundChoice, setBackgroundChoice] = useState<BackgroundChoice>('auto')
  const [query, setQuery] = useState('')
  const notify = useToast()

  useEffect(() => {
    let cancelled = false
    Promise.all(
      vectorPartners.map(async (partner) => {
        const response = await fetch(withBase(vectorFile(partner).href))
        if (!response.ok) throw new Error(`Could not load the ${partner.name} logo`)
        return [partner.id, await response.text()] as const
      }),
    )
      .then((entries) => !cancelled && setSources(Object.fromEntries(entries)))
      .catch((error: Error) => !cancelled && setLoadError(error.message))
    return () => {
      cancelled = true
    }
  }, [])

  /** Recoloured and tightly cropped artwork, before any background. */
  const artwork = useMemo(() => {
    const colour = logoColour === 'original' ? null : getBrandColour(logoColour).hex
    return Object.fromEntries(
      Object.entries(sources).map(([id, svg]) => [id, trimSvg(recolourSvg(svg, colour))]),
    ) as Record<string, string>
  }, [sources, logoColour])

  const finalSvg = (partner: Partner) => {
    const svg = artwork[partner.id]
    if (!svg || !withBackground) return { svg, background: undefined }
    const background = backgroundFor(vectorFile(partner), logoColour, backgroundChoice)
    return { svg: addBackground(svg, background.hex), background }
  }

  const colourName = logoColour === 'original' ? 'original colours' : getBrandColour(logoColour).name

  const copy = async (partner: Partner) => {
    const { svg } = finalSvg(partner)
    if (!svg) return
    try {
      await copySvg(svg)
      notify(
        `Copied ${partner.name}`,
        'Paste into Figma with Cmd+V (Ctrl+V on Windows). It arrives as editable vectors.',
      )
    } catch (caught) {
      notify('Could not copy', caught instanceof Error ? caught.message : 'Download the SVG instead.')
    }
  }

  const download = async (partner: Partner, format: 'svg' | 'png') => {
    const { svg, background } = finalSvg(partner)
    if (!svg) return
    const name = `${fileStem(partner, logoColour, background)}.${format}`
    try {
      if (format === 'svg') {
        downloadBlob(svgBlob(svg), name)
      } else {
        const root = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement
        const ratio = Number(root.getAttribute('height')) / Number(root.getAttribute('width'))
        const canvas = await svgToCanvas(svg, PNG_WIDTH, Math.max(1, Math.round(PNG_WIDTH * ratio)))
        downloadBlob(await canvasToBlob(canvas, 'png'), name)
      }
    } catch (caught) {
      notify('Download failed', caught instanceof Error ? caught.message : 'Try again.')
    }
  }

  const matches = (partner: Partner) => partner.name.toLowerCase().includes(query.trim().toLowerCase())
  const shown = vectorPartners.filter(matches)
  const colourOptions = brandColours.map((c) => ({ value: c.id, label: c.name }))

  return (
    <div style={{ display: 'grid', gap: 'var(--cui-space-40)' }}>
      <section aria-labelledby="vector-partners" style={{ display: 'grid', gap: 'var(--cui-space-24)' }}>
        <h2 id="vector-partners" className={styles.name}>
          Vector logos <Badge>{vectorPartners.length}</Badge>
        </h2>
        <div className={styles.filters}>
          <Input
            label="Search partners"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            label="Logo colour"
            value={logoColour}
            options={[{ value: 'original', label: 'Original colours' }, ...colourOptions]}
            onChange={(event) => setLogoColour(event.target.value as LogoColour)}
          />
          <Switch
            label="Background"
            checked={withBackground}
            onChange={(event) => setWithBackground(event.target.checked)}
          />
          {withBackground ? (
            <Select
              label="Background colour"
              value={backgroundChoice}
              options={[{ value: 'auto', label: 'Automatic contrast' }, ...colourOptions]}
              onChange={(event) => setBackgroundChoice(event.target.value as BackgroundChoice)}
            />
          ) : null}
        </div>
        <p className={styles.prose} role="status">
          Showing {shown.length} in {colourName}
          {withBackground ? ' with a background' : ', transparent'}. Copies and downloads are cropped to the logo. PNGs
          are {PNG_WIDTH}px wide.
        </p>
        {loadError ? (
          <EmptyState heading="Partner logos could not load" description={loadError} />
        ) : shown.length === 0 ? (
          <EmptyState heading="No partners match" description="Try another name." live />
        ) : (
          <div className={styles.cardGrid}>
            {shown.map((partner) => {
              const file = vectorFile(partner)
              const { svg, background } = finalSvg(partner)
              const previewBackground = background ?? backgroundFor(file, logoColour, 'auto')
              const checker = isLightHex(previewBackground.hex) ? styles.checkerboard : styles.checkerboardDark
              return (
                <article key={partner.id} className={styles.assetCard}>
                  <div
                    className={`${styles.preview} ${styles.logoPreview} ${background ? '' : checker}`}
                    style={background ? { background: background.hex } : undefined}
                  >
                    {svg ? (
                      // eslint-disable-next-line @next/next/no-img-element -- generated SVG, shown as an image so its ids cannot clash
                      <img src={dataUrl(svg)} alt={`${partner.name} logo in ${colourName}`} />
                    ) : (
                      <Skeleton label={`Loading the ${partner.name} logo`} lines={1} />
                    )}
                  </div>
                  <div className={styles.cardText}>
                    <strong>{partner.name}</strong>
                    <span>Supplied in {file.note.toLowerCase()}</span>
                  </div>
                  <div className={styles.actions}>
                    <Button
                      size="sm"
                      leadingIcon={<Icon name="copy" />}
                      disabled={!svg}
                      aria-label={`Copy ${partner.name} logo as SVG`}
                      onClick={() => copy(partner)}
                    >
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      leadingIcon={<Icon name="download" />}
                      disabled={!svg}
                      aria-label={`Download ${partner.name} logo as SVG`}
                      onClick={() => download(partner, 'svg')}
                    >
                      SVG
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      leadingIcon={<Icon name="download" />}
                      disabled={!svg}
                      aria-label={`Download ${partner.name} logo as PNG`}
                      onClick={() => download(partner, 'png')}
                    >
                      PNG
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="partner-todo" style={{ display: 'grid', gap: 'var(--cui-space-16)' }}>
        <h2 id="partner-todo" className={styles.name}>
          Vector logos to request <Badge tone="warning">{todoPartners.length}</Badge>
        </h2>
        <p className={styles.prose}>
          We only have image files for these partners, so they can&apos;t be recoloured, copied or downloaded here. Ask
          each partner for an SVG, EPS or PDF logo, then add it to <code>assets/source/CD_Partner_Logos</code> and{' '}
          <code>src/brand/partners.json</code>.
        </p>
        <ContentList aria-labelledby="partner-todo">
          {todoPartners.map((partner) => (
            <ContentListItem
              key={partner.id}
              leading={
                <span
                  className={`${styles.thumb} ${partner.files[0].note.startsWith('White') ? styles.checkerboardDark : styles.checkerboard}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- original supplied image */}
                  <img src={withBase(partner.files[0].href)} alt="" loading="lazy" />
                </span>
              }
              title={partner.name}
              description={`We have: ${partner.files
                .map(
                  (f) =>
                    `${f.format.toUpperCase()}${f.format === 'svg' ? ' wrapping an image' : ''}, ${f.width} × ${f.height}, ${f.note.toLowerCase()}`,
                )
                .join('; ')}`}
              meta="Needs SVG, EPS or PDF"
            />
          ))}
        </ContentList>
      </section>
    </div>
  )
}
