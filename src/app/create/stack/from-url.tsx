'use client'

import { parseComposition } from '@/lib/stack-composition'
import { useSearchParams } from 'next/navigation'
import { StackCreator } from './stack-creator'

/** Reads the starting state from the link in the browser, so the page works as a static file. */
export function StackCreatorFromUrl() {
  const params = useSearchParams()
  return <StackCreator initialState={parseComposition(new URLSearchParams(params.toString()))} />
}
