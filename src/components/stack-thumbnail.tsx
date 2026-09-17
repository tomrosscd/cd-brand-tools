import type { StackArtwork } from '@/brand/stack-types'

export function StackThumbnail({ stack, fill }: { stack: StackArtwork; fill: string }) {
  return (
    <svg viewBox={`0 0 ${stack.width} ${stack.height}`} aria-hidden="true" focusable="false" fill={fill}>
      {stack.paths.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  )
}
