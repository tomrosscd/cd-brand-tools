'use client'

import { DashboardShell, Icon, type SidebarEntry } from '@convert/product-ui'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

const items: readonly SidebarEntry[] = [
  { id: 'overview', label: 'Overview', href: '/', icon: <Icon name="overview" /> },
  {
    id: 'guide',
    label: 'Brand guide',
    icon: <Icon name="visibility" />,
    defaultOpen: true,
    items: [
      { id: 'colours', label: 'Colours', href: '/colours' },
      { id: 'typography', label: 'Typography', href: '/typography' },
      { id: 'logos', label: 'Logos', href: '/logos' },
      { id: 'stacks', label: 'Stacks', href: '/stacks' },
    ],
  },
  {
    id: 'create',
    label: 'Create',
    icon: <Icon name="edit" />,
    defaultOpen: true,
    items: [
      { id: 'stack-creator', label: 'Stack creator', href: '/create/stack' },
      { id: 'gradient-generator', label: 'Gradient generator', href: '/create/gradient' },
    ],
  },
]

const routes: Record<string, string> = {
  '/colours': 'colours',
  '/typography': 'typography',
  '/logos': 'logos',
  '/stacks': 'stacks',
  '/create/stack': 'stack-creator',
  '/create/gradient': 'gradient-generator',
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  return (
    <DashboardShell
      items={items}
      activeId={routes[pathname] ?? 'overview'}
      workspace="Brand Tools"
      workspaceDescription="Internal"
      density="comfortable"
      collapsible
      onNavigate={(item, event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        event.preventDefault()
        router.push(item.href)
      }}
    >
      {children}
    </DashboardShell>
  )
}
