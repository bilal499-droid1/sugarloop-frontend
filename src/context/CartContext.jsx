import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PRODUCTS } from '../components/products/productsData'

const CartContext = createContext(null)

// Versioned so a future change to the item shape can bump the key instead of
// trying to migrate whatever is already in people's browsers.
const STORAGE_KEY = 'sugarloop.cart.v1'

// Catalogue images are hashed build artifacts (a1-Cvv41XKx.jpeg), so a stored URL
// goes stale the moment the site is rebuilt. Anything with a catalogue id gets its
// name/price/image re-read from PRODUCTS on load; that also means a price change
// on the site is reflected in carts that were saved before it.
function rehydrate(item) {
  const product = PRODUCTS.find((p) => p.id === item.id)
  if (!product) return item
  return {
    ...item,
    name: product.name,
    price: product.price,
    image: product.images?.[0],
  }
}

// localStorage throws in Safari private mode and when the quota is full, and the
// stored JSON can be anything if a user has edited it - so every read is guarded
// and anything malformed is dropped rather than crashing the app on boot.
function readStoredCart() {
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
      .map(rehydrate)
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  // Lazy initialiser: reads storage once on mount instead of on every render.
  const [items, setItems] = useState(readStoredCart)

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
      if (e.key === STORAGE_KEY) setItems(readStoredCart())
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
            name: product.name,
            price: product.price,
            image: product.image ?? product.images?.[0],
            qty,
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
