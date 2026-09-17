import { PageHeader, Stack } from '@convert/product-ui'
import type { Metadata } from 'next'
import { LogoLibrary } from './logo-library'

export const metadata: Metadata = { title: 'Logos' }

export default function LogosPage() {
  return (
    <Stack gap={32}>
      <PageHeader
        heading="Logos"
        description="Approved originals from the 2024 logo set. Clear space versions include the required margin, so you can place them without measuring."
      />
      <LogoLibrary />
    </Stack>
  )
}
