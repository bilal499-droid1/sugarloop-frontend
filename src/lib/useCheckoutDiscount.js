import { useEffect, useState } from 'react'
import { fetchShopSettings, isApiConfigured } from './api'
import { DEFAULT_CHECKOUT_DISCOUNT_PERCENT } from './checkout'

/**
 * The checkout discount staff have set, for the "x% off" labels.
 *
 * Asked once per page load and shared: the cart and checkout pages both want it, and
 * the answer does not change between them often enough to ask twice. Until it arrives,
 * or if the API cannot be reached, the default is shown. That is only ever a label: the
 * server's quote is what an order is charged.
 */
let pending = null
let known = null

function load() {
  if (!pending) {
    pending = fetchShopSettings()
      .then((settings) => {
        known = settings.checkoutDiscountPercent
        return known
      })
      .catch(() => {
        // Let the next page ask again rather than keep a failure for the whole visit.
        pending = null
        return DEFAULT_CHECKOUT_DISCOUNT_PERCENT
      })
  }
  return pending
}

export function useCheckoutDiscount() {
  const [percent, setPercent] = useState(known ?? DEFAULT_CHECKOUT_DISCOUNT_PERCENT)

  useEffect(() => {
    if (!isApiConfigured) return undefined

    let live = true
    load().then((value) => {
      if (live) setPercent(value)
    })
    return () => {
      live = false
    }
  }, [])

  return percent
}
