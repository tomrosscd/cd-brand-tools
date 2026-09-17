import { PageHeader, Stack, TextLink } from '@convert/product-ui'
import type { Metadata } from 'next'
import { withBase } from '@/lib/base-path'
import { StackLibrary } from './stack-library'

export const metadata: Metadata = { title: 'Stacks' }

export default function StacksPage() {
  return (
    <Stack gap={32}>
      <PageHeader
        heading="Stacks"
        description="The stack motifs, in any brand colour. Use a stack whole: don't move, reshape or recolour its bars separately."
        actions={
          <TextLink href={withBase('/create/stack/')} variant="standalone">
            Open the stack creator
          </TextLink>
        }
      />
      <StackLibrary />
    </Stack>
  )
}
