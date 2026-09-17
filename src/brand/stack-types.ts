export interface StackArtwork {
  id: string
  label: string
  file: string
  width: number
  height: number
  /** Tight bounding box of the artwork inside the source viewBox. */
  bounds: { x: number; y: number; width: number; height: number }
  /** Source path data, in source order. Never reshape or reposition these individually. */
  paths: readonly string[]
}
