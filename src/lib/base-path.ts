/** Set when the site is served from a sub-path, such as GitHub Pages at /cd-brand-tools. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Prefixes a root-relative path for plain links and files. next/link and the router add it themselves. */
export function withBase(path: string): string {
  return `${basePath}${path}`
}
