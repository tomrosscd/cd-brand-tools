import type { NextConfig } from 'next'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined

const nextConfig: NextConfig = {
  // A fully static site, so it can be hosted on GitHub Pages. Server features (sign-in, gated downloads)
  // arrive in phase 2 and will need a different host.
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
