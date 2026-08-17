/**
 * The Sugarloop API client.
 *
 * The API answers in one envelope everywhere:
 *
 *   success   { "data": ... }                       (+ "meta" on paginated lists)
 *   failure   { "error": { code, message, details, requestId } }
 *
 * So there is exactly one place that unwraps `data` and one that reads `error.code`,
 * instead of every caller remembering which shape a given endpoint returns.
 *
 * **Order placement requires a verified phone.** `POST /orders` is gated server-side: the
 * customer proves they hold their number by OTP, and the server then refuses any order
 * whose contact phone differs from the verified one. That pairing is what stops a prank
 * Cash-on-Delivery order — the callback number on the order is the only handle a branch
 * has on a customer who has paid nothing yet.
 *
 * The session travels as an httpOnly cookie the API sets on verify, which is why every
 * authenticated call here sends `credentials: 'include'`. Nothing in this file ever holds
 * the token: a four-day credential readable by page scripts is a four-day credential one
 * XSS away from being someone else's.
 */

/**
 * Vite inlines this at BUILD time, so changing it needs a rebuild, not a restart.
 * Empty (or absent) means "no backend" — every call short-circuits and the caller
 * falls back to the bundled catalogue. That is what a preview build with no API does.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

export const isApiConfigured = Boolean(API_BASE_URL)

/** An error we can tell apart from a bug — carries what the API said went wrong. */
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * A request that gives up rather than hanging.
 *
 * A storefront must never sit on a blank menu because the API is slow or a phone
 * dropped off wifi mid-request. Eight seconds is well past a healthy response and
 * well short of a visitor's patience; on timeout the caller falls back.
 */
const DEFAULT_TIMEOUT_MS = 8000

/**
 * Longer than a menu fetch. Placing an order is a deliberate click on a button the
 * customer waited to press; giving up on it at 8 seconds risks the worst outcome
 * available — an order the server accepted and the browser reported as failed.
 */
const WRITE_TIMEOUT_MS = 20000

async function request(
  path,
  { method = 'GET', body, signal, timeoutMs = DEFAULT_TIMEOUT_MS, withSession = false } = {}
) {
  if (!isApiConfigured) {
    throw new ApiError(0, 'API_NOT_CONFIGURED', 'VITE_API_BASE_URL is not set')
  }

  // Two reasons to abort: our own timeout, or the caller unmounting. Both have to
  // work, so the timer gets its own controller and the caller's signal is forwarded.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const onCallerAbort = () => controller.abort()
  signal?.addEventListener('abort', onCallerAbort)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // Opt-in rather than always: the session cookie should travel to the handful of
      // endpoints that need it, not ride along on every catalogue request.
      credentials: withSession ? 'include' : 'same-origin',
      signal: controller.signal,
    })

    // Read the payload before checking `ok`: the API puts its error envelope in the body
    // of a 4xx, and that message is more useful than "Request failed with 422".
    //
    // Named `payload` rather than `body` deliberately — `body` is this function's own
    // parameter, and a `let body` here would shadow it for the WHOLE block, putting the
    // fetch call above into the temporal dead zone.
    let payload = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    if (!response.ok) {
      const error = payload?.error

      /**
       * A 429 from the rate-limit middleware carries its delay in the `Retry-After`
       * HEADER, not in the error body — unlike the limits the OTP service enforces
       * itself, which put `retryAfterSeconds` in `details`. Without folding the header in
       * here, the UI has no number to count down and a throttled button looks broken
       * rather than temporarily unavailable.
       */
      const retryAfter = Number(response.headers.get('retry-after'))
      const details =
        response.status === 429 && Number.isFinite(retryAfter) && retryAfter > 0
          ? { retryAfterSeconds: retryAfter, ...error?.details }
          : error?.details

      throw new ApiError(
        response.status,
        error?.code ?? 'HTTP_ERROR',
        error?.message ?? `Request failed with ${response.status}`,
        details
      )
    }

    return payload?.data
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onCallerAbort)
  }
}

/**
 * The live menu.
 *
 * Returns the API's product rows untouched — mapping them into the shape this site's
 * components expect is `catalogue.js`'s job, not the transport's.
 *
 * `branchId` is optional and adds an `inStock` flag per product. Without one the field
 * is absent entirely rather than guessed at, because there is no correct answer to
 * "is this in stock" until somebody names a branch.
 */
export function fetchProducts({ branchId, signal } = {}) {
  const query = new URLSearchParams({ limit: '100' })
  if (branchId) query.set('branchId', branchId)

  return request(`/products?${query}`, { signal })
}

/** The branches, with server-computed `isOpenNow` / `isAcceptingOrders`. */
export function fetchBranches({ signal } = {}) {
  return request('/branches', { signal })
}

/**
 * Prices a cart. The server is the only thing that decides what anything costs.
 *
 * Send `{ fulfilment, items, location? , branchCode? }` — ids and quantities, never a
 * price. Comes back with the branch it assigned, a per-line breakdown, and the totals
 * to display verbatim. Every amount is `{ amount, formatted }` where `amount` is
 * hundredths of a rupee, so nothing here has to divide by 100 and start rounding.
 *
 * Also the gate for everything else: stock, opening hours, the Rs 500 minimum and the
 * 2 km delivery radius are all enforced in this one call, and each refusal comes back
 * as a distinct `error.code`. See `describeCheckoutError` in `checkout.js`.
 */
export function quoteCart(request_, { signal } = {}) {
  return request('/checkout/quote', { method: 'POST', body: request_, signal })
}

/**
 * Places a Cash-on-Delivery order. Returns the created order.
 *
 * `expectedTotal` is mandatory and is the grand total the customer was actually shown.
 * The server re-prices the whole cart from scratch and **rejects** rather than silently
 * repricing if anything moved since the quote — a sold-out tray, an admin price change.
 * That refusal is a feature: it is what stops someone being charged a number they never
 * agreed to.
 *
 * ⚠️ See the warning at the top of this file. Nothing verifies the phone number yet.
 */
export function placeOrder(order, { signal } = {}) {
  return request('/orders', {
    method: 'POST',
    body: order,
    signal,
    timeoutMs: WRITE_TIMEOUT_MS,
    // The OTP session cookie. Without it the API answers PHONE_NOT_VERIFIED.
    withSession: true,
  })
}

/* -------------------------------------------------------------------------- */
/* Phone verification                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Sends a verification code to a phone.
 *
 * The most expensive endpoint in the system to call — every request bills a real message —
 * so the server caps it at 3/hour per number with a 60-second resend cooldown, and answers
 * `OTP_COOLDOWN` / `OTP_RATE_LIMITED` with a `retryAfterSeconds` the UI counts down.
 *
 * In development the API returns `devCode`, because the `log` transport prints the code to
 * the server console instead of sending it. That field is impossible in production: the
 * server refuses to boot with that transport configured.
 */
export function requestOtp(phone, { signal } = {}) {
  return request('/auth/otp/request', {
    method: 'POST',
    body: { phone },
    signal,
    withSession: true,
  })
}

/**
 * Exchanges a code for a four-day session.
 *
 * The session arrives as an httpOnly cookie set by the API — deliberately not readable
 * here. The token is also in the response body for non-browser clients; this file ignores
 * it, because storing it would undo the reason the cookie is httpOnly.
 */
export function verifyOtp({ phone, code }, { signal } = {}) {
  return request('/auth/otp/verify', {
    method: 'POST',
    body: { phone, code },
    signal,
    withSession: true,
  })
}

/**
 * The phone this browser has already verified, or null.
 *
 * Lets a returning customer skip verification for the four days their session lasts.
 * Resolves to null rather than throwing on 401 — arriving unverified is the ordinary
 * case, not an error worth surfacing.
 */
export async function fetchVerifiedPhone({ signal } = {}) {
  try {
    const data = await request('/auth/me', { signal, withSession: true })
    return data?.phone ?? null
  } catch {
    return null
  }
}

/** Ends the session. Used when the customer wants to order under a different number. */
export async function endCustomerSession({ signal } = {}) {
  try {
    await request('/auth/logout', { method: 'POST', body: {}, signal, withSession: true })
  } catch {
    // Clearing the cookie is the server's job and it failing changes nothing the
    // customer can act on — the next verify replaces the session anyway.
  }
}

/**
 * One order, by its number.
 *
 * Requires the phone it was placed with. Order numbers run in sequence and are trivially
 * enumerable, so the phone is the only thing standing between a stranger and every
 * order placed today. Replaced by the OTP session in Sprint 2.
 */
export function fetchOrderByNumber(orderNumber, phone, { signal } = {}) {
  const query = new URLSearchParams({ phone })
  return request(`/orders/${encodeURIComponent(orderNumber)}?${query}`, { signal })
}
