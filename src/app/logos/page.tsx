import { PageHeader, Stack } from '@convert/product-ui'
import type { Metadata } from 'next'
import { LogoLibraryFromUrl } from './from-url'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Logos' }

export default function LogosPage() {
  return (
    <Stack gap={32}>
      <PageHeader
        heading="Logos"
        description="Approved originals from the 2024 logo set. Clear space versions include the required margin, so you can place them without measuring."
      />
      <Suspense fallback={<p>Loading logos…</p>}>
        <LogoLibraryFromUrl />
      </Suspense>
    </Stack>
  )
}
