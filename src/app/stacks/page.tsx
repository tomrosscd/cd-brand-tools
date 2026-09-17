import { Grid, Icon, PageHeader, Stack, TextLink } from '@convert/product-ui'
import type { Metadata } from 'next'
import { getBrandColour } from '@/brand/colours'
import { stacks } from '@/brand/stacks.generated'
import styles from '@/components/guide.module.css'
import { StackThumbnail } from '@/components/stack-thumbnail'

export const metadata: Metadata = { title: 'Stacks' }

export default function StacksPage() {
  return (
    <Stack gap={32}>
      <PageHeader
        heading="Stacks"
        description="The stack motifs, as supplied. Use a stack whole: don't move, reshape or recolour its bars separately."
        actions={
          <TextLink href="/create/stack" variant="standalone">
            Open the stack creator
          </TextLink>
        }
      />
      <Grid columns={4} minItemWidth={180}>
        {stacks.map((stack) => {
          const number = stack.id.replace('stack-', '')
          const file = stack.file.toLowerCase().replace(/_/g, '-')
          return (
            <article key={stack.id} className={styles.assetCard}>
              <div className={styles.preview} style={{ background: getBrandColour('dark-green').hex }}>
                <StackThumbnail stack={stack} fill={getBrandColour('light-green').hex} />
              </div>
              <div className={styles.assetMeta}>
                <strong>{stack.label}</strong>
                <span style={{ display: 'inline-flex', gap: 'var(--cui-space-12)' }}>
                  <TextLink href={`/create/stack?stack=${number}`}>Use</TextLink>
                  <a
                    href={`/brand/stacks/${file}`}
                    download={file}
                    aria-label={`Download ${stack.label} SVG`}
                    style={{
                      display: 'inline-flex',
                      gap: 'var(--cui-space-4)',
                      alignItems: 'center',
                      color: 'var(--cui-text-accent)',
                    }}
                  >
                    <Icon name="download" /> SVG
                  </a>
                </span>
              </div>
            </article>
          )
        })}
      </Grid>
    </Stack>
  )
}
