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
