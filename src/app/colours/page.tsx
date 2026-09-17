import { Alert, Badge, Grid, PageHeader, Stack } from '@convert/product-ui'
import type { Metadata } from 'next'
import { brandColours } from '@/brand/colours'
import { CopyButton } from '@/components/copy-button'
import styles from '@/components/guide.module.css'

export const metadata: Metadata = { title: 'Colours' }

const roles = { primary: 'Primary', neutral: 'Neutral', accent: 'Accent, use sparingly' } as const

export default function ColoursPage() {
  return (
    <Stack gap={32}>
      <PageHeader
        heading="Colours"
        description="Dark Green, Light Green and Forest Green lead. White and Black support. Yellow and Orange are accents."
      />
      <Alert heading="Print values need checking" tone="warning">
        CMYK and Pantone values were read from the brand assets page and have not yet been checked against the original
        brand book. Confirm them with the design team before sending anything to print.
      </Alert>
      <Grid columns={3} minItemWidth={240}>
        {brandColours.map((colour) => (
          <article key={colour.id} className={styles.swatchCard}>
            <div className={styles.swatch} style={{ background: colour.hex }} />
            <div className={styles.swatchBody}>
              <h2 className={styles.name}>{colour.name}</h2>
              <div>
                <Badge tone={colour.role === 'accent' ? 'warning' : 'neutral'}>{roles[colour.role]}</Badge>
              </div>
              <dl className={styles.values}>
                <dt>HEX</dt>
                <dd>
                  <CopyButton value={colour.hex} label={`${colour.name} HEX`} />
                </dd>
                <dt>RGB</dt>
                <dd>
                  <CopyButton value={colour.rgb.join(', ')} label={`${colour.name} RGB`} />
                </dd>
                <dt>CMYK</dt>
                <dd>
                  <CopyButton value={colour.cmyk.join(', ')} label={`${colour.name} CMYK`} />
                </dd>
                {colour.pantoneCoated ? (
                  <>
                    <dt>Pantone C</dt>
                    <dd>
                      <CopyButton value={`${colour.pantoneCoated} C`} label={`${colour.name} Pantone coated`} />
                    </dd>
                    <dt>Pantone U</dt>
                    <dd>
                      <CopyButton value={`${colour.pantoneUncoated} U`} label={`${colour.name} Pantone uncoated`} />
                    </dd>
                  </>
                ) : null}
              </dl>
            </div>
          </article>
        ))}
      </Grid>
    </Stack>
  )
}
