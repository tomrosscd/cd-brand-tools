import type { Metadata } from 'next'
import { parseGradient } from '@/lib/gradient'
import { GradientGenerator } from './gradient-generator'

export const metadata: Metadata = { title: 'Gradient generator' }

export default async function GradientPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') params.set(key, value)
  }
  return <GradientGenerator initialState={parseGradient(params)} />
}
