import { describe, expect, test } from 'vitest'

import { formatWait } from './otp'

/**
 * A wait in words.
 *
 * The rounding here is deliberately upward everywhere: telling someone to come back in
 * "1 minute" when 90 seconds remain produces a customer who tries again, is refused
 * again, and concludes the site is broken rather than that they were early.
 */
describe('formatWait', () => {
  test('under a minute stays in seconds', () => {
    expect(formatWait(30)).toBe('30 seconds')
    expect(formatWait(59)).toBe('59 seconds')
  })

  test('rounds up to the minute, never down', () => {
    expect(formatWait(61)).toBe('2 minutes')
    expect(formatWait(90)).toBe('2 minutes')
  })

  test('singular where it should be', () => {
    expect(formatWait(60)).toBe('1 minute')
  })

  test('long lockouts become hours rather than a number nobody converts', () => {
    // The real case: the per-phone OTP cap is an hour, so a rate-limited customer is
    // shown this. "3180 seconds" is not something anyone reads as 53 minutes.
    expect(formatWait(3600)).toBe('1 hour')
    expect(formatWait(7200)).toBe('2 hours')
  })
})
