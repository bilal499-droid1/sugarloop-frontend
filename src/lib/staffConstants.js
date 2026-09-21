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

  /**
   * Set by the server, never by a person: an order nobody confirmed within the
   * auto-cancel window is failed on the shop's behalf and the customer is emailed. It is
   * labelled here so the board can name it, and excluded from FAILURE_REASONS below so
   * it never appears in the fail-reason picker — the branch that ignored an order must
   * not be able to file it under "nobody looked at this".
   */
  not_acknowledged: 'Nobody confirmed it',
}

/** What a human may choose. See `not_acknowledged` above. */
export const FAILURE_REASONS = Object.keys(FAILURE_REASON_LABEL).filter(
  (reason) => reason !== 'not_acknowledged'
)

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

/**
 * The two things that arrive through a public form. Mirrors ENQUIRY_KIND on the server.
 *
 * They share an inbox because they are the same shape — somebody asked, somebody has to
 * answer — but they are labelled apart because the work is not the same. A 200-box
 * gifting lead and "do these contain nuts?" want different people and different
 * urgencies, and an unlabelled queue buries the first behind a fortnight of the second.
 */
export const ENQUIRY_KIND_LABEL = {
  corporate: 'Gifting lead',
  question: 'Question',
}

export const ENQUIRY_KINDS = Object.keys(ENQUIRY_KIND_LABEL)

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

/**
 * Mirrors PRODUCT_CATEGORIES on the server — a category is a section of the printed
 * menu, not a tag, so this is a closed list rather than free text.
 *
 * ⚠️ 'Brownies' is AHEAD of the server. The API's own PRODUCT_CATEGORIES
 * (src/config/constants.js in the backend) still holds only the original four, and it
 * backs both a Mongoose enum on Product.category and a zod enum on the staff product
 * routes. Until that list gains 'Brownies', saving a product in this category from the
 * staff console gets a 400 back. Add it there before relying on this option.
 */
export const PRODUCT_CATEGORIES = ['Donuts', 'Brownies', 'Croissants', 'Sandwiches', 'Drinks']

/**
 * What a product photo may be. Mirrors `ALLOWED_IMAGE_TYPES`, `MAX_IMAGE_BYTES` and
 * `MAX_IMAGES_PER_PRODUCT` in the backend's image storage and product services.
 *
 * The server is the authority — S3 enforces the type and size through the signed URL and
 * the attach step checks them again. These exist so a wrong file is turned away at the
 * file picker, not after a round trip and a 400. SVG is absent on purpose: an uploaded
 * SVG can carry script and would be served from a domain the shop trusts.
 */
export const PRODUCT_IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/avif']
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const PRODUCT_IMAGE_MAX_COUNT = 8
