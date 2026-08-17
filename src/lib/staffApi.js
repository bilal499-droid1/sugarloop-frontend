/**
 * The staff console's API client — the authenticated half.
 *
 * Kept apart from `api.js` deliberately. That file is the storefront's: anonymous,
 * GET-only, and safe to call from any page. This one carries credentials, writes, and
 * a token refresh loop, and nothing on the public site should be able to reach it by
 * importing the wrong helper.
 *
 * ## Where the tokens live
 *
 * The backend hands back two things on login and means different things by them:
 *
 *   accessToken   in the response body, 15 minutes, sent as `Authorization: Bearer`
 *   refreshToken  in an httpOnly cookie scoped to /api/v1/staff/auth, 7 days
 *
 * So the access token is held in a module variable — memory only, never localStorage.
 * A token in localStorage is readable by any script that manages to run on the page,
 * and it survives long after the tab is closed. The cost of keeping it in memory is
 * that a page reload loses it, which is exactly what `bootstrap()` is for: the cookie
 * outlives the reload, and one refresh call trades it for a new access token. The
 * durable credential stays somewhere page scripts cannot read it, which is the whole
 * point of the backend putting it in a cookie rather than the body.
 */
import { API_BASE_URL, ApiError, isApiConfigured } from './api'

/** Longer than the storefront's 8s: an operator waiting on a deliberate click has
 *  more patience than a visitor waiting on a menu that should already be there. */
const TIMEOUT_MS = 15000

const AUTH = '/staff/auth'

let accessToken = null

/**
 * Called when the session cannot be recovered, so the provider can drop its user and
 * the router can send the operator back to the login screen. A module holding a token
 * has no way to redirect on its own, and giving it a router import would tie this
 * file to React for one callback.
 */
let onSessionLost = null

export function setSessionLostHandler(handler) {
  onSessionLost = handler
}

/**
 * One refresh at a time.
 *
 * An order board fires several requests together — orders, stock, branches — and when
 * the access token expires they all 401 at once. Without this each would start its own
 * refresh, and since the backend ROTATES the refresh token on every use, the second one
 * to arrive would present a token the first had already spent, logging the operator out
 * mid-shift. Sharing one in-flight promise means the losers wait for the winner.
 */
let refreshInFlight = null

/** Fires the request exactly once — no retry, no token. The building block everything below composes. */
async function raw(path, { method = 'GET', body, token, withCookie = false, signal } = {}) {
  if (!isApiConfigured) {
    throw new ApiError(
      0,
      'API_NOT_CONFIGURED',
      'VITE_API_BASE_URL is not set, so there is no API to sign in to'
    )
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const onCallerAbort = () => controller.abort()
  signal?.addEventListener('abort', onCallerAbort)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Only the three auth routes actually need the cookie, and the cookie's own Path
      // confines it to them anyway — asking for credentials everywhere would just widen
      // what CORS has to allow for no benefit.
      credentials: withCookie ? 'include' : 'same-origin',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    // The error envelope lives in the BODY of a 4xx, and its message is written for a
    // person — "This order is already 'confirmed'" beats "Request failed with 409".
    let parsed = null
    try {
      parsed = await response.json()
    } catch {
      parsed = null
    }

    if (!response.ok) {
      const error = parsed?.error
      throw new ApiError(
        response.status,
        error?.code ?? 'HTTP_ERROR',
        error?.message ?? `Request failed with ${response.status}`,
        error?.details
      )
    }

    return parsed ?? {}
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onCallerAbort)
  }
}

/** Trades the refresh cookie for a new access token. Rotates the cookie as a side effect. */
async function refresh() {
  // `{}` rather than no body at all: the route validates its body with Zod, and a body
  // that is truly absent parses as undefined and fails before it reaches the handler.
  const { data } = await raw(`${AUTH}/refresh`, { method: 'POST', body: {}, withCookie: true })
  accessToken = data.accessToken
  return data.staffUser
}

function refreshOnce() {
  refreshInFlight ??= refresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

/**
 * An authenticated call that survives its access token expiring underneath it.
 *
 * A 15-minute token means a manager who spends twenty minutes on one order would
 * otherwise be thrown out mid-click. On a 401 this refreshes once and replays the
 * request; if the refresh also fails, the session is genuinely over and the handler set
 * by `setSessionLostHandler` is told. Only 401 is retried — a 403 is a role or branch
 * the operator does not have, and retrying it with a fresher token produces the same
 * 403 while hiding the real reason.
 *
 * Returns the full envelope (`{ data, meta? }`) rather than unwrapping, because the
 * order list needs `meta.nextCursor` and nothing else here should have to know that.
 */
async function authed(path, options = {}) {
  try {
    return await raw(path, { ...options, token: accessToken })
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error

    try {
      await refreshOnce()
    } catch {
      accessToken = null
      onSessionLost?.()
      throw new ApiError(401, 'SESSION_EXPIRED', 'Your session has expired. Please sign in again.')
    }

    return raw(path, { ...options, token: accessToken })
  }
}

const data = (path, options) => authed(path, options).then((envelope) => envelope.data)

/* -------------------------------------------------------------------------- */
/* Session                                                                     */
/* -------------------------------------------------------------------------- */

export async function login({ email, password }) {
  const { data: body } = await raw(`${AUTH}/login`, {
    method: 'POST',
    body: { email, password },
    withCookie: true,
  })

  accessToken = body.accessToken
  return body.staffUser
}

/**
 * Restores a session after a page reload, from the cookie alone.
 *
 * Returns null rather than throwing when there is no session — arriving at the login
 * page signed out is the ordinary case, not an error worth surfacing.
 */
export async function bootstrap() {
  try {
    return await refreshOnce()
  } catch {
    accessToken = null
    return null
  }
}

export async function logout() {
  try {
    await raw(`${AUTH}/logout`, { method: 'POST', body: {}, withCookie: true })
  } catch {
    // A logout that fails on the wire still has to clear this tab. The refresh token
    // stays alive server-side, which is a smaller problem than a console that will not
    // let go of a session the operator has already finished with.
  }
  accessToken = null
}

export function fetchMe({ signal } = {}) {
  return data(`${AUTH}/me`, { signal }).then((body) => body.staffUser)
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The order board.
 *
 * Empty filter values are dropped rather than sent blank — the query schema validates
 * `status` against an enum, and `?status=` is not a member of it.
 *
 * Resolves to `{ items, meta }`: `meta.nextCursor` is what "Load more" follows.
 * Pagination is cursor-based because the list changes under the reader, and offsets
 * skip and duplicate rows when it does.
 */
export async function fetchOrders({ signal, ...filters } = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  }

  const { data: items, meta } = await authed(`/staff/orders?${query}`, { signal })
  return { items, meta }
}

/** One order, plus the moves it may legally make next. */
export function fetchOrder(id, { signal } = {}) {
  return data(`/staff/orders/${id}`, { signal })
}

/**
 * Moves an order along.
 *
 * `reason` is required by the server when failing an order and refused otherwise, and
 * `note` becomes required when the reason is `other`. Those rules are enforced there;
 * the form mirrors them so the operator finds out before the round trip, not after.
 */
export function changeOrderStatus(id, { status, reason = null, note = null }) {
  const body = { status }
  if (reason) body.reason = reason
  if (note) body.note = note

  return data(`/staff/orders/${id}/status`, { method: 'PATCH', body })
}

/* -------------------------------------------------------------------------- */
/* Stock                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The stock sheet for one branch.
 *
 * A branch manager may omit `branchId` — the server pins them to their own and refuses
 * any other. An admin belongs to no branch and must name one; there is no meaningful
 * "all branches" answer to whether something is in stock.
 */
export function fetchStock({ branchId, category, inStock, signal } = {}) {
  const query = new URLSearchParams()
  if (branchId) query.set('branchId', branchId)
  if (category) query.set('category', category)
  if (inStock !== undefined && inStock !== '') query.set('inStock', String(inStock))

  return data(`/staff/stock?${query}`, { signal })
}

/**
 * Marks one product in or out of stock at one branch.
 *
 * Takes the state to set, not a toggle, matching the endpoint. Two managers tapping at
 * once, or one double-tapping a slow phone in a hot kitchen, converge on the same
 * answer instead of flipping past each other.
 */
export function setStock(productId, { inStock, branchId }) {
  const body = { inStock }
  if (branchId) body.branchId = branchId

  return data(`/staff/stock/${productId}`, { method: 'PATCH', body })
}
