import { describe, expect, test } from 'vitest'

import { toPaisa, toRupees } from './staffApi'

/**
 * Rupees as typed, paisa as stored.
 *
 * This is the only conversion in the app and the only place it is allowed to happen.
 * Getting it wrong does not throw and does not fail a request — it produces a donut
 * priced at Rs 2.99, accepted by every validator on both sides, and the first sign is
 * the day's takings. That is precisely the kind of bug worth pinning down in a test.
 */
describe('toPaisa', () => {
  test('a whole-rupee price becomes hundredths', () => {
    expect(toPaisa(299)).toBe(29900)
    expect(toPaisa('429')).toBe(42900)
  })

  test('rounds rather than truncates', () => {
    // 4.35 * 100 is 434.99999999999994 in binary floating point. Math.trunc would bill
    // Rs 4.34, quietly, forever.
    expect(toPaisa(4.35)).toBe(435)
    expect(toPaisa(12.29)).toBe(1229)
  })

  test('a half-paisa input lands on one side and stays there', () => {
    // 1.005 * 100 is 100.49999999999999, so this rounds DOWN to 100 despite the .5 —
    // the classic float case. Pinned rather than fixed: PKR has no sub-paisa unit and
    // every real price on this menu is whole rupees, so the only way to reach here is
    // an input that was never a price. Worth knowing, not worth arbitrary-precision
    // arithmetic.
    expect(toPaisa(1.005)).toBe(100)
  })

  test('zero is a price, not a missing value', () => {
    expect(toPaisa(0)).toBe(0)
    expect(toPaisa('0')).toBe(0)
  })

  test('a half-typed field submits nothing rather than NaN', () => {
    // The form checks for null and complains; without this it would POST { price: NaN },
    // which serialises to null and gets rejected as a type error the admin cannot read.
    expect(toPaisa('')).toBe(null)
    expect(toPaisa('abc')).toBe(null)
    expect(toPaisa(undefined)).toBe(null)
  })

  test('round-trips through toRupees', () => {
    for (const paisa of [0, 12000, 29900, 42900, 79900]) {
      expect(toPaisa(toRupees(paisa))).toBe(paisa)
    }
  })
})

describe('toRupees', () => {
  test('renders the stored integer as a number a person recognises', () => {
    expect(toRupees(29900)).toBe(299)
    expect(toRupees(12000)).toBe(120)
  })

  test('a missing price is an empty box, not NaN in an input', () => {
    expect(toRupees(undefined)).toBe('')
    expect(toRupees(null)).toBe('')
  })
})
