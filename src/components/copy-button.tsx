'use client'

import { Button, Icon } from '@convert/product-ui'
import { useToast } from './toast-provider'

export function CopyButton({ value, label }: { value: string; label: string }) {
  const notify = useToast()
  return (
    <Button
      variant="quiet"
      size="sm"
      leadingIcon={<Icon name="copy" />}
      aria-label={`Copy ${label}: ${value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          notify('Copied', `${label} ${value}`)
        } catch {
          notify('Could not copy', 'Your browser blocked clipboard access. Select the value and copy it manually.')
        }
      }}
    >
      {value}
    </Button>
  )
}
