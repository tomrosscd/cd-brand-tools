import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GradientGeneratorFromUrl } from './from-url'

export const metadata: Metadata = { title: 'Gradient generator' }

export default function Page() {
  return (
    <Suspense>
      <GradientGeneratorFromUrl />
    </Suspense>
  )
}
