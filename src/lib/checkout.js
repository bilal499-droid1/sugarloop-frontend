/**
 * Turning a cart into something the API will price, and turning its refusals back into
 * something a customer can act on.
 *
 * The cart is built for display: it holds names, photos and rupees. The API wants none
 * of that — it takes ids and quantities and works out the rest itself. This file is the
 * translation, and it is the only place that knows both shapes.
 */

/**
 * Checkout needs `apiId`, which only the LIVE catalogue carries.
 *
 * The bundled fallback has no Mongo ids in it — it predates the backend. So a cart can
 * be perfectly displayable and still not be orderable, which is not an error state so
 * much as a fact about where the catalogue came from. Naming the lines that cannot be
 * sent lets the checkout page say which ones rather than refusing the whole cart with
 * no account of why.
 */
export function findUnorderableLines(items) {
  return items.filter((item) =>
    item.kind === 'box'
      ? !item.childApiIds?.length || item.childApiIds.some((id) => !id)
      : !item.apiId
  )
}

/**
 * Cart lines in the shape `POST /checkout/quote` and `POST /orders` accept.
 *
 * Note what is not here: no price, no name, no line total. The server looks all of that
 * up. Anything this function did send would be stripped by the API's validator before a
 * single line of pricing code could read it.
 *
 * A box carries no `qty` in the API's schema — a box is one box. Two identical boxes are
 * therefore two lines, not one line with `qty: 2`, so a cart row whose quantity was
 * stepped up is expanded here.
 */
export function toApiItems(items) {
  return items.flatMap((item) => {
    if (item.kind === 'box') {
      const line = {
        kind: 'box',
        boxSize: item.boxSize,
        productIds: item.childApiIds,
      }
      return Array.from({ length: item.qty ?? 1 }, () => line)
    }

    return [{ kind: 'product', productId: item.apiId, qty: item.qty }]
  })
}

/**
 * What to actually say when the API refuses.
 *
 * Every one of these is a rule the server enforces and the browser cannot: whether the
 * shop is open, whether a tray is empty, whether an address is inside a delivery radius.
 * The API's own `message` is written for a person and is usually the best available
 * sentence — it names the sold-out item, the branch, the shortfall. So the default is to
 * use it, and this map only steps in where a code needs more context than one sentence,
 * or where the raw message would land as jargon.
 *
 * Returns `{ title, detail, canRetry }`. `canRetry` distinguishes "try again in a
 * moment" from "this cart cannot go through as it stands".
 */
export function describeCheckoutError(error) {
  const detail = error?.message ?? 'Something went wrong pricing your order.'

  switch (error?.code) {
    case 'API_NOT_CONFIGURED':
      return {
        title: 'Online ordering is not switched on',
        detail: 'This build has no API configured, so orders cannot be placed from it.',
        canRetry: false,
      }

    case 'BRANCH_NOT_ACCEPTING_ORDERS': {
      const opensAt = error.details?.opensAt
      return {
        title: error.details?.isOpenNow ? 'Last orders have passed' : 'We are closed right now',
        detail: opensAt
          ? `${detail}. We reopen at ${new Date(opensAt).toLocaleString('en-PK', {
              weekday: 'short',
              hour: 'numeric',
              minute: '2-digit',
            })}.`
          : detail,
        canRetry: false,
      }
    }

    case 'OUTSIDE_DELIVERY_AREA': {
      const { nearestBranch, distanceKm, deliveryRadiusKm } = error.details ?? {}
      return {
        title: 'We do not deliver here yet',
        detail: nearestBranch
          ? `Our nearest shop is ${nearestBranch}, ${distanceKm} km away — we deliver up to ${deliveryRadiusKm} km. You can still collect your order.`
          : detail,
        canRetry: false,
      }
    }

    case 'MINIMUM_ORDER_NOT_MET': {
      const shortfall = error.details?.shortfall
      return {
        title: 'Your order is under the minimum',
        detail: shortfall
          ? `Add Rs ${shortfall / 100} more to reach the Rs ${
              (error.details.minimumOrderValue ?? 0) / 100
            } minimum. The delivery fee does not count towards it.`
          : detail,
        canRetry: false,
      }
    }

    case 'ITEMS_UNAVAILABLE':
      return { title: 'Something in your cart has sold out', detail, canRetry: false }

    case 'INVALID_BOX':
      return {
        title: 'One of your boxes needs rebuilding',
        detail: `${detail}. Open Build your box and put it together again.`,
        canRetry: false,
      }

    case 'FULFILMENT_UNAVAILABLE':
      return { title: 'Not available at this shop', detail, canRetry: false }

    /**
     * The order was priced again at submit time and came out different — a tray emptied,
     * or an admin changed a price, between the quote and the click. Deliberately NOT
     * auto-retried: re-quoting silently and placing the order anyway would charge someone
     * a total they never agreed to. They see the new number and press the button again.
     */
    case 'PRICE_CHANGED': {
      const current = error.details?.currentTotal
      return {
        title: 'Your total changed',
        detail: current
          ? `Your order now comes to Rs ${current / 100}. Check the new total and confirm again.`
          : `${detail}`,
        canRetry: true,
      }
    }

    case 'VALIDATION_ERROR':
      return { title: 'Please check your details', detail, canRetry: true }

    case 'TOO_MANY_REQUESTS':
      return {
        title: 'Too many attempts',
        detail: 'Please wait a moment before trying again.',
        canRetry: true,
      }

    default:
      return {
        title: 'We could not price your order',
        detail:
          error?.name === 'AbortError' || !error?.code
            ? 'We could not reach the kitchen. Check your connection and try again.'
            : detail,
        canRetry: true,
      }
  }
}
