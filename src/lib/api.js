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
 * ⚠️ This file is READ-ONLY against the API on purpose. The catalogue is the only thing
 * wired up so far; pricing (`POST /checkout/quote`) and order placement (`POST /orders`)
 * are deliberately NOT here. Order placement has no phone verification behind it yet —
 * the backend's own route file says it must not be public before OTP ships — so adding
 * it needs to be a decision somebody makes on purpose, not something that quietly
 * appears because a helper was available.
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

async function request(path, { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
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
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    // Read the body before checking `ok`: the API puts its error envelope in the body
    // of a 4xx, and that message is more useful than "Request failed with 422".
    let body = null
    try {
      body = await response.json()
    } catch {
      body = null
    }

    if (!response.ok) {
      const error = body?.error
      throw new ApiError(
        response.status,
        error?.code ?? 'HTTP_ERROR',
        error?.message ?? `Request failed with ${response.status}`,
        error?.details
      )
    }

    return body?.data
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
