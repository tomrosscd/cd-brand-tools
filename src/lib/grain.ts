import type { FrameSize } from './frame'

/** Texture grid tied to the artwork proportions, independent of export pixel resolution. */
export function grainGrid(frame: FrameSize, size: number): readonly [number, number] {
  if (size <= 0) return [0, 0]
  const shortSide = Math.min(frame.width, frame.height)
  const cells = 1000 / size
  return [(frame.width / shortSide) * cells, (frame.height / shortSide) * cells]
}
