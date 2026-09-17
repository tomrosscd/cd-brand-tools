'use client'

import { parseGradient } from '@/lib/gradient'
import { useSearchParams } from 'next/navigation'
import { GradientGenerator } from './gradient-generator'

/** Reads the starting state from the link in the browser, so the page works as a static file. */
export function GradientGeneratorFromUrl() {
  const params = useSearchParams()
  return <GradientGenerator initialState={parseGradient(new URLSearchParams(params.toString()))} />
}
