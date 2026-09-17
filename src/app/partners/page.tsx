import { PageHeader, Stack } from '@convert/product-ui'
import type { Metadata } from 'next'
import { PartnerLibrary } from './partner-library'

export const metadata: Metadata = { title: 'Partners' }

export default function PartnersPage() {
  return (
    <Stack gap={32}>
      <PageHeader
        heading="Partners"
        description="Partner logos for decks, case studies and co-marketing. Vector logos can be switched to white, black or a brand colour, copied into Figma or downloaded."
      />
      <PartnerLibrary />
    </Stack>
  )
}
