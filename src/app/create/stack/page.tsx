import type { Metadata } from 'next'
import { parseComposition } from '@/lib/stack-composition'
import { StackCreator } from './stack-creator'

export const metadata: Metadata = { title: 'Stack creator' }

export default async function StackCreatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') params.set(key, value)
  }
  return <StackCreator initialState={parseComposition(params)} />
}
