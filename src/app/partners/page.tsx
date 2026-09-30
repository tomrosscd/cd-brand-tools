import { PageHeader, Stack } from '@convert/product-ui'
import type { Metadata } from 'next'
import { PartnerLibraryFromUrl } from './from-url'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Partners' }

export default function PartnersPage() {
  return (
    <Stack gap={32}>
      <PageHeader
        heading="Partners"
        description="Every Convert partner. Vector logos can be shown in their own colours, white or black, copied into Figma or downloaded. Where we only have an image, you can still download it, and the partner is on the to-do list."
      />
      <Suspense fallback={<p>Loading partners…</p>}>
        <PartnerLibraryFromUrl />
      </Suspense>
    </Stack>
  )
}
