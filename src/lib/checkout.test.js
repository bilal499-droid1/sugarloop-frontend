import { describe, expect, test } from 'vitest'

import {
  checkoutDiscountRupees,
  describeCheckoutError,
  findUnorderableLines,
  toApiItems,
} from './checkout'

/**
 * The cart-to-API translation.
 *
 * `toApiItems` gets the most coverage here because it is where the project's central
 * rule is either kept or broken: the browser never sends a price. A regression that
 * added one would not fail the build, would not fail a page, and would be invisible
 * until someone edited a total in devtools — the API strips it, but the reason to test
 * is that nobody would notice this file had started trying.
 */
describe('toApiItems', () => {
  test('sends ids and quantities, and nothing that resembles a price', () => {
    const lines = toApiItems([
      { kind: 'product', apiId: 'p1', qty: 2, price: 29900, name: 'Chocoholic' },
    ])

    expect(lines).toEqual([{ kind: 'product', productId: 'p1', qty: 2 }])

    // Explicit, because the assertion above passing is not the same as no price having
    // been attached: a future field would have to be added to the expectation to break it.
    const keys = Object.keys(lines[0])
    expect(keys).not.toContain('price')
    expect(keys).not.toContain('name')
    expect(keys).not.toContain('lineTotal')
  })

  test('a box becomes one line per box, because a box has no quantity', () => {
    // The API's schema has no `qty` on a box line. Two identical boxes are two lines; a
    // cart row stepped up to 2 that sent `qty: 2` would be priced as a single box.
    const lines = toApiItems([
      { kind: 'box', boxSize: 4, childApiIds: ['a', 'b', 'c', 'd'], qty: 2 },
    ])

    expect(lines).toHaveLength(2)
    expect(lines[0]).toEqual({ kind: 'box', boxSize: 4, productIds: ['a', 'b', 'c', 'd'] })
    expect(lines[1]).toEqual(lines[0])
    expect(lines[0]).not.toHaveProperty('qty')
  })

  test('a box with no quantity is still one box', () => {
    expect(toApiItems([{ kind: 'box', boxSize: 2, childApiIds: ['a', 'b'] }])).toHaveLength(1)
  })

  test('mixed carts keep every line', () => {
    const lines = toApiItems([
      { kind: 'product', apiId: 'p1', qty: 1 },
      { kind: 'box', boxSize: 2, childApiIds: ['a', 'b'], qty: 3 },
      { kind: 'product', apiId: 'p2', qty: 5 },
    ])

    expect(lines).toHaveLength(5)
    expect(lines.filter((l) => l.kind === 'box')).toHaveLength(3)
  })
})

/**
 * A product that exists only in the bundled catalogue has no server id, so it cannot be
 * ordered. Naming those lines is what lets the page say which ones rather than refusing
 * the whole cart without saying why.
 */
describe('findUnorderableLines', () => {
  test('a product with no server id cannot be ordered', () => {
    const items = [{ kind: 'product', apiId: null, qty: 1 }]
    expect(findUnorderableLines(items)).toEqual(items)
  })

  test('a fully-resolved cart has nothing unorderable', () => {
    expect(
      findUnorderableLines([
        { kind: 'product', apiId: 'p1', qty: 1 },
        { kind: 'box', boxSize: 2, childApiIds: ['a', 'b'] },
      ])
    ).toEqual([])
  })

  test('a box is unorderable when any one of its donuts is unresolved', () => {
    // The partial case is the one worth pinning: a box of four where one slot never
    // resolved would otherwise be sent with a hole in it.
    const partial = { kind: 'box', boxSize: 4, childApiIds: ['a', null, 'c', 'd'] }
    expect(findUnorderableLines([partial])).toEqual([partial])
  })

  test('a box with no donuts at all is unorderable', () => {
    const empty = { kind: 'box', boxSize: 4, childApiIds: [] }
    expect(findUnorderableLines([empty])).toEqual([empty])
  })
})

describe('describeCheckoutError', () => {
  test('a late delivery points at collection, not at tomorrow', () => {
    const described = describeCheckoutError({
      code: 'BRANCH_NOT_ACCEPTING_ORDERS',
      message: 'Sugar Loop DHA 2 has stopped delivering for today',
      details: { isOpenNow: true, canStillCollect: true, opensAt: '2026-09-18T11:00:00.000Z' },
    })

    expect(described.title).toBe('Delivery has closed for today')
    expect(described.detail).toContain('I will collect')
    expect(described.detail).not.toContain('reopen')
  })

  test('an early delivery says delivery has not started, and still points at collection', () => {
    const described = describeCheckoutError({
      code: 'BRANCH_NOT_ACCEPTING_ORDERS',
      message: 'Sugar Loop DHA 2 delivers from 4:00 pm — you can collect your order now',
      details: { isOpenNow: true, canStillCollect: true, deliveryStartsLater: true },
    })

    expect(described.title).toBe('Delivery has not started yet today')
    expect(described.detail).toContain('I will collect')
  })

  test('a paused branch asks to try again shortly, not tomorrow', () => {
    const described = describeCheckoutError({
      code: 'BRANCH_NOT_ACCEPTING_ORDERS',
      message:
        'Sugar Loop DHA 2 has paused online orders for a short while — please try again in a few minutes',
      details: { isOpenNow: true, isPaused: true, opensAt: '2026-09-19T05:30:00.000Z' },
    })

    expect(described.title).toBe('Orders are paused for a few minutes')
    expect(described.detail).not.toContain('reopen')
    expect(described.canRetry).toBe(true)
  })

  test('a shut branch still quotes when it reopens', () => {
    const described = describeCheckoutError({
      code: 'BRANCH_NOT_ACCEPTING_ORDERS',
      message: 'Sugar Loop DHA 2 is closed',
      details: { isOpenNow: false, canStillCollect: false, opensAt: '2026-09-18T11:00:00.000Z' },
    })

    expect(described.title).toBe('We are closed right now')
    expect(described.detail).toContain('We reopen at')
  })
})

describe('checkoutDiscountRupees', () => {
  // Must round exactly as the API does, or the provisional total jumps when the quote lands.
  test('15% of the items, rounded to whole rupees', () => {
    expect(checkoutDiscountRupees(858)).toBe(129) // 128.70
    expect(checkoutDiscountRupees(370)).toBe(56) // 55.50 rounds up
    expect(checkoutDiscountRupees(110)).toBe(17) // 16.50 — no float drift to 16
    expect(checkoutDiscountRupees(0)).toBe(0)
  })
})

describe('minimum order message', () => {
  test('says it is a delivery minimum and offers collection', () => {
    const error = Object.assign(new Error('Minimum order for delivery is Rs 500'), {
      code: 'MINIMUM_ORDER_NOT_MET',
      details: { subtotal: 37_000, minimumOrderValue: 50_000, shortfall: 13_000 },
    })
    const { title, detail } = describeCheckoutError(error)
    expect(title).toMatch(/delivery/)
    expect(detail).toMatch(/Rs 130 more/)
    expect(detail).toMatch(/collection has no minimum/)
  })
})
