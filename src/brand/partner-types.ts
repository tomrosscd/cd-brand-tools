export interface PartnerFile {
  file: string
  href: string
  format: 'svg' | 'png' | 'jpg'
  /** True only for SVGs made of shapes. An SVG that wraps a PNG is not vector. */
  vector: boolean
  note: string
  /** Which background shows the original colours clearly. */
  originalOn: 'light' | 'dark'
  width: number
  height: number
  bytes: number
  sha256: string
}

export interface Partner {
  id: string
  name: string
  files: readonly PartnerFile[]
  /** The vector file to recolour, copy and download, or null when the partner still needs one. */
  vector: string | null
}
