'use client'

import { useSearchParams } from 'next/navigation'
import { PartnerLibrary } from './partner-library'

export function PartnerLibraryFromUrl() {
  const params = useSearchParams()
  const selection = params.get('q') ?? ''
  return <PartnerLibrary key={selection} initialQuery={selection} />
}
