export interface StackArtwork {
  id: string
  label: string
  file: string
  width: number
  height: number
  /** Source path data, in source order. Never reshape or reposition these individually. */
  paths: readonly string[]
}
