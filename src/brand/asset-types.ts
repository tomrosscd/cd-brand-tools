export type AssetFormat = 'svg' | 'png' | 'jpg'

export type SvgShape =
  | { tag: 'path'; d: string }
  | { tag: 'polygon'; points: string }
  | { tag: 'rect'; x: string; y: string; width: string; height: string }

export interface SvgGeometry {
  viewBox: string
  /** The single fill colour of the official file. */
  fill: string
  shapes: readonly SvgShape[]
}

export interface BrandAsset {
  id: string
  family: 'Logo' | 'Straight' | 'Icon' | 'Profile icon'
  label: string
  colour: 'Dark Green' | 'Light Green' | 'White' | 'Black' | null
  format: AssetFormat
  clearSpace: boolean
  /** Path inside the supplied archive, for provenance. */
  source: string
  href: string
  bytes: number
  sha256: string
  geometry?: SvgGeometry
}
