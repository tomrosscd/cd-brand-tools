import { ActionCard, Grid, PageHeader, Stack, TextLink } from '@convert/product-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { withBase } from '@/lib/base-path'

export const metadata: Metadata = { title: { absolute: 'Convert Brand Tools' } }

const sections = [
  {
    heading: 'Colours',
    description: 'The brand palette with HEX, RGB, CMYK and Pantone values to copy.',
    href: '/colours/',
    action: 'View colours',
  },
  {
    heading: 'Typography',
    description: 'Which typefaces to use for brand work and which for product interfaces.',
    href: '/typography/',
    action: 'View typography',
  },
  {
    heading: 'Logos',
    description: 'Every approved logo, straight logo, icon and profile icon, ready to download.',
    href: '/logos/',
    action: 'Browse logos',
  },
  {
    heading: 'Stacks',
    description: 'The 36 stack motifs, in their original form.',
    href: '/stacks/',
    action: 'Browse stacks',
  },
  {
    heading: 'Stack creator',
    description: 'Place a stack in a frame, pick brand colours, add a logo and export SVG, PNG or JPEG.',
    href: '/create/stack/',
    action: 'Create an image',
  },
  {
    heading: 'Gradient generator',
    description: 'Make grainy mesh gradients from brand colours for backgrounds and slides.',
    href: '/create/gradient/',
    action: 'Make a gradient',
  },
]

export default function OverviewPage() {
  return (
    <Stack gap={32}>
      <PageHeader
        heading="Convert Brand Tools"
        description="Everything you need to use the Convert brand: approved colours and assets, and tools that only offer on-brand choices."
      />
      <Grid columns={3} minItemWidth={260} align="stretch">
        {sections.map((section) => (
          <ActionCard
            key={section.href}
            heading={section.heading}
            description={section.description}
            primaryAction={
              <TextLink href={withBase(section.href)} variant="standalone">
                {section.action}
              </TextLink>
            }
          />
        ))}
      </Grid>
      <p style={{ margin: 0, color: 'var(--cui-text-secondary)', fontSize: 'var(--cui-type-compact)' }}>
        Something missing or wrong? Tell the design team. <Link href="/colours">Print values</Link> are awaiting
        verification against the original brand book.
      </p>
    </Stack>
  )
}
