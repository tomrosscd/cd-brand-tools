// The Convert brand palette: the single source for every tool in this repository.
// HEX and RGB come from the text table in the Confluence Brand Assets PDF (8 September 2026).
// CMYK and Pantone were transcribed from that PDF's embedded palette image at page resolution.
// They are marked unverified until checked against the original brand book at full resolution.
// These are brand values, not Product UI semantic tokens. Do not use them to style the interface.

export type BrandColourId = 'dark-green' | 'light-green' | 'forest-green' | 'white' | 'black' | 'yellow' | 'orange'

export interface BrandColour {
  id: BrandColourId
  name: string
  hex: string
  rgb: readonly [number, number, number]
  cmyk: readonly [number, number, number, number]
  pantoneCoated?: string
  pantoneUncoated?: string
  /** False until print values are checked against the original brand book. */
  printVerified: boolean
  /** A primary brand colour, rather than a sparing accent. */
  role: 'primary' | 'neutral' | 'accent'
}

export const brandColours: readonly BrandColour[] = [
  {
    id: 'dark-green',
    name: 'Dark Green',
    hex: '#27382f',
    rgb: [39, 56, 47],
    cmyk: [78, 52, 67, 64],
    pantoneCoated: '560',
    pantoneUncoated: '567',
    printVerified: false,
    role: 'primary',
  },
  {
    id: 'light-green',
    name: 'Light Green',
    hex: '#c9deb6',
    rgb: [201, 222, 182],
    cmyk: [27, 2, 36, 0],
    pantoneCoated: '2260',
    pantoneUncoated: '2260',
    printVerified: false,
    role: 'primary',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    hex: '#499e6b',
    rgb: [73, 158, 107],
    cmyk: [73, 15, 70, 1],
    pantoneCoated: '2416',
    pantoneUncoated: '5416',
    printVerified: false,
    role: 'primary',
  },
  {
    id: 'white',
    name: 'White',
    hex: '#faf9f7',
    rgb: [250, 249, 247],
    cmyk: [2, 2, 3, 0],
    printVerified: false,
    role: 'neutral',
  },
  // The palette image labels this swatch's HEX as ffa366 (Orange's value): a copy error in the source.
  {
    id: 'black',
    name: 'Black',
    hex: '#171717',
    rgb: [23, 23, 23],
    cmyk: [77, 68, 61, 85],
    printVerified: false,
    role: 'neutral',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    hex: '#ffec82',
    rgb: [255, 236, 130],
    cmyk: [2, 3, 60, 0],
    printVerified: false,
    role: 'accent',
  },
  {
    id: 'orange',
    name: 'Orange',
    hex: '#ffa366',
    rgb: [255, 163, 102],
    cmyk: [0, 46, 62, 0],
    printVerified: false,
    role: 'accent',
  },
]

export function getBrandColour(id: BrandColourId): BrandColour {
  const colour = brandColours.find((c) => c.id === id)
  if (!colour) throw new Error(`Unknown brand colour: ${id}`)
  return colour
}

export function isBrandColourId(value: string): value is BrandColourId {
  return brandColours.some((c) => c.id === value)
}
