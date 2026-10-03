import type { Metadata } from 'next'
import { StackLibrary } from './stack-library'

export const metadata: Metadata = { title: 'Stacks' }

export default function StacksPage() {
  return <StackLibrary />
}
