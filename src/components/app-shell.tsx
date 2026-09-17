'use client'

import { DashboardShell, Icon, type SidebarEntry } from '@convert/product-ui'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
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

const routes: Record<string, string> = {
  '/colours': 'colours',
  '/typography': 'typography',
  '/logos': 'logos',
  '/stacks': 'stacks',
  '/create/stack': 'stack-creator',
  '/create/gradient': 'gradient-generator',
  '/partners': 'partners',
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  return (
    <DashboardShell
      items={items}
      activeId={routes[pathname.replace(/\/$/, '')] ?? 'overview'}
      workspace="Brand Tools"
      workspaceDescription="Internal"
      density="comfortable"
      collapsible
      onNavigate={(item, event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        event.preventDefault()
        router.push(item.href.slice(basePath.length) || '/')
      }}
    >
      {children}
    </DashboardShell>
  )
}
