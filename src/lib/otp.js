/**
 * Turning the OTP endpoints' refusals into something a customer can act on.
 *
 * Kept apart from `describeCheckoutError` because these failures are answered differently:
 * a rate limit here is a countdown the UI runs, not a message it prints once.
 */

/**
 * `{ title, detail, retryAfterSeconds }`.
 *
 * `retryAfterSeconds` is what turns "too many attempts" into a button that comes back on
 * its own. Without it the customer is told to wait with no idea how long, which reads as
 * being locked out rather than throttled.
 */
/**
 * A wait in words. A bare "3180 seconds" is a number nobody converts in their head, and
 * a countdown ticking down from 53 minutes reads as broken rather than throttled.
 */
export function formatWait(seconds) {
  if (seconds < 60) return `${seconds} seconds`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'}`
}

export function describeOtpError(error) {
  const detail = error?.message ?? 'Something went wrong. Please try again.'
  const retryAfterSeconds = error?.details?.retryAfterSeconds ?? null

  switch (error?.code) {
    case 'OTP_COOLDOWN':
      return {
        title: 'Hold on a moment',
        detail: 'We have just sent you a code. Give it a few seconds to arrive.',
        retryAfterSeconds,
      }

    case 'OTP_RATE_LIMITED':
      return {
        title: 'Too many codes requested',
        detail:
          'This number has requested several codes recently. Please try again shortly, or call us to order.',
        retryAfterSeconds,
      }

    case 'OTP_ATTEMPTS_EXHAUSTED':
      return {
        title: 'Too many incorrect attempts',
        detail: 'For your security that code is now dead. Request a new one to continue.',
        retryAfterSeconds,
        /** The old code can never work again, so the UI must go back to step one. */
        requiresNewCode: true,
      }

    case 'OTP_INVALID': {
      const left = error.details?.attemptsRemaining
      return {
        title: 'That code is not right',
        detail:
          typeof left === 'number'
            ? `Check the code and try again — ${left} ${left === 1 ? 'attempt' : 'attempts'} left.`
            : detail,
        retryAfterSeconds,
      }
    }

    case 'VALIDATION_ERROR':
      return { title: 'Check the number', detail, retryAfterSeconds }

    /**
     * The per-IP limiter, as opposed to the per-phone limits above. Worth wording
     * differently: this one can fire for a number that has never requested a code at
     * all — a shared connection, an office, or (in development) everyone on localhost —
     * so blaming the customer's number would be wrong and confusing.
     */
    case 'TOO_MANY_REQUESTS':
      return {
        title: 'Too many code requests from this connection',
        detail: retryAfterSeconds
          ? `This is a limit on the network you are using, not on your number. Please try again in ${formatWait(retryAfterSeconds)}, or call us to order.`
          : 'Please wait a moment before trying again, or call us to order.',
        retryAfterSeconds,
      }

    case 'API_NOT_CONFIGURED':
      return {
        title: 'Ordering is not switched on',
        detail: 'This build has no API configured, so numbers cannot be verified.',
        retryAfterSeconds: null,
      }

    default:
      return {
        title: 'We could not send your code',
        detail:
          error?.name === 'AbortError' || !error?.code
            ? 'Check your connection and try again.'
            : detail,
        retryAfterSeconds,
      }
  }
}
