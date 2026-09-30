import { logoAssets } from '@/brand/assets.generated'
import { brandColours } from '@/brand/colours'
import { partners } from '@/brand/partners.generated'
import { stacks } from '@/brand/stacks.generated'

export interface BrandSearchEntry {
  id: string
  label: string
  group: string
  keywords: string
  href: string
}

// Build this on the server: only searchable metadata reaches the shell, not artwork geometry.
export const brandSearchEntries: readonly BrandSearchEntry[] = [
  ...[
    ['overview', 'Overview', '/', 'brand kit brand guide home'],
    ['colours', 'Colours', '/colours/', 'colors palette hex rgb pantone'],
    ['typography', 'Typography', '/typography/', 'fonts roobert denton geist serif'],
    ['logos', 'Logos', '/logos/', 'logo icon assets downloads'],
    ['stacks', 'Stacks', '/stacks/', 'stack motifs artwork assets'],
    ['stack-creator', 'Stack creator', '/create/stack/', 'stack builder composition create export'],
    ['gradient-generator', 'Gradient generator', '/create/gradient/', 'gradient builder glow grain mesh create'],
    ['partners', 'Partners', '/partners/', 'partner logos integrations'],
  ].map(([id, label, href, keywords]) => ({ id: `page-${id}`, label, href, keywords, group: 'Pages and tools' })),
  ...partners.map((partner) => ({
    id: `partner-${partner.id}`,
    label: partner.name,
    group: 'Partners',
    keywords: `partner logo ${(partner.categories ?? []).join(' ')} ${partner.website ?? ''}`,
    href: `/partners/?${new URLSearchParams({ q: partner.name })}`,
  })),
  ...logoAssets.map((asset) => ({
    id: `logo-${asset.id}`,
    label: `${asset.label} · ${asset.colour ?? 'Original'} · ${asset.format.toUpperCase()}`,
    group: 'Logo assets',
    keywords: `${asset.family} ${asset.source.split('/').pop()} ${asset.clearSpace ? 'clear space' : 'no clear space'}`,
    href: `/logos/?${new URLSearchParams({ asset: asset.id })}#${asset.id}`,
  })),
  ...stacks.map((stack) => ({
    id: `artwork-${stack.id}`,
    label: stack.label,
    group: 'Stack assets',
    keywords: `stack artwork motif ${stack.file}`,
    href: `/stacks/#${stack.id}`,
  })),
  ...brandColours.map((colour) => ({
    id: `colour-${colour.id}`,
    label: colour.name,
    group: 'Brand colours',
    keywords: `colour color ${colour.hex} ${colour.rgb.join(', ')} ${colour.pantoneCoated ?? ''}`,
    href: `/colours/#${colour.id}`,
  })),
]
