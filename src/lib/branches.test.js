import { describe, expect, test } from 'vitest'

import { FALLBACK_BRANCHES, branchMapUrl, shortBranchName } from './branches'

describe('branchMapUrl', () => {
  test('pins the coordinates rather than asking Google to guess', () => {
    // The FAQ page used to embed `?q=DHA Phase 2`, which drops the pin in the middle of
    // an area rather than on the shop — and named an area that has no shop in it at all.
    const url = branchMapUrl(FALLBACK_BRANCHES[1])

    expect(url).toContain('33.5312498%2C73.1574172')
    expect(url).toContain('output=embed')
  })

  test('latitude comes first, longitude second', () => {
    // Islamabad is ~33.5N, ~73.1E. Swapped, every shop lands in the Indian Ocean — and
    // the database stores GeoJSON as [lng, lat], so the temptation is real.
    for (const branch of FALLBACK_BRANCHES) {
      expect(branch.location.lat).toBeGreaterThan(33)
      expect(branch.location.lat).toBeLessThan(34)
      expect(branch.location.lng).toBeGreaterThan(72)
      expect(branch.location.lng).toBeLessThan(74)
    }
  })

  test('falls back to the address rather than rendering an empty frame', () => {
    const url = branchMapUrl({ address: 'Marina Commercial, Bahria Town Phase 4' })

    expect(url).toContain('Marina')
    expect(url).not.toContain('undefined')
  })
})

describe('FALLBACK_BRANCHES', () => {
  test('is the four real shops, each with its own name', () => {
    // The bug this replaced: four entries all called "DHA Branch", which told a visitor
    // nothing about which one was near them.
    expect(FALLBACK_BRANCHES).toHaveLength(4)

    const names = FALLBACK_BRANCHES.map((b) => b.name)
    expect(new Set(names).size).toBe(4)
    expect(FALLBACK_BRANCHES.map((b) => b.code)).toEqual(['DHA1', 'DHA2', 'BAH4', 'NUST'])
  })

  test('every shop carries an address, since that is the point of the section', () => {
    for (const branch of FALLBACK_BRANCHES) {
      expect(branch.address.length).toBeGreaterThan(10)
    }
  })
})

describe('shortBranchName', () => {
  test('drops the shop name that is redundant on the shop’s own site', () => {
    expect(shortBranchName('Sugar Loop DHA 1')).toBe('DHA 1')
    expect(shortBranchName('Sugar Loop NUST H-12')).toBe('NUST H-12')
  })

  test('keeps the full name when stripping would leave nothing', () => {
    expect(shortBranchName('Sugar Loop')).toBe('Sugar Loop')
  })
})
