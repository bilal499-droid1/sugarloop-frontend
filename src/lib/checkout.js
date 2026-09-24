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
/**
 * Mirrors the API's CHECKOUT_DISCOUNT_PERCENT: 15% off the items (never the delivery
 * fee), every branch, applied at checkout only — menu and box prices stay as listed.
 * Display only: the server's quote is what an order is charged.
 */
export const CHECKOUT_DISCOUNT_PERCENT = 15

/** The discount on a subtotal in rupees, rounded to whole rupees as the server does. */
export function checkoutDiscountRupees(subtotalRupees) {
  return Math.round((subtotalRupees * CHECKOUT_DISCOUNT_PERCENT) / 100)
}

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
      // The shop is open but the manager has paused orders for a while. Quoting tomorrow's
      // opening time here would send the customer away for the day.
      if (error.details?.isPaused) {
        return {
          title: 'Orders are paused for a few minutes',
          detail: `${detail}.`,
          canRetry: true,
        }
      }

      // Delivery stops 30 minutes before closing, collection does not — so this is not a
      // "come back tomorrow", and quoting tomorrow's opening time would say it is.
      if (error.details?.canStillCollect) {
        return {
          // A branch can also take collection orders before its riders start (DHA 2:
          // collection from 10:30am, delivery from 4pm).
          title: error.details.deliveryStartsLater
            ? 'Delivery has not started yet today'
            : 'Delivery has closed for today',
          detail: `${detail}. Choose "I will collect" above to order for collection.`,
          canRetry: false,
        }
      }

      const opensAt = error.details?.opensAt
      return {
        title: error.details?.isOpenNow ? 'Not taking orders right now' : 'We are closed right now',
        detail: opensAt && !error.details?.isOpenNow
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
      const { nearestBranch, distanceKm, deliveryRadiusKm, roadKm, maxDeliveryRoadKm } =
        error.details ?? {}

      /**
       * Road distance, and the limit stated in the same units the customer is refused in.
       *
       * The old sentence quoted a great-circle distance, which reads as nonsense to
       * anyone who knows the route: a Westridge customer was told the nearest shop was
       * 3.65 km away when it is a 9.97 km ride around the airbase. Ride time was tried
       * here too and dropped — the shop's rule is a distance, so the refusal states a
       * distance. Nothing is refused for a reason this sentence does not give.
       */
      if (nearestBranch && roadKm != null) {
        return {
          title: 'We do not deliver here yet',
          detail:
            `Our nearest shop is ${nearestBranch}, ${roadKm} km away by road — we deliver ` +
            `up to ${maxDeliveryRoadKm ?? 5} km. You can still collect your order.`,
          canRetry: false,
        }
      }

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
        title: 'Your delivery order is under the minimum',
        detail: shortfall
          ? `Add Rs ${shortfall / 100} more to reach the Rs ${
              (error.details.minimumOrderValue ?? 0) / 100
            } delivery minimum, or collect it instead — collection has no minimum.`
          : detail,
        canRetry: false,
      }
    }

    case 'ITEMS_UNAVAILABLE':
      return { title: 'Something in your cart has sold out', detail, canRetry: false }

    /**
     * The geocoder could not place the typed address. Common for a specific building —
     * OpenStreetMap in particular knows areas far better than it knows shop names — so the
     * advice is to widen the address or use the location button, which needs no geocoder.
     */
    case 'ADDRESS_NOT_FOUND':
      return {
        title: 'We could not find that address',
        detail:
          'Try adding the sector or area, or tap "Use my current location" — that works without needing to look the address up.',
        canRetry: true,
      }

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

    /**
     * The session expired or was never established. Not an error the customer caused —
     * the checkout page sends them back to the verification step rather than showing a
     * failure they cannot act on.
     */
    case 'EMAIL_NOT_VERIFIED':
    case 'SESSION_EXPIRED':
      return {
        title: 'Please verify your email again',
        detail: 'Your verification has expired. It only takes a moment.',
        canRetry: true,
      }

    /**
     * The order named a different address than the one verified. Reachable if someone
     * edits the email field after verifying, so the message says exactly that.
     */
    case 'EMAIL_MISMATCH':
      return {
        title: 'That is not the address you verified',
        detail: error.details?.verifiedEmail
          ? `This order has to use ${error.details.verifiedEmail}, or verify the new address instead.`
          : detail,
        canRetry: true,
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
