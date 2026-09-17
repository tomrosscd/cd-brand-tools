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
  TextLink,
} from '@convert/product-ui'
import type { Partner, PartnerFile } from '@/brand/partner-types'
import { partners } from '@/brand/partners.generated'
import styles from '@/components/guide.module.css'
import { useToast } from '@/components/toast-provider'
import { withBase } from '@/lib/base-path'
import { copySvg } from '@/lib/clipboard'
import { canvasToBlob, downloadBlob, formatBytes, svgBlob, svgToCanvas } from '@/lib/export'
import { addBackground, recolourSvg, trimSvg } from '@/lib/partner-svg'
import { useEffect, useMemo, useState } from 'react'

/**
 * Partner logos are never shown in Convert brand colours: only their own colours, white or black.
 * Pure white and near-black keep them neutral on any Convert artwork they are placed on.
 */
const neutrals = {
  white: { name: 'White', hex: '#ffffff' },
  black: { name: 'Black', hex: '#000000' },
} as const
type Neutral = keyof typeof neutrals
type LogoColour = Neutral | 'original'
type BackgroundChoice = Neutral | 'auto'

const PNG_WIDTH = 2000
const vectorPartners = partners.filter((p) => p.vector)
const imageOnly = partners.filter((p) => !p.vector && p.files.length > 0)
const noLogo = partners.filter((p) => p.files.length === 0)

const vectorFile = (partner: Partner) => partner.files.find((f) => f.file === partner.vector)!
const imageFile = (partner: Partner) => partner.files.find((f) => f.image)!
const isLightNote = (file: PartnerFile) => /^white/i.test(file.note)

/** The chosen background, or the one that contrasts with the logo when automatic or when it would match. */
function backgroundFor(file: PartnerFile, logo: LogoColour, choice: BackgroundChoice): Neutral {
  const logoIsLight = logo === 'original' ? file.originalOn === 'dark' : logo === 'white'
  const automatic: Neutral = logoIsLight ? 'black' : 'white'
  return choice === 'auto' || choice === logo ? automatic : choice
}

const dataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

function PartnerTags({ partner }: { partner: Partner }) {
  return (
    <span className={styles.tags}>
      {partner.categories.join(', ') || 'No category yet'}
      {partner.listing === 'unlisted' ? <Badge>Unlisted on website</Badge> : null}
    </span>
  )
}

function WebsiteLink({ partner }: { partner: Partner }) {
  return partner.website ? (
    <TextLink href={partner.website} external>
      Website
    </TextLink>
  ) : null
}

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
    const colour = logoColour === 'original' ? null : neutrals[logoColour].hex
    return Object.fromEntries(
      Object.entries(sources).map(([id, svg]) => [id, trimSvg(recolourSvg(svg, colour))]),
    ) as Record<string, string>
  }, [sources, logoColour])

  const finalSvg = (partner: Partner) => {
    const svg = artwork[partner.id]
    if (!svg || !withBackground) return { svg, background: undefined }
    const background = backgroundFor(vectorFile(partner), logoColour, backgroundChoice)
    return { svg: addBackground(svg, neutrals[background].hex), background }
  }

  const colourName = logoColour === 'original' ? 'their own brand colours' : neutrals[logoColour].name.toLowerCase()

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

  const downloadVector = async (partner: Partner, format: 'svg' | 'png') => {
    const { svg, background } = finalSvg(partner)
    if (!svg) return
    const name = `${partner.id}-logo-${logoColour}${background ? `-on-${background}` : ''}.${format}`
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

  const downloadImage = (partner: Partner) => {
    const image = imageFile(partner).image!
    const link = document.createElement('a')
    link.href = withBase(image.href)
    link.download = `${partner.id}-logo.${image.format}`
    link.click()
  }

  const needle = query.trim().toLowerCase()
  const matches = (partner: Partner) =>
    !needle ||
    partner.name.toLowerCase().includes(needle) ||
    partner.categories.some((category) => category.toLowerCase().includes(needle))
  const ready = vectorPartners.filter(matches)
  const imageOnlyShown = imageOnly.filter(matches)
  const noLogoShown = noLogo.filter(matches)

  return (
    <div style={{ display: 'grid', gap: 'var(--cui-space-40)' }}>
      <div className={styles.filters}>
        <Input
          label="Search partners or categories"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <section aria-labelledby="partner-ready" style={{ display: 'grid', gap: 'var(--cui-space-24)' }}>
        <div>
          <h2 id="partner-ready" className={styles.name}>
            Ready to use <Badge tone="positive">{vectorPartners.length}</Badge>
          </h2>
          <p className={styles.prose}>
            Vector logos in every format. Show them in their own colours, white or black, add a background, copy into
            Figma, or download SVG or {PNG_WIDTH}px PNG. Copies and downloads are cropped to the logo.
          </p>
        </div>
        <div className={styles.filters}>
          <Select
            label="Logo colour"
            value={logoColour}
            options={[
              { value: 'original', label: 'Original brand colours' },
              { value: 'white', label: 'White' },
              { value: 'black', label: 'Black' },
            ]}
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
              options={[
                { value: 'auto', label: 'Automatic contrast' },
                { value: 'white', label: 'White' },
                { value: 'black', label: 'Black' },
              ]}
              onChange={(event) => setBackgroundChoice(event.target.value as BackgroundChoice)}
            />
          ) : null}
        </div>
        <p className={styles.prose} role="status">
          Showing {ready.length} in {colourName}
          {withBackground ? ' with a background' : ', transparent'}.
        </p>
        {loadError ? (
          <EmptyState heading="Partner logos could not load" description={loadError} />
        ) : ready.length === 0 ? (
          <EmptyState heading="No ready logos match" description="Try another name or category." live />
        ) : (
          <div className={styles.cardGrid}>
            {ready.map((partner) => {
              const file = vectorFile(partner)
              const { svg, background } = finalSvg(partner)
              const previewOn = background ?? backgroundFor(file, logoColour, 'auto')
              return (
                <article key={partner.id} className={styles.assetCard}>
                  <div
                    className={`${styles.preview} ${styles.logoPreview} ${background ? '' : previewOn === 'white' ? styles.checkerboard : styles.checkerboardBlack}`}
                    style={background ? { background: neutrals[background].hex } : undefined}
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
                    <PartnerTags partner={partner} />
                    <span>{partner.aka ?? `Supplied in ${file.note.toLowerCase()}`}</span>
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
                      onClick={() => downloadVector(partner, 'svg')}
                    >
                      SVG
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      leadingIcon={<Icon name="download" />}
                      disabled={!svg}
                      aria-label={`Download ${partner.name} logo as PNG`}
                      onClick={() => downloadVector(partner, 'png')}
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
        <div>
          <h2 id="partner-todo" className={styles.name}>
            To do: logos to request <Badge tone="warning">{imageOnly.length + noLogo.length}</Badge>
          </h2>
          <p className={styles.prose}>
            Ask each partner for an SVG, EPS or PDF logo. Add it to <code>assets/source/CD_Partner_Logos</code> and{' '}
            <code>src/brand/partners.json</code>, and the partner moves up to Ready to use.
          </p>
        </div>

        <h3 id="todo-image-only" className={styles.subheading}>
          Have an image, need a vector <Badge>{imageOnlyShown.length}</Badge>
        </h3>
        <p className={styles.prose}>
          Download the image we have in the meantime. It can&apos;t be recoloured or copied into Figma as vectors.
        </p>
        <ContentList aria-labelledby="todo-image-only" density="compact">
          {imageOnlyShown.map((partner) => {
            const file = imageFile(partner)
            const image = file.image!
            const noteId = `${partner.id}-availability`
            return (
              <ContentListItem
                key={partner.id}
                leading={
                  <span
                    className={`${styles.thumb} ${isLightNote(file) ? styles.checkerboardBlack : styles.checkerboard}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- supplied image */}
                    <img src={withBase(image.href)} alt="" loading="lazy" />
                  </span>
                }
                title={partner.name}
                description={
                  <span className={styles.tags}>
                    <PartnerTags partner={partner} />
                    <span id={noteId}>
                      {image.format.toUpperCase()} only, {image.width} × {image.height}, {formatBytes(image.bytes)}. No
                      vector yet.
                    </span>
                    <WebsiteLink partner={partner} />
                  </span>
                }
                actions={
                  <span className={styles.actions}>
                    <Button size="sm" leadingIcon={<Icon name="copy" />} disabled aria-describedby={noteId}>
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      leadingIcon={<Icon name="download" />}
                      disabled
                      aria-describedby={noteId}
                    >
                      SVG
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      leadingIcon={<Icon name="download" />}
                      aria-label={`Download ${partner.name} logo as supplied, ${image.format.toUpperCase()}`}
                      onClick={() => downloadImage(partner)}
                    >
                      {image.format.toUpperCase()}
                    </Button>
                  </span>
                }
              />
            )
          })}
        </ContentList>

        <h3 id="todo-no-logo" className={styles.subheading}>
          No logo yet <Badge>{noLogoShown.length}</Badge>
        </h3>
        <ContentList aria-labelledby="todo-no-logo" density="compact">
          {noLogoShown.map((partner) => (
            <ContentListItem
              key={partner.id}
              title={partner.name}
              description={<PartnerTags partner={partner} />}
              actions={<WebsiteLink partner={partner} />}
            />
          ))}
        </ContentList>
      </section>
    </div>
  )
}
