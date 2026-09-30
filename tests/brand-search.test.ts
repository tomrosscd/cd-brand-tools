import { describe, expect, it } from 'vitest'
import { brandSearchEntries } from '@/lib/brand-search'
import { logoAssets } from '@/brand/assets.generated'
import { partners } from '@/brand/partners.generated'
import { stacks } from '@/brand/stacks.generated'

const url = (href: string) => new URL(href, 'https://brand.example')

describe('brand kit search destinations', () => {
  it('has unique IDs and only internal destinations', () => {
    expect(new Set(brandSearchEntries.map((entry) => entry.id)).size).toBe(brandSearchEntries.length)
    for (const entry of brandSearchEntries) expect(url(entry.href).origin).toBe('https://brand.example')
  })

  it('opens the gradient builder and stack creator by their synonyms', () => {
    expect(brandSearchEntries.find((entry) => entry.keywords.includes('gradient builder'))?.href).toBe(
      '/create/gradient/',
    )
    expect(brandSearchEntries.find((entry) => entry.keywords.includes('stack builder'))?.href).toBe('/create/stack/')
  })

  it('preserves every partner name in its filter, including punctuation', () => {
    const entries = brandSearchEntries.filter((entry) => entry.group === 'Partners')
    expect(entries).toHaveLength(partners.length)
    for (const partner of partners) {
      expect(url(entries.find((entry) => entry.id === `partner-${partner.id}`)!.href).searchParams.get('q')).toBe(
        partner.name,
      )
    }
  })

  it('links every exact logo variant to a valid selection and matching anchor', () => {
    const entries = brandSearchEntries.filter((entry) => entry.group === 'Logo assets')
    expect(entries).toHaveLength(logoAssets.length)
    for (const asset of logoAssets) {
      const target = url(entries.find((entry) => entry.id === `logo-${asset.id}`)!.href)
      expect(target.pathname).toBe('/logos/')
      expect(target.searchParams.get('asset')).toBe(asset.id)
      expect(target.hash).toBe(`#${asset.id}`)
    }
  })

  it('opens every stack at its matching library card', () => {
    const entries = brandSearchEntries.filter((entry) => entry.group === 'Stack assets')
    expect(entries).toHaveLength(stacks.length)
    for (const stack of stacks)
      expect(entries.find((entry) => entry.id === `artwork-${stack.id}`)?.href).toBe(`/stacks/#${stack.id}`)
  })
})
