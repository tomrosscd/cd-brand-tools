'use client'

import { CommandPalette, Icon, WorkspaceShell, type SidebarEntry } from '@convert/product-ui'
import { usePathname, useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import type { BrandSearchEntry } from '@/lib/brand-search'
import { basePath, withBase } from '@/lib/base-path'

const link = (id: string, label: string, path: string) => ({ id, label, href: withBase(path) })

const items: readonly SidebarEntry[] = [
  { ...link('overview', 'Overview', '/'), icon: <Icon name="overview" /> },
  {
    id: 'guide',
    label: 'Brand guide',
    icon: <Icon name="visibility" />,
    defaultOpen: true,
    items: [
      link('colours', 'Colours', '/colours/'),
      link('typography', 'Typography', '/typography/'),
      link('logos', 'Logos', '/logos/'),
      link('stacks', 'Stacks', '/stacks/'),
    ],
  },
  {
    id: 'create',
    label: 'Create',
    icon: <Icon name="edit" />,
    defaultOpen: true,
    items: [
      link('stack-creator', 'Stack creator', '/create/stack/'),
      link('gradient-generator', 'Gradient generator', '/create/gradient/'),
    ],
  },
  { ...link('partners', 'Partners', '/partners/'), icon: <Icon name="team" /> },
]

// The Convert icon, contained by the shell at 24px.
const productMark = (
  // eslint-disable-next-line @next/next/no-img-element -- a small published brand file, shown unaltered
  <img src={withBase('/brand/logos/icon-svg-convert-icon-dark-green.svg')} alt="" />
)

const routes: Record<string, string> = {
  '/colours': 'colours',
  '/typography': 'typography',
  '/logos': 'logos',
  '/stacks': 'stacks',
  '/create/stack': 'stack-creator',
  '/create/gradient': 'gradient-generator',
  '/partners': 'partners',
}

export function AppShell({
  children,
  searchEntries,
}: {
  children: ReactNode
  searchEntries: readonly BrandSearchEntry[]
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  return (
    <>
      <WorkspaceShell
        items={items}
        activeId={routes[pathname.replace(/\/$/, '')] ?? 'overview'}
        productName="Brand Tools"
        productMark={productMark}
        onSearch={() => setSearchOpen(true)}
        collapsible
        onNavigate={(item, event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
          event.preventDefault()
          router.push(item.href.slice(basePath.length) || '/')
        }}
      >
        {children}
      </WorkspaceShell>
      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        label="Search the brand kit"
        placeholder="Search pages, partners and assets…"
        emptyLabel="No matching pages, partners or assets"
        groupOrder={['Pages and tools', 'Partners', 'Logo assets', 'Stack assets', 'Brand colours']}
        items={searchEntries.map((entry) => ({
          ...entry,
          onSelect: () => router.push(entry.href),
        }))}
      />
    </>
  )
}
