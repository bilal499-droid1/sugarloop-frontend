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

/**
 * A PDF, fetched with the same credentials and the same one-retry refresh as everything
 * else, then handed to the browser as a download.
 *
 * It cannot go through `raw`: that parses every response as JSON, which a PDF is not. So
 * this repeats the fetch rather than sharing it — the alternative is a `responseType` flag
 * threaded through `raw`, `authed` and `data` to serve two endpoints out of thirty.
 *
 * **The download is driven from a blob, not by pointing the browser at the URL.** These
 * routes need an `Authorization` header, and a plain `window.open` or `<a href>` sends no
 * header at all — it would arrive unauthenticated and render a 401 as the "document".
 */
async function downloadPdf(path, fallbackName) {
  if (!isApiConfigured) {
    throw new ApiError(0, 'API_NOT_CONFIGURED', 'VITE_API_BASE_URL is not set')
  }

  const request = (token) =>
    fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/pdf', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })

  let response = await request(accessToken)

  if (response.status === 401) {
    try {
      await refreshOnce()
    } catch {
      accessToken = null
      onSessionLost?.()
      throw new ApiError(401, 'SESSION_EXPIRED', 'Your session has expired. Please sign in again.')
    }
    response = await request(accessToken)
  }

  if (!response.ok) {
    // The failure body is still the JSON error envelope, so the operator gets the real
    // reason rather than "could not download".
    let parsed = null
    try {
      parsed = await response.json()
    } catch {
      parsed = null
    }
    throw new ApiError(
      response.status,
      parsed?.error?.code ?? 'HTTP_ERROR',
      parsed?.error?.message ?? `Could not download the document (${response.status})`
    )
  }

  // The server already named the file in Content-Disposition; prefer that over guessing.
  const disposition = response.headers.get('content-disposition') ?? ''
  const named = /filename="?([^";]+)"?/i.exec(disposition)?.[1]

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = named ?? fallbackName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  // Revoking immediately can cancel the download in some browsers; a tick is enough.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

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

/**
 * Changes your OWN password. Requires the current one.
 *
 * The server revokes every session on success — a password change is the answer to
 * "somebody may know my password", and leaving their 7-day refresh token alive would
 * only answer half of it. It then issues a fresh session for this caller, which is why
 * the new access token is captured here: without that line the operator would be signed
 * out by the act of securing their account, and people learn quickly not to do things
 * that log them out.
 *
 * Distinct from the admin reset below. This one proves you are the owner; that one
 * exists precisely because the owner cannot prove anything any more.
 */
export async function changeMyPassword({ currentPassword, newPassword }) {
  const body = await data(`${AUTH}/password`, {
    method: 'POST',
    body: { currentPassword, newPassword },
    withCookie: true,
  })

  accessToken = body.accessToken
  return body.staffUser
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

/** The order as a PDF the branch can print or send on. */
export function downloadOrderInvoice(id, orderNumber) {
  return downloadPdf(`/staff/orders/${id}/invoice`, `${orderNumber ?? 'order'}-invoice.pdf`)
}

/* -------------------------------------------------------------------------- */
/* Reports                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A day's trading.
 *
 * `date` is a calendar date in Asia/Karachi and may be omitted — the server defaults to
 * today in business time, which for a shop trading to 03:00 is not the same as the
 * browser's today at 1am.
 *
 * A branch manager may omit `branchId`; the server pins them to their own branch and
 * refuses another's outright rather than quietly re-scoping.
 */
export function fetchDailyReport({ date, branchId, signal } = {}) {
  const query = new URLSearchParams()
  if (date) query.set('date', date)
  if (branchId) query.set('branchId', branchId)

  return data(`/staff/reports/daily?${query}`, { signal })
}

export function downloadDailyReport({ date, branchId } = {}) {
  const query = new URLSearchParams()
  if (date) query.set('date', date)
  if (branchId) query.set('branchId', branchId)

  return downloadPdf(`/staff/reports/daily.pdf?${query}`, `sugarloop-${date ?? 'today'}.pdf`)
}

/**
 * The running total.
 *
 * With no `from`/`to` this is everything the shop has ever taken. The daily report cannot
 * answer that — it covers one day and one day only — so this is a separate endpoint
 * rather than a flag on that one.
 */
function summaryQuery({ from, to, branchId } = {}) {
  const query = new URLSearchParams()
  if (from) query.set('from', from)
  if (to) query.set('to', to)
  if (branchId) query.set('branchId', branchId)
  return query
}

export function fetchSalesSummary({ from, to, branchId, signal } = {}) {
  return data(`/staff/reports/summary?${summaryQuery({ from, to, branchId })}`, { signal })
}

export function downloadSalesSummary({ from, to, branchId } = {}) {
  return downloadPdf(
    `/staff/reports/summary.pdf?${summaryQuery({ from, to, branchId })}`,
    'sugarloop-all-time.pdf'
  )
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

/* -------------------------------------------------------------------------- */
/* Corporate enquiries — admin only                                            */
/* -------------------------------------------------------------------------- */

const ENQUIRIES = '/staff/enquiries'

/**
 * The corporate gifting inbox.
 *
 * `emailed: false` is the filter worth knowing about: it finds leads whose notification
 * email never got out, which are invisible to anyone working from the shop's inbox
 * alone. The lead is always stored first, so those exist and are recoverable — but only
 * if somebody looks.
 */
export async function fetchEnquiries({ signal, ...filters } = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  }

  const { data: items, meta } = await authed(`${ENQUIRIES}?${query}`, { signal })
  return { items, meta }
}

/** Counts per status, plus how many were never emailed. Drives the filter chips. */
export function fetchEnquirySummary({ signal } = {}) {
  return data(`${ENQUIRIES}/summary`, { signal }).then((body) => body.summary)
}

export function fetchEnquiry(id, { signal } = {}) {
  return data(`${ENQUIRIES}/${id}`, { signal }).then((body) => body.enquiry)
}

/**
 * Moves a lead along and records what was done.
 *
 * Status and note travel together because that is how the work happens — somebody rings
 * a company and then marks it contacted. Sending them separately invites the second call
 * to be forgotten, leaving a status change nobody can explain.
 *
 * Notes are appended server-side and cannot be edited or removed: a note that can be
 * rewritten is not a record of what happened.
 */
export function updateEnquiry(id, { status, note }) {
  const body = {}
  if (status) body.status = status
  if (note) body.note = note

  return data(`${ENQUIRIES}/${id}`, { method: 'PATCH', body }).then((res) => res.enquiry)
}

/* -------------------------------------------------------------------------- */
/* Staff users — admin only                                                    */
/* -------------------------------------------------------------------------- */

const USERS = '/staff/users'

/**
 * The team list.
 *
 * Admin-only server-side; a branch manager gets 403 on every call here, which is why
 * `RequireAdmin` keeps them off the route and `StaffLayout` hides the link. A UI that
 * offers a button guaranteed to fail is worse than one that offers nothing.
 *
 * Resolves to `{ items, meta }` like `fetchOrders` — same cursor pagination, same
 * reason: the list changes under the reader, and offsets skip and duplicate rows when
 * it does.
 */
export async function fetchStaffUsers({ signal, ...filters } = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  }

  const { data: items, meta } = await authed(`${USERS}?${query}`, { signal })
  return { items, meta }
}

export function fetchStaffUser(id, { signal } = {}) {
  return data(`${USERS}/${id}`, { signal }).then((body) => body.staffUser)
}

/**
 * Creates an account.
 *
 * `branchId` is required for a branch manager and REFUSED for an admin — an admin scoped
 * to one branch would be both "sees everything" and "sees one shop" at once, and which
 * one wins would depend on which check ran first. The form enforces the same pairing so
 * the operator finds out before the round trip.
 */
export function createStaffUser({ name, email, password, role, branchId }) {
  const body = { name, email, password, role }
  if (role !== 'admin') body.branchId = branchId

  return data(USERS, { method: 'POST', body }).then((response) => response.staffUser)
}

/**
 * Edits an account. Send only what changed — an empty patch is a 422, deliberately, since
 * it almost always means a serialiser dropped every field.
 *
 * Changing a role, a branch or the active flag revokes that person's sessions server-side.
 * They are signed out mid-shift, which is the point when someone is being demoted, and
 * worth saying out loud in the UI when they are merely being renamed.
 */
export function updateStaffUser(id, changes) {
  return data(`${USERS}/${id}`, { method: 'PATCH', body: changes }).then((body) => body.staffUser)
}

/** Admin reset — no current password, because the point is that it has been lost. */
export function resetStaffPassword(id, password) {
  return data(`${USERS}/${id}/password`, { method: 'POST', body: { password } }).then(
    (body) => body.staffUser
  )
}

/**
 * Switches an account off. A SOFT delete: the row survives.
 *
 * Orders carry the id of the staff member who confirmed or failed them, so removing the
 * document would leave that history pointing at nobody. Reversed with
 * `updateStaffUser(id, { isActive: true })`.
 */
export function deactivateStaffUser(id) {
  return data(`${USERS}/${id}`, { method: 'DELETE' }).then((body) => body.staffUser)
}

const PRODUCTS = '/staff/products'

/**
 * The catalogue, as an admin manages it.
 *
 * Admin-only server-side, like the team list — a branch manager gets 403 on every call
 * here. Their only write anywhere in the catalogue is the per-branch stock toggle, and
 * that separation is the rule the pricing engine rests on: one global price list, with
 * only availability varying by shop.
 *
 * Unlike the public menu, this includes discontinued items by default. They are the ones
 * an admin is usually hunting for — the product that stopped appearing on the site.
 *
 * Resolves to `{ items, meta }` like the other lists, same cursor pagination.
 */
export async function fetchStaffProducts({ signal, ...filters } = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  }

  const { data: items, meta } = await authed(`${PRODUCTS}?${query}`, { signal })
  return { items, meta }
}

export function fetchStaffProduct(id, { signal } = {}) {
  return data(`${PRODUCTS}/${id}`, { signal }).then((response) => response.product)
}

/**
 * ⚠️ `price` is PAISA, not rupees. Rs 299 is `29900`.
 *
 * The conversion happens once, in `toPaisa` below, and never anywhere else. Every screen
 * shows rupees because that is what a person types off a menu; every request carries the
 * stored integer because that is the only form the server accepts. A float that slips
 * through here is a rounding error in somebody's bill.
 */
export function createStaffProduct(product) {
  return data(PRODUCTS, { method: 'POST', body: product }).then((response) => response.product)
}

/** Send only what changed — an empty patch is a 422, deliberately. */
export function updateStaffProduct(id, changes) {
  return data(`${PRODUCTS}/${id}`, { method: 'PATCH', body: changes }).then(
    (response) => response.product
  )
}

/**
 * Discontinues a product. The server never deletes one.
 *
 * Every order line references a product, so removing the document would leave historical
 * orders that nobody can reprint or dispute. This takes it off the menu instead —
 * everywhere and permanently, which is what "delete" means to whoever clicked it — and
 * `updateStaffProduct(id, { isActive: true })` brings it back.
 *
 * Distinct from the stock toggle: that is one branch saying "the tray is empty today".
 */
export function discontinueStaffProduct(id) {
  return data(`${PRODUCTS}/${id}`, { method: 'DELETE' }).then((response) => response.product)
}

/**
 * Rupees as typed → paisa as stored. The single place this conversion is allowed to
 * happen.
 *
 * `Math.round` rather than a truncation: 4.35 * 100 is 434.99999999999994 in binary
 * floating point, and `Math.trunc` would quietly bill Rs 4.34. Returns null for anything
 * that is not a finite number, so a half-typed field submits nothing rather than NaN.
 */
export function toPaisa(rupees) {
  // `Number('')` and `Number('   ')` are both 0, not NaN — so without this an empty
  // price box would submit a free product rather than being caught as missing.
  if (typeof rupees === 'string' && rupees.trim() === '') return null

  const value = Number(rupees)
  if (!Number.isFinite(value)) return null
  return Math.round(value * 100)
}

/** Paisa as stored → rupees for an input box. The exact inverse of `toPaisa`. */
export function toRupees(paisa) {
  return Number.isFinite(paisa) ? paisa / 100 : ''
}

const BRANCHES = '/staff/branches'

/**
 * Every branch, closed ones included, each carrying both raw switches.
 *
 * Not the public `fetchBranches` in `api.js`: that hides `isActive: false`, so a closed
 * shop would drop out of the console and could never be reopened from it. Use the public
 * one for pickers that offer a live branch, this one for managing them.
 */
export function fetchStaffBranches({ signal } = {}) {
  return data(BRANCHES, { signal }).then((response) => response.branches)
}

/**
 * Opens a branch. Admin only.
 *
 * ⚠️ `location` is `{ lat, lng }`, in that order and named. The server stores GeoJSON
 * `[longitude, latitude]` and flips it on the way in; sending a bare array here would put
 * the shop in the Arabian Sea.
 */
export function createBranch(branch) {
  return data(BRANCHES, { method: 'POST', body: branch }).then((response) => response.branch)
}

/**
 * Flips a branch's switches. Send only what changed — an empty patch is a 422.
 *
 *   `acceptingOrders`  pause the queue mid-rush. A branch manager may set this on their
 *                      own branch; an admin on any.
 *   `isActive`         the shop stops trading and leaves the storefront entirely. Admin
 *                      only — the server answers 403 to a manager who tries.
 *
 * There is no delete. Every order stores its branch, so removing one strands the history;
 * `isActive: false` is what deleting a branch means, and it can be undone.
 */
export function updateBranch(id, changes) {
  return data(`${BRANCHES}/${id}`, { method: 'PATCH', body: changes }).then(
    (response) => response.branch
  )
}
