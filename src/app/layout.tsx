import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@convert/product-ui/styles.css'
import './globals.css'
import { AppShell } from '@/components/app-shell'
import { withBase } from '@/lib/base-path'
import { ToastProvider } from '@/components/toast-provider'

export const metadata: Metadata = {
  title: { default: 'Convert Brand Tools', template: '%s · Convert Brand Tools' },
  description: 'Convert brand guide, approved assets, stack creator and gradient generator.',
  icons: { icon: withBase('/brand/logos/icon-svg-convert-icon-dark-green.svg') },
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Browser extensions such as Tag Assistant add attributes to <html> before React loads.
    <html lang="en-AU" suppressHydrationWarning>
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  )
}
