export interface PartnerImage {
  /** A raster file that can be downloaded as it is. For an SVG wrapping a PNG, the extracted PNG. */
  href: string
  format: 'png' | 'jpg'
  width: number
  height: number
  bytes: number
}

export interface PartnerFile {
  file: string
  href: string
  format: 'svg' | 'png' | 'jpg'
  /** True only for SVGs made of shapes. An SVG that wraps a PNG is not vector. */
  vector: boolean
  note: string
  /** Set when the file is not vector. */
  image: PartnerImage | null
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
  /** A former or related name, such as a rebrand. */
  aka?: string
  categories: readonly string[]
  website?: string
  /** Whether the partner is shown on the Convert website's partner listing. */
  listing: 'listed' | 'unlisted'
  /** Empty when no logo has been supplied yet. */
  files: readonly PartnerFile[]
  /** The vector file to recolour, copy and download, or null when the partner still needs one. */
  vector: string | null
}
