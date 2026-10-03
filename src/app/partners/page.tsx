import { PageLayout } from '@convert/product-ui'
import type { Metadata } from 'next'
import { PartnerLibraryFromUrl } from './from-url'
import { partnersIntro } from './intro'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Partners' }

export default function PartnersPage() {
  return (
    <Suspense
      fallback={
        <PageLayout headingOwner="page" {...partnersIntro}>
          <p role="status">Loading partners…</p>
        </PageLayout>
      }
    >
      <PartnerLibraryFromUrl />
    </Suspense>
  )
}
