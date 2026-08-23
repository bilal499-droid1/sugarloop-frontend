/**
 * Display constants for the staff console, mirroring the enums in the backend's
 * `config/constants.js`. Duplicated rather than fetched — these are the vocabulary of
 * the API contract, not data, and they change exactly as often as a deploy would be
 * needed anyway to add a new status this frontend has never heard of.
 */

export const ORDER_STATUS_LABEL = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  ready_for_pickup: 'Ready for pickup',
  completed: 'Completed',
  failed: 'Failed',
}

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABEL)

export const TERMINAL_STATUSES = new Set(['completed', 'failed'])

export const FAILURE_REASON_LABEL = {
  no_answer: 'No answer',
  unreachable: 'Unreachable',
  bad_address: 'Bad address',
  refused_substitute: 'Refused substitute',
  customer_request: "Customer's request",
  branch_unable: 'Branch unable to fulfil',
  other: 'Other',
}

export const FAILURE_REASONS = Object.keys(FAILURE_REASON_LABEL)

export const FULFILMENT_LABEL = {
  delivery: 'Delivery',
  pickup: 'Pickup',
}

export const STAFF_ROLE_LABEL = {
  admin: 'Admin',
  branch_manager: 'Branch manager',
}

/**
 * Corporate gifting leads. Three states, because a sales pipeline with more stages than
 * the shop actually works is a dropdown nobody keeps accurate.
 */
export const ENQUIRY_STATUS_LABEL = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
}

export const ENQUIRY_STATUSES = Object.keys(ENQUIRY_STATUS_LABEL)

/** What each state means, shown on the buttons so nobody has to guess. */
export const ENQUIRY_STATUS_HINT = {
  new: 'Nobody has picked this up yet',
  contacted: 'Someone has called or emailed them back',
  closed: 'Finished — they ordered, or it went nowhere',
}

export const STAFF_ROLES = Object.keys(STAFF_ROLE_LABEL)

/**
 * Mirrors `validators/password.js` on the server.
 *
 * The 72 is not arbitrary: bcrypt hashes only the first 72 BYTES and silently ignores
 * the rest, so a longer password is not the stronger one the person believes they chose.
 * Measured in bytes rather than characters because an emoji or an Urdu character is
 * several of them.
 */
export const PASSWORD_MIN_LENGTH = 12
export const PASSWORD_MAX_BYTES = 72

/** The reason this password would be refused, or null. Mirrors the server so the
 *  operator finds out while typing rather than after a round trip. */
export function describePasswordProblem(password) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Must be at least ${PASSWORD_MIN_LENGTH} characters.`
  }
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    return `Must be at most ${PASSWORD_MAX_BYTES} bytes — bcrypt ignores anything past that.`
  }
  return null
}

/**
 * A password to hand to a new staff member.
 *
 * `crypto.getRandomValues`, not `Math.random` — the latter is seeded predictably enough
 * that generated credentials become guessable given a few samples.
 *
 * The alphabet deliberately omits `l1IO0` and every symbol. This password gets read down
 * a phone line or typed off a WhatsApp message by someone standing in a kitchen, and a
 * character pair nobody can tell apart turns into a support call. Length carries the
 * strength instead: 20 characters from a 55-symbol alphabet is ~116 bits.
 */
const SAFE_ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const GENERATED_LENGTH = 20

export function generatePassword() {
  const bytes = crypto.getRandomValues(new Uint32Array(GENERATED_LENGTH))
  return Array.from(bytes, (byte) => SAFE_ALPHABET[byte % SAFE_ALPHABET.length]).join('')
}
