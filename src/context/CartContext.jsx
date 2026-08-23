import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useCatalogue } from './CatalogueContext'

const CartContext = createContext(null)

// Versioned so a future change to the item shape can bump the key instead of
// trying to migrate whatever is already in people's browsers.
const STORAGE_KEY = 'sugarloop.cart.v1'

// Catalogue images are hashed build artifacts (a1-Cvv41XKx.jpeg), so a stored URL
// goes stale the moment the site is rebuilt. Anything with a catalogue id gets its
// name/price/image re-read from the catalogue on load; that also means a price change
// is reflected in carts that were saved before it.
//
// The catalogue is now passed in rather than imported, because it may be the LIVE one
// from the API. A cart line showing a price the products page no longer agrees with is
// the kind of discrepancy a customer notices at exactly the wrong moment.
//
// An item with no match is left exactly as stored — a discontinued product is not
// silently deleted from someone's cart here. The server refuses it at quote time with
// ITEMS_UNAVAILABLE, naming the item, which is a better place to explain it than a
// line vanishing on page load with no account of why.
//
// `apiId` (the Mongo _id) is re-read alongside the price because checkout identifies
// products by it. It only exists once the LIVE catalogue has loaded — the bundled
// fallback has no such id — which is why a cart can be perfectly displayable and still
// not be orderable. `checkout.js` is what notices that.
function rehydrate(item, catalogue) {
  // A box is priced from its contents, not from a catalogue row of its own, so it
  // rehydrates by re-reading every child. Without this a saved box would keep quoting
  // whatever its contents cost on the day it was built.
  if (item.kind === 'box') return rehydrateBox(item, catalogue)

  const product = catalogue.find((p) => String(p.id) === String(item.id))
  if (!product) return item
  return {
    ...item,
    apiId: product.apiId,
    name: product.name,
    price: product.price,
    image: product.images?.[0],
  }
}

/**
 * A Build Your Box line.
 *
 * `contents` holds the LOCAL catalogue ids of everything in the box, in the order they
 * were placed. Storing the contents rather than just the total is what makes the box
 * orderable at all: `POST /orders` takes `{ kind: 'box', boxSize, productIds }` and
 * prices it server-side, so a box that remembers only its own total cannot be sent.
 *
 * A child that has vanished from the catalogue is kept in place rather than dropped —
 * silently shrinking a box of 6 into a box of 5 would fail the server's "exactly N
 * items" check with a confusing message. Left intact, `checkout.js` can say plainly
 * that the box needs rebuilding.
 */
function rehydrateBox(item, catalogue) {
  const children = (item.contents ?? []).map((id) =>
    catalogue.find((p) => String(p.id) === String(id))
  )

  if (children.some((child) => !child)) return item

  return {
    ...item,
    price: children.reduce((sum, child) => sum + child.price, 0),
    image: children[0]?.images?.[0],
    childApiIds: children.map((child) => child.apiId),
  }
}

// localStorage throws in Safari private mode and when the quota is full, and the
// stored JSON can be anything if a user has edited it - so every read is guarded
// and anything malformed is dropped rather than crashing the app on boot.
function readStoredCart(catalogue) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item) =>
          item &&
          (typeof item.id === 'number' || typeof item.id === 'string') &&
          Number.isFinite(item.qty) &&
          item.qty > 0
      )
      .map((item) => rehydrate(item, catalogue))
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { products } = useCatalogue()

  // The storage listener below is registered once and must not be torn down and
  // rebuilt every time the catalogue updates, so it reads the current catalogue
  // through a ref rather than closing over a stale one.
  //
  // Synced in an effect rather than assigned during render. A render can be discarded or
  // replayed under concurrent rendering, so writing here during render can leave the ref
  // holding a catalogue that never committed. The only reader is the storage handler,
  // which fires long after commit, so an effect is always soon enough.
  const catalogueRef = useRef(products)
  useEffect(() => {
    catalogueRef.current = products
  }, [products])

  // Lazy initialiser: reads storage once on mount instead of on every render. At this
  // point `products` is still the bundled catalogue, so this is synchronous and the
  // first paint is unchanged — the live prices arrive in the effect below.
  const [items, setItems] = useState(() => readStoredCart(products))

  // When the API catalogue lands, re-read names and prices off it. Without this a
  // returning customer's saved cart would keep quoting whatever the prices were on the
  // day the bundle was built, while the products page showed the live ones.
  useEffect(() => {
    setItems((current) => current.map((item) => rehydrate(item, products)))
  }, [products])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Out of quota or storage blocked - the cart still works for this session.
    }
  }, [items])

  // Keeps tabs in sync: adding from one tab updates the badge in the others.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setItems(readStoredCart(catalogueRef.current))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => {
    const addItem = (product, qty = 1) => {
      if (!product?.id || !Number.isFinite(qty) || qty < 1) return
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id)
        if (existing) {
          return current.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + qty } : item
          )
        }
        return [
          ...current,
          {
            id: product.id,
            // Carried so checkout can name this product to the API without re-fetching
            // the catalogue to look it up. Absent on the bundled fallback.
            apiId: product.apiId,
            name: product.name,
            price: product.price,
            image: product.image ?? product.images?.[0],
            qty,
            // Set by addBox; a plain catalogue product has no kind and defaults to one.
            ...(product.kind ? { kind: product.kind } : {}),
            ...(product.boxSize ? { boxSize: product.boxSize } : {}),
            ...(product.contents ? { contents: product.contents } : {}),
            ...(product.childApiIds ? { childApiIds: product.childApiIds } : {}),
          },
        ]
      })
    }

    const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id))

    // qty <= 0 removes the line, which is what a quantity stepper stepping past 1
    // should do rather than leaving a zero-quantity row behind.
    const setQty = (id, qty) => {
      if (!Number.isFinite(qty)) return
      if (qty < 1) return removeItem(id)
      setItems((current) => current.map((item) => (item.id === id ? { ...item, qty } : item)))
    }

    const clear = () => setItems([])

    return {
      items,
      addItem,
      removeItem,
      setQty,
      clear,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside a CartProvider')
  return context
}
