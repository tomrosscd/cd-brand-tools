'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { LogoLibrary } from './logo-library'

export function LogoLibraryFromUrl() {
  const params = useSearchParams()
  const selection = params.get('asset') ?? ''
  useEffect(() => {
    if (selection) document.getElementById(selection)?.scrollIntoView({ block: 'start' })
  }, [selection])
  return <LogoLibrary key={selection} initialAssetId={selection} />
}
