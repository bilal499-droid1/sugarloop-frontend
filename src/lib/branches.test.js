import { describe, expect, test } from 'vitest'

import { FALLBACK_BRANCHES, branchMapUrl, branchOrderStatus, shortBranchName } from './branches'

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

describe('branchOrderStatus', () => {
  test('open and taking orders is green', () => {
    expect(branchOrderStatus({ isOpenNow: true, isAcceptingOrders: true, minutesUntilLastOrder: 240 })).toEqual({
      tone: 'open',
      label: 'Open now',
      short: null,
    })
  })

  test('a manager pause turns an open branch amber, not green', () => {
    // The bug this exists for: isOpenNow is the clock alone and stays true while the
    // kitchen has stopped taking orders, so a picker reading it said "Open now".
    const status = branchOrderStatus({ isOpenNow: true, isAcceptingOrders: false, minutesUntilLastOrder: null })

    expect(status.tone).toBe('warn')
    expect(status.label).toBe('Not taking orders right now')
    expect(status.short).toBe('not taking orders')
  })

  test('counts down the last half hour, and is still orderable', () => {
    const status = branchOrderStatus({ isOpenNow: true, isAcceptingOrders: true, minutesUntilLastOrder: 12 })

    expect(status).toEqual({ tone: 'warn', label: 'Last orders in 12 min', short: null })
  })

  test('closed quotes the next opening in Pakistan time', () => {
    const status = branchOrderStatus(
      {
        isOpenNow: false,
        isAcceptingOrders: false,
        nextOpeningAt: '2026-09-15T06:00:00.000Z',
      },
      new Date('2026-09-15T03:00:00.000Z')
    )

    expect(status).toEqual({ tone: 'closed', label: 'Closed · opens 11:00 am', short: 'closed' })
  })

  test('names the day when the next opening is not today (NUST at the weekend)', () => {
    const status = branchOrderStatus(
      {
        isOpenNow: false,
        isAcceptingOrders: false,
        // Monday 21 Sep, 10:30 in Pakistan.
        nextOpeningAt: '2026-09-21T05:30:00.000Z',
      },
      // Saturday 19 Sep, 11:00 in Pakistan.
      new Date('2026-09-19T06:00:00.000Z')
    )

    expect(status.label).toBe('Closed · opens Mon 10:30 am')
  })

  test('closed without a usable opening time still says closed', () => {
    expect(branchOrderStatus({ isOpenNow: false, isAcceptingOrders: false }).label).toBe('Closed now')
    expect(branchOrderStatus({ isOpenNow: false, nextOpeningAt: 'garbage' }).label).toBe('Closed now')
  })

  test('says nothing when there is no server verdict', () => {
    expect(branchOrderStatus(FALLBACK_BRANCHES[0])).toBeNull()
  })
})
