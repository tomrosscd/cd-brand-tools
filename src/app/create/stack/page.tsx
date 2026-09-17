import type { Metadata } from 'next'
import { Suspense } from 'react'
import { StackCreatorFromUrl } from './from-url'

export const metadata: Metadata = { title: 'Stack creator' }

export default function Page() {
  return (
    <Suspense>
      <StackCreatorFromUrl />
    </Suspense>
  )
}
