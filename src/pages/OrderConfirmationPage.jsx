import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import { fetchOrderByNumber } from '../lib/api'
import { describeCheckoutError } from '../lib/checkout'

/**
 * The order confirmation.
 *
 * Reached two ways, and both matter:
 *
 * 1. **Straight after placing it**, with the order handed over in router state. No
 *    request, no spinner — the server already returned the full order and re-fetching it
 *    to render the same thing would only add a way to fail.
 *
 * 2. **On a reload, or from a bookmark**, where that state is gone. Then the order has to
 *    be fetched, and the API requires the phone it was placed with: order numbers run in
 *    sequence, so without that anyone could count through the day's orders. So the page
 *    asks for the phone number rather than pretending the order has vanished.
 */

const STATUS_COPY = {
  placed: { label: 'Order received', note: 'We are confirming it with the shop now.' },
  confirmed: { label: 'Confirmed', note: 'The shop has your order and will start it shortly.' },
  preparing: { label: 'Being made', note: 'Your order is being prepared right now.' },
  out_for_delivery: { label: 'On its way', note: 'Your rider is heading to you.' },
  ready_for_pickup: { label: 'Ready to collect', note: 'Come by whenever you are ready.' },
  completed: { label: 'Completed', note: 'Enjoy — and thank you.' },
  failed: { label: 'Could not be completed', note: '' },
}

/** Nothing transitions out of these, so there is nothing left to poll for. */
const TERMINAL = new Set(['completed', 'failed'])

/**
 * The steps this order will pass through, which differ by fulfilment: a pickup order
 * is never `out_for_delivery`, and a delivery order is never `ready_for_pickup`.
 * Mirrors `ORDER_STATUS_FLOW` and `HANDOVER_STATUSES` on the server.
 */
function stepsFor(fulfilment) {
  return [
    'placed',
    'confirmed',
    'preparing',
    fulfilment === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup',
    'completed',
  ]
}

/**
 * How often to ask the server whether anything moved.
 *
 * There is no websocket or SSE on the API, so tracking is polling. Fifteen seconds is
 * chosen against what is actually being watched: a kitchen ticket moves on a scale of
 * minutes, so a faster poll would multiply requests without a customer ever noticing
 * the difference.
 */
const POLL_MS = 15000

/** The progress rail. Shown only while the order is still on the happy path. */
function StatusTrail({ status, fulfilment }) {
  const steps = stepsFor(fulfilment)
  const currentIndex = steps.indexOf(status)

  return (
    <ol className="list-none m-0 mt-4 p-0 flex flex-col gap-0">
      {steps.map((step, index) => {
        const done = index < currentIndex
        const current = index === currentIndex
        return (
          <li key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center self-stretch">
              <span
                className={`w-3 h-3 rounded-full shrink-0 mt-1 ${
                  done ? 'bg-accent' : current ? 'bg-accent ring-4 ring-accent/25' : 'bg-[#dfe4e8]'
                }`}
              />
              {index < steps.length - 1 && (
                <span className={`w-px flex-1 min-h-[1.1rem] ${done ? 'bg-accent' : 'bg-[#dfe4e8]'}`} />
              )}
            </div>
            <span
              className={`pb-3 text-xs ${
                current
                  ? 'font-display font-bold text-black'
                  : done
                    ? 'text-text-body'
                    : 'text-[#b6bfc7]'
              }`}
            >
              {STATUS_COPY[step]?.label ?? step}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Money({ label, value, strong }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className={`text-xs ${strong ? 'font-display font-bold text-black' : 'text-text-body'}`}>
        {label}
      </span>
      <span
        className={`font-price ${strong ? 'font-bold text-lg text-accent' : 'text-sm text-black'}`}
      >
        {value}
      </span>
    </div>
  )
}

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams()
  const { state } = useLocation()

  const [order, setOrder] = useState(state?.order ?? null)
  const [phone, setPhone] = useState('')
  const [looking, setLooking] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Keep the page honest while the kitchen works.
   *
   * Depends on `status` and not on `order`, deliberately: every poll produces a new
   * object, so depending on the order would tear down and rebuild the interval on each
   * tick. Keyed on the status instead, the effect re-runs only when something actually
   * changed — and stops for good once the order reaches a terminal state.
   *
   * The phone is read off the order we already hold. That is the same credential the
   * lookup form asks for, so polling needs nothing the page did not already have.
   */
  const status = order?.status
  const contactPhone = order?.contact?.phone

  useEffect(() => {
    if (!status || TERMINAL.has(status) || !contactPhone) return

    const controller = new AbortController()
    let cancelled = false

    const refresh = async () => {
      // A backgrounded tab is nobody watching. Skipping the request there keeps a phone
      // in someone's pocket from polling all afternoon.
      if (document.visibilityState === 'hidden') return

      try {
        const data = await fetchOrderByNumber(orderNumber, contactPhone, {
          signal: controller.signal,
        })
        if (!cancelled && data?.order) setOrder(data.order)
      } catch {
        // Deliberately silent. The customer already has a correct view of their order;
        // replacing it with a network error because one poll missed would be a
        // downgrade. The next tick will catch up.
      }
    }

    const timer = setInterval(refresh, POLL_MS)
    // Coming back to the tab is the moment the answer is most likely to be stale, so
    // refresh then rather than waiting out the rest of the interval.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      controller.abort()
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [status, contactPhone, orderNumber])

  async function handleLookup(event) {
    event.preventDefault()
    if (!phone.trim() || looking) return

    setLooking(true)
    setError(null)
    try {
      const data = await fetchOrderByNumber(orderNumber, phone.replace(/[\s()-]/g, ''))
      setOrder(data.order)
    } catch (caught) {
      // A wrong phone comes back as a 404, not a 403 — the API deliberately does not
      // confirm that an order number exists to someone who cannot prove it is theirs.
      setError(
        caught?.status === 404
          ? {
              title: 'We could not find that order',
              detail: 'Check the number and use the mobile number the order was placed with.',
            }
          : describeCheckoutError(caught)
      )
    } finally {
      setLooking(false)
    }
  }

  /* ---- Reloaded without the order in hand: ask for the phone ---- */
  if (!order) {
    return (
      <>
        <ShopNav />
        <section className="max-w-[520px] mx-auto pt-6 px-5 pb-16 lg:pt-12 lg:px-0">
          <h1 className="mb-2 mt-0 font-display font-bold text-2xl text-accent">
            Order {orderNumber}
          </h1>
          <p className="mt-0 mb-6 text-sm text-text-body">
            Enter the mobile number this order was placed with to see it.
          </p>

          {error && (
            <div
              className="mb-4 rounded-xl border border-[#f0c8c2] bg-[#fdf3f1] px-4 py-3 text-[#8c2f1d]"
              role="status"
            >
              <p className="m-0 font-display font-bold text-xs">{error.title}</p>
              <p className="mt-1 mb-0 text-[0.75rem]">{error.detail}</p>
            </div>
          )}

          <form onSubmit={handleLookup}>
            <input
              className="w-full h-11 px-3 rounded-lg border border-border-light bg-white font-display text-sm text-black outline-none focus:border-accent"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03001234567"
              inputMode="tel"
              autoComplete="tel"
            />
            <button
              type="submit"
              disabled={looking || !phone.trim()}
              className={`mt-3 w-full h-12 rounded-lg font-display font-bold text-sm ${
                looking || !phone.trim()
                  ? 'bg-accent/40 text-white cursor-not-allowed'
                  : 'bg-accent text-white cursor-pointer'
              }`}
            >
              {looking ? 'Looking…' : 'Find my order'}
            </button>
          </form>
        </section>
        <Footer />
      </>
    )
  }

  // Named `statusCopy`, not `status` — `status` above is the raw value the poll watches.
  const statusCopy = STATUS_COPY[order.status] ?? { label: order.status, note: '' }
  const isDelivery = order.fulfilment === 'delivery'
  const isFinished = TERMINAL.has(order.status)

  return (
    <>
      <ShopNav />

      <section className="max-w-[640px] mx-auto pt-6 px-5 pb-16 lg:pt-12 lg:px-0">
        <div className="text-center mb-8">
          <p className="m-0 text-3xl" aria-hidden="true">
            🍩
          </p>
          <h1 className="mt-3 mb-1 font-display font-bold text-2xl text-accent lg:text-3xl">
            Thanks, {order.contact.name.split(' ')[0]}!
          </h1>
          <p className="m-0 font-display text-sm text-text-body">
            Your order number is{' '}
            <strong className="text-black">{order.orderNumber}</strong>
          </p>
        </div>

        <div className="mb-4 bg-white rounded-2xl border border-[#ececec] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="m-0 font-display font-bold text-sm text-black">{statusCopy.label}</p>
              {statusCopy.note && (
                <p className="mt-1 mb-0 text-xs text-text-body">{statusCopy.note}</p>
              )}
            </div>

            {/* Only claim to be live while something is actually being polled. On a
                finished order the label would be a small lie. */}
            {!isFinished && (
              <span className="flex items-center gap-1.5 shrink-0 text-[0.65rem] text-text-body">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-accent opacity-60 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-accent" />
                </span>
                Live
              </span>
            )}
          </div>

          {order.failureReason && (
            <p className="mt-2 mb-0 text-xs text-[#8c2f1d]">Reason: {order.failureReason}</p>
          )}

          {order.promisedAt && !isFinished && (
            <p className="mt-2 mb-0 text-xs text-text-body">
              {isDelivery ? 'Expected by' : 'Ready by'}{' '}
              {new Date(order.promisedAt).toLocaleTimeString('en-PK', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          )}

          {/* A failed order never finished the sequence, so drawing the rail would
              suggest steps that are still coming. */}
          {order.status !== 'failed' && (
            <StatusTrail status={order.status} fulfilment={order.fulfilment} />
          )}
        </div>

        <div className="mb-4 bg-white rounded-2xl border border-[#ececec] p-5">
          <h2 className="mt-0 mb-3 font-display font-bold text-sm text-black">
            {isDelivery ? 'Delivering to' : 'Collect from'}
          </h2>

          {isDelivery ? (
            <p className="m-0 text-xs text-text-body leading-relaxed">
              {order.address?.line1}
              {order.address?.area && `, ${order.address.area}`}
              {order.address?.city && `, ${order.address.city}`}
              {order.address?.notes && (
                <>
                  <br />
                  <span className="italic">“{order.address.notes}”</span>
                </>
              )}
              <br />
              From {order.branch?.name}
            </p>
          ) : (
            <p className="m-0 text-xs text-text-body leading-relaxed">
              {order.branch?.name}
              {order.branch?.address && (
                <>
                  <br />
                  {order.branch.address}
                </>
              )}
            </p>
          )}

          {order.branch?.phone && (
            <p className="mt-3 mb-0 text-xs">
              <a href={`tel:${order.branch.phone}`} className="text-accent font-display font-bold">
                Call the shop: {order.branch.phone}
              </a>
            </p>
          )}
        </div>

        <div className="mb-4 bg-white rounded-2xl border border-[#ececec] p-5">
          <h2 className="mt-0 mb-3 font-display font-bold text-sm text-black">What you ordered</h2>

          <ul className="list-none m-0 p-0 mb-3">
            {order.items.map((item, index) => (
              <li key={index} className="py-1.5 border-b border-border-light last:border-b-0">
                <div className="flex justify-between gap-3">
                  <span className="text-xs text-black">
                    {item.qty} × {item.name}
                  </span>
                  <span className="font-price font-bold text-xs text-black shrink-0">
                    {item.lineTotal.formatted}
                  </span>
                </div>
                {/* A box prints as one line on the kitchen ticket but is itemised here,
                    because "Box of 4" tells the customer nothing about what is in it. */}
                {item.kind === 'box' && item.children?.length > 0 && (
                  <p className="mt-1 mb-0 text-[0.7rem] text-text-body">
                    {item.children.map((child) => child.name).join(', ')}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="border-t border-border-light pt-2">
            <Money label="Subtotal" value={order.totals.subtotal.formatted} />
            {order.totals.deliveryFee.amount > 0 && (
              <Money label="Delivery" value={order.totals.deliveryFee.formatted} />
            )}
            <Money label="Total to pay" value={order.totals.grandTotal.formatted} strong />
          </div>

          <p className="mt-3 mb-0 text-[0.7rem] text-text-body">
            {order.payment.status === 'collected'
              ? 'Paid in cash.'
              : 'Please have the cash ready — you pay when it arrives.'}
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/products"
            className="inline-block h-11 px-6 leading-[2.75rem] bg-accent text-white no-underline rounded-lg font-display font-bold text-sm"
          >
            Order something else
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
