/**
 * The Meta (Facebook) Pixel: what a visitor from an ad does once they reach the shop.
 *
 * Off unless `VITE_META_PIXEL_ID` is set at build time. With no id nothing is loaded and
 * every call here is a no-op, so a preview build or a laptop never reports to Meta.
 *
 * Loaded from here rather than pasted into index.html for that reason, and because Meta's
 * snippet fires a PageView on load. This is a single-page app, so `MetaPixelRouteTracker`
 * fires one per route change instead — the snippet's would double-count the first page.
 *
 * Purchase is the one event with a server twin. The API sends the same order to Meta's
 * Conversions API and returns `metaEventId`; passing that as the Pixel's `eventID` is how
 * Meta recognises the two as one purchase. Every other event is browser-only.
 */

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID?.trim()

export const isMetaPixelEnabled = () => Boolean(PIXEL_ID)

let loaded = false

/** Meta's base code, unminified. Queues calls until fbevents.js arrives. */
function load() {
  if (loaded || !PIXEL_ID || typeof window === 'undefined') return
  loaded = true

  if (!window.fbq) {
    const fbq = function (...args) {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue.push(args)
    }
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    window.fbq = fbq
    window._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  window.fbq('init', PIXEL_ID)
}

/**
 * Sends one standard event. Never throws: an ad blocker removing `fbq`, or anything else
 * going wrong in Meta's script, must not break a page.
 */
export function track(name, data = {}, eventId) {
  if (!PIXEL_ID) return
  try {
    load()
    window.fbq('track', name, data, eventId ? { eventID: eventId } : undefined)
  } catch {
    // Tracking is never worth an error on screen.
  }
}

/** The staff console is not the shop. Nobody there came from an ad. */
export const isTrackedPath = (pathname) => !pathname.startsWith('/staff')

/**
 * The id Meta's catalogue knows a product by. The sku where the live catalogue supplies
 * one — the same id the server sends — and the local id on the bundled fallback.
 */
const contentId = (product) => String(product.sku ?? product.id)

/** A built box is not a catalogue product, so it is named by its size. */
const lineId = (line) => (line.kind === 'box' ? `box-${line.boxSize}` : contentId(line))

/** Prices in the storefront are already rupees. See lib/catalogue.js. */
export function trackViewContent(product) {
  track('ViewContent', {
    content_ids: [contentId(product)],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'PKR',
  })
}

export function trackAddToCart(product, qty) {
  track('AddToCart', {
    content_ids: [lineId(product)],
    content_name: product.name,
    content_type: 'product',
    contents: [{ id: lineId(product), quantity: qty }],
    value: product.price * qty,
    currency: 'PKR',
  })
}

export function trackInitiateCheckout(items, subtotal) {
  track('InitiateCheckout', {
    content_ids: items.map(lineId),
    num_items: items.reduce((sum, item) => sum + item.qty, 0),
    value: subtotal,
    currency: 'PKR',
  })
}

/**
 * The order as the API returned it. Its money is `{ amount, formatted }` in hundredths,
 * and its ids mirror the server's event exactly, so the two copies describe the same
 * purchase.
 */
export function trackPurchase(order) {
  const ids = order.items.map((item) => item.sku ?? item.productId ?? item.name)

  track(
    'Purchase',
    {
      content_ids: ids,
      content_type: 'product',
      contents: order.items.map((item, index) => ({
        id: ids[index],
        quantity: item.qty,
        item_price: item.unitPrice.amount / 100,
      })),
      num_items: order.items.reduce((sum, item) => sum + item.qty, 0),
      value: order.totals.grandTotal.amount / 100,
      currency: 'PKR',
      order_id: order.orderNumber,
    },
    order.metaEventId
  )
}
