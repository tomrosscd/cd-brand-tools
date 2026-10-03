import { PageLayout } from '@convert/product-ui'
import type { Metadata } from 'next'
import { LogoLibraryFromUrl } from './from-url'
import { logosIntro } from './intro'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Logos' }

export default function LogosPage() {
  return (
    <Suspense
      fallback={
        <PageLayout headingOwner="page" {...logosIntro}>
          <p role="status">Loading logos…</p>
        </PageLayout>
      }
    >
      <LogoLibraryFromUrl />
    </Suspense>
  )
}
