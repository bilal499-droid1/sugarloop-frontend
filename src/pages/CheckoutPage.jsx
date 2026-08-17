import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useBranch } from '../context/BranchContext'
import { useCatalogue } from '../context/CatalogueContext'
import { isApiConfigured, placeOrder, quoteCart } from '../lib/api'
import { describeCheckoutError, findUnorderableLines, toApiItems } from '../lib/checkout'
import { reverseGeocode } from '../lib/geocode'

/**
 * Checkout.
 *
 * The one rule this page exists to respect: **it never computes a total.** Every number
 * on screen comes from `POST /checkout/quote`. The cart's own subtotal is good enough to
 * show someone what they picked, but it does not know about the delivery fee, the Rs 500
 * minimum, the 2 km radius, whether the shop is open, or whether a tray emptied thirty
 * seconds ago. So the summary panel stays empty until the server has answered, and what
 * it then shows is the server's numbers verbatim.
 */

const FULFILMENT = { DELIVERY: 'delivery', PICKUP: 'pickup' }

/** Matches the API's own rule (`order.validator.js`) so the refusal happens before the trip. */
const PK_MOBILE = /^(\+92|92|0)3\d{9}$/

function normalisePhone(value) {
  return value.replace(/[\s()-]/g, '')
}

/* -------------------------------------------------------------------------- */

function Field({ label, hint, error, children }) {
  return (
    // data-invalid is what handleSubmit scrolls to — the first failing field on the page.
    <label className="block mb-4" data-invalid={error ? 'true' : undefined}>
      <span className="block mb-1 font-display font-bold text-xs text-black">{label}</span>
      {hint && <span className="block mb-1.5 text-[0.7rem] text-text-body">{hint}</span>}
      {children}
      {error && <span className="block mt-1 text-[0.7rem] text-[#c0392b]">{error}</span>}
    </label>
  )
}

const inputClass =
  'w-full h-11 px-3 rounded-lg border border-border-light bg-white font-display text-sm text-black outline-none focus:border-accent'

function Card({ title, children }) {
  return (
    <div className="mb-4 bg-white rounded-2xl border border-[#ececec] p-5">
      <h2 className="mt-0 mb-4 font-display font-bold text-base text-black">{title}</h2>
      {children}
    </div>
  )
}

/** A refusal the customer has to act on, rather than a spinner that never resolves. */
function Notice({ title, detail, tone = 'error' }) {
  const palette =
    tone === 'error'
      ? 'border-[#f0c8c2] bg-[#fdf3f1] text-[#8c2f1d]'
      : 'border-[#cfe0ef] bg-[#f2f8fd] text-[#1d5480]'

  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 ${palette}`} role="status">
      <p className="m-0 font-display font-bold text-xs">{title}</p>
      {detail && <p className="mt-1 mb-0 text-[0.75rem] leading-snug">{detail}</p>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clear } = useCart()
  const { branches } = useBranch()
  const { status: catalogueStatus } = useCatalogue()

  const [fulfilment, setFulfilment] = useState(FULFILMENT.DELIVERY)
  const [branchCode, setBranchCode] = useState('')
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState(null)
  /** The human-readable place the pin landed on — shown so the customer can see at a
   *  glance that it found the right street, rather than trusting a bare tick. */
  const [placeLabel, setPlaceLabel] = useState(null)

  const [contact, setContact] = useState({ name: '', phone: '' })
  const [address, setAddress] = useState({ line1: '', area: '', city: 'Islamabad', notes: '' })

  const [quote, setQuote] = useState(null)
  const [quoting, setQuoting] = useState(false)
  const [quoteError, setQuoteError] = useState(null)

  /**
   * Bumped to force a re-price when nothing about the REQUEST changed but the answer
   * did — the server rejecting a stale total is the case that matters. Without this the
   * quote effect would not re-run (its inputs are identical) and the panel would sit
   * blank behind a message telling the customer to check a total it never re-fetched.
   */
  const [requoteNonce, setRequoteNonce] = useState(0)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [touched, setTouched] = useState(false)

  /**
   * Checkout identifies products by their Mongo id, which only the live catalogue
   * carries. On the bundled fallback there is nothing to send, so the page says so
   * plainly instead of failing at the first request with a validation error.
   */
  const unorderable = useMemo(() => findUnorderableLines(items), [items])
  const canReachApi = isApiConfigured && catalogueStatus === 'live'

  const pickupBranches = useMemo(
    () => branches.filter((branch) => branch.fulfilment?.includes(FULFILMENT.PICKUP)),
    [branches]
  )

  const isDelivery = fulfilment === FULFILMENT.DELIVERY

  /** Everything the server needs to price this cart, or null while it is incomplete. */
  const quoteRequest = useMemo(() => {
    if (!canReachApi || items.length === 0 || unorderable.length > 0) return null
    if (isDelivery && !location) return null
    if (!isDelivery && !branchCode) return null

    return {
      fulfilment,
      items: toApiItems(items),
      ...(isDelivery ? { location } : { branchCode }),
    }
  }, [canReachApi, items, unorderable, isDelivery, location, branchCode, fulfilment])

  /**
   * Re-price whenever anything that affects the price changes.
   *
   * Debounced because the delivery branch is resolved from coordinates and the cart can
   * change several times in a second while someone adjusts quantities — each of those is
   * a geo query the server would otherwise run and throw away. The abort matters more:
   * without it a slow answer for the previous cart can land after a fast one for the
   * current cart and show a total for goods the customer no longer has.
   */
  useEffect(() => {
    if (!quoteRequest) {
      setQuote(null)
      setQuoteError(null)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(() => {
      setQuoting(true)
      quoteCart(quoteRequest, { signal: controller.signal })
        .then((data) => {
          setQuote(data.quote)
          setQuoteError(null)
        })
        .catch((error) => {
          if (error?.name === 'AbortError') return
          setQuote(null)
          setQuoteError(describeCheckoutError(error))
        })
        .finally(() => {
          if (!controller.signal.aborted) setQuoting(false)
        })
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [quoteRequest, requoteNonce])

  /**
   * Coordinates for delivery.
   *
   * ⚠️ Interim. The API resolves a delivery branch from `{ lat, lng }` because address
   * geocoding (Step 9, `POST /branches/resolve`) is not built yet. So the browser is
   * asked where it is, and the typed address rides along for the rider to actually find
   * the door. When geocoding lands this button becomes optional rather than required.
   */
  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('This browser cannot share a location. You can collect your order instead.')
      return
    }

    setLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const point = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        }
        setLocation(point)

        /**
         * Fill the address in from the pin, as a starting point the customer corrects.
         *
         * Two rules here. It only ever writes into a field that is still EMPTY — someone
         * who has already typed their address must not have it overwritten by a
         * geocoder's guess. And it is awaited but never allowed to fail the operation:
         * the coordinates are what price and route the order, so a geocoder that is slow
         * or down costs an autofill, not a checkout.
         */
        const resolved = await reverseGeocode(point)
        if (resolved) {
          setPlaceLabel(resolved.label)
          setAddress((current) => ({
            ...current,
            line1: current.line1 || resolved.line1,
            area: current.area || resolved.area,
            city: current.city || resolved.city,
          }))
        }

        setLocating(false)
      },
      (error) => {
        setLocating(false)
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was declined. We need it to find your nearest shop — or you can collect your order instead.'
            : 'We could not read your location. Try again, or collect your order instead.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  /* ---------------------------------------------------------------------- */

  const errors = {}
  if (!contact.name.trim() || contact.name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!PK_MOBILE.test(normalisePhone(contact.phone)))
    errors.phone = 'Enter a Pakistani mobile number, e.g. 03001234567.'
  if (isDelivery && address.line1.trim().length < 5)
    errors.line1 = 'A street address is required so the rider can find you.'
  if (isDelivery && !location) errors.location = 'We need your location to find your nearest shop.'
  if (!isDelivery && !branchCode) errors.branchCode = 'Choose which shop you will collect from.'

  const isValid = Object.keys(errors).length === 0

  /**
   * The button is NOT disabled for an incomplete form, and that is deliberate.
   *
   * Field errors only appear once the customer has tried to submit. If an incomplete
   * form also disabled the button, the two rules would trap each other: nothing explains
   * what is missing until you submit, and you cannot submit. Someone with an empty name
   * field would be left clicking a dead button with no idea why. So the click always
   * lands — it just reveals the errors instead of sending.
   *
   * What genuinely does disable it is the absence of a server-priced total. Placing an
   * order needs an `expectedTotal` that the customer was actually shown, and there is no
   * honest way to submit without one.
   */
  const canSubmit = Boolean(quote) && !submitting

  /** Why the button cannot go through yet, in the order the customer should fix it. */
  const blockingReason = (() => {
    if (unorderable.length > 0) return 'Remove and re-add the items flagged above.'
    if (!canReachApi) return null
    if (quoting) return 'Working out your total…'
    if (quoteError) return quoteError.title
    if (!quote) {
      return isDelivery
        ? 'Share your location to see your total.'
        : 'Choose a shop to see your total.'
    }
    if (touched && !isValid) return 'Please fix the highlighted fields above.'
    return null
  })()

  // Held in a ref so a double-click cannot start two orders: state updates are batched
  // and the second click can read the old `submitting` before React has re-rendered.
  const inFlight = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched(true)

    // An incomplete form stops here, having just revealed its errors. Scroll the first
    // one into view — on a phone the offending field is usually off-screen above the
    // button, and an error nobody can see is the same as no error at all.
    if (!isValid) {
      requestAnimationFrame(() => {
        document
          .querySelector('[data-invalid="true"]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }

    if (!canSubmit || inFlight.current) return

    inFlight.current = true
    setSubmitting(true)
    setSubmitError(null)

    try {
      const { order } = await placeOrder({
        ...quoteRequest,
        contact: { name: contact.name.trim(), phone: normalisePhone(contact.phone) },
        ...(isDelivery
          ? {
              address: {
                line1: address.line1.trim(),
                area: address.area.trim() || undefined,
                city: address.city.trim() || 'Islamabad',
                notes: address.notes.trim() || undefined,
              },
            }
          : {}),
        // The number the customer was actually shown. The server re-prices and refuses
        // if it has moved, rather than quietly charging the new one.
        expectedTotal: quote.totals.grandTotal.amount,
      })

      // Cleared only after the server has confirmed. Clearing on click would lose the
      // cart of anyone whose order was refused for being under the minimum.
      clear()
      navigate(`/order/${order.orderNumber}`, { replace: true, state: { order } })
    } catch (error) {
      setSubmitError(describeCheckoutError(error))
      // A total that moved is dropped and re-fetched, so the panel shows the NEW number
      // beside the message explaining it changed — rather than leaving the old total on
      // screen next to a warning that it is wrong.
      if (error?.code === 'PRICE_CHANGED') {
        setQuote(null)
        setRequoteNonce((n) => n + 1)
      }
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  /* ---------------------------------------------------------------------- */

  if (items.length === 0) {
    return (
      <>
        <ShopNav />
        <section className="max-w-[860px] mx-auto pt-6 px-5 pb-16 lg:pt-12 lg:px-0">
          <h1 className="mb-4 mt-0 font-display font-bold text-2xl text-accent lg:text-3xl">
            Checkout
          </h1>
          <p className="m-0 text-sm text-text-body">
            Your cart is empty.{' '}
            <Link to="/products" className="text-accent font-display font-bold">
              Browse the menu
            </Link>
            .
          </p>
        </section>
        <Footer />
      </>
    )
  }

  return (
    <>
      <ShopNav />

      <section
        className="max-w-[1040px] mx-auto pt-6 px-5 pb-16 lg:pt-12 lg:px-0"
        aria-label="Checkout"
      >
        <h1 className="mb-6 mt-0 font-display font-bold text-2xl text-accent lg:text-3xl">
          Checkout
        </h1>

        {!canReachApi && (
          <Notice
            title="Online ordering is unavailable right now"
            detail="We are showing a saved menu and cannot price an order against it. Please call 051-111-557-799 to order."
          />
        )}

        {unorderable.length > 0 && (
          <Notice
            title="Some items need adding again"
            detail={`${unorderable
              .map((item) => item.name)
              .join(', ')} — please remove and re-add them from the menu.`}
          />
        )}

        <form onSubmit={handleSubmit} className="lg:flex lg:items-start lg:gap-8">
          <div className="lg:flex-1">
            <Card title="How would you like it?">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: FULFILMENT.DELIVERY, label: 'Deliver to me', note: 'Rs 100 delivery' },
                  { value: FULFILMENT.PICKUP, label: 'I will collect', note: 'No delivery fee' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFulfilment(option.value)}
                    className={`py-3 px-3 rounded-lg border text-left cursor-pointer ${
                      fulfilment === option.value
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white text-[#666] border-[#e0e0e0]'
                    }`}
                  >
                    <span className="block font-display font-bold text-sm">{option.label}</span>
                    <span className="block mt-0.5 text-[0.7rem] opacity-80">{option.note}</span>
                  </button>
                ))}
              </div>
            </Card>

            {isDelivery ? (
              <Card title="Where are we taking it?">
                <Field
                  label="Your location"
                  hint="We use this to find your nearest shop and check you are inside our 2 km delivery area."
                  error={touched ? errors.location : undefined}
                >
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className={`w-full h-11 rounded-lg border font-display font-bold text-sm cursor-pointer ${
                      location
                        ? 'border-accent text-accent bg-white'
                        : 'border-accent bg-accent text-white'
                    }`}
                  >
                    {locating
                      ? 'Finding you…'
                      : location
                        ? 'Location set ✓ — tap to update'
                        : 'Use my current location'}
                  </button>

                  {/* Confirmation the pin actually landed somewhere the customer
                      recognises. A bare tick tells them the button worked; the street
                      name tells them it worked CORRECTLY, which is the thing that
                      decides whether a rider ends up at the right door. */}
                  {location && (
                    <span className="block mt-2 text-[0.7rem] text-text-body">
                      {placeLabel ? (
                        <>
                          📍 {placeLabel}
                          <br />
                        </>
                      ) : (
                        <>
                          📍 Pinned — we could not look up the street name, so please type
                          your address below.
                          <br />
                        </>
                      )}
                      <span className="opacity-70">
                        {location.lat}, {location.lng}
                      </span>
                    </span>
                  )}
                </Field>

                {locationError && <Notice title="Location unavailable" detail={locationError} />}

                <Field label="Street address" error={touched ? errors.line1 : undefined}>
                  <input
                    className={inputClass}
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    placeholder="House 12, Street 4"
                    autoComplete="address-line1"
                  />
                </Field>

                <Field label="Area (optional)">
                  <input
                    className={inputClass}
                    value={address.area}
                    onChange={(e) => setAddress({ ...address, area: e.target.value })}
                    placeholder="DHA Phase 2"
                  />
                </Field>

                <Field label="Notes for the rider (optional)">
                  <input
                    className={inputClass}
                    value={address.notes}
                    onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                    placeholder="Blue gate, call on arrival"
                  />
                </Field>
              </Card>
            ) : (
              <Card title="Which shop will you collect from?">
                <Field label="Shop" error={touched ? errors.branchCode : undefined}>
                  <select
                    className={`${inputClass} cursor-pointer`}
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                  >
                    <option value="">Choose a shop</option>
                    {pickupBranches.map((branch) => (
                      <option key={branch.id} value={branch.code}>
                        {branch.name}
                        {branch.isAcceptingOrders ? '' : ' — closed right now'}
                      </option>
                    ))}
                  </select>
                </Field>
              </Card>
            )}

            <Card title="Who is it for?">
              <Field label="Name" error={touched ? errors.name : undefined}>
                <input
                  className={inputClass}
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  autoComplete="name"
                />
              </Field>

              <Field
                label="Mobile number"
                hint="We call this number to confirm your order."
                error={touched ? errors.phone : undefined}
              >
                <input
                  className={inputClass}
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="03001234567"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>
            </Card>
          </div>

          {/* ---- Summary: every number here came from the server ---- */}
          <aside className="lg:w-[340px] lg:shrink-0 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-[#ececec] p-5">
              <h2 className="mt-0 mb-4 font-display font-bold text-base text-black">Your order</h2>

              <ul className="list-none m-0 p-0 mb-4">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 py-1.5 text-xs">
                    <span className="text-text-body">
                      {item.qty} × {item.name}
                    </span>
                    <span className="font-price font-bold text-black shrink-0">
                      Rs {item.price * item.qty}
                    </span>
                  </li>
                ))}
              </ul>

              {quoteError && <Notice title={quoteError.title} detail={quoteError.detail} />}

              {quote ? (
                <div className="border-t border-border-light pt-3">
                  <Row label="Subtotal" value={quote.totals.subtotal.formatted} />
                  {quote.totals.deliveryFee.amount > 0 && (
                    <Row label="Delivery" value={quote.totals.deliveryFee.formatted} />
                  )}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-light">
                    <span className="font-display font-bold text-sm text-black">Total</span>
                    <span className="font-price font-bold text-lg text-accent">
                      {quote.totals.grandTotal.formatted}
                    </span>
                  </div>

                  <p className="mt-3 mb-0 text-[0.7rem] text-text-body">
                    {isDelivery ? 'Delivered from' : 'Collect from'} {quote.branch.name}
                    {quote.branch.distanceKm !== undefined && ` — ${quote.branch.distanceKm} km away`}
                    . Ready in about 45 minutes.
                  </p>

                  {quote.minutesUntilLastOrder !== null &&
                    quote.minutesUntilLastOrder <= 60 && (
                      <p className="mt-2 mb-0 text-[0.7rem] font-display font-bold text-[#8c2f1d]">
                        Last orders in {quote.minutesUntilLastOrder} minutes.
                      </p>
                    )}
                </div>
              ) : (
                <div className="border-t border-border-light pt-3">
                  <Row label="Subtotal" value={`Rs ${subtotal}`} muted />
                  <p className="mt-3 mb-0 text-[0.7rem] text-text-body">
                    {quoting
                      ? 'Working out your total…'
                      : quoteError
                        ? 'We cannot total this order yet.'
                        : isDelivery
                          ? 'Share your location to see delivery and your total.'
                          : 'Choose a shop to see your total.'}
                  </p>
                </div>
              )}

              {submitError && (
                <div className="mt-4">
                  <Notice title={submitError.title} detail={submitError.detail} />
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={`mt-4 w-full h-12 rounded-lg font-display font-bold text-sm ${
                  canSubmit
                    ? 'bg-accent text-white cursor-pointer'
                    : 'bg-accent/40 text-white cursor-not-allowed'
                }`}
              >
                {submitting ? 'Placing your order…' : 'Place order — pay cash on delivery'}
              </button>

              {/* Never let the button sit inert without saying why. */}
              {blockingReason && (
                <p className="mt-2 mb-0 text-[0.7rem] text-[#8c2f1d] text-center">
                  {blockingReason}
                </p>
              )}

              <p className="mt-3 mb-0 text-[0.68rem] text-text-body text-center">
                You pay in cash when your order arrives. No card needed.
              </p>
            </div>
          </aside>
        </form>
      </section>

      <Footer />
    </>
  )
}

function Row({ label, value, muted }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-xs text-text-body">{label}</span>
      <span className={`font-price text-sm ${muted ? 'text-text-body' : 'text-black font-bold'}`}>
        {value}
      </span>
    </div>
  )
}
