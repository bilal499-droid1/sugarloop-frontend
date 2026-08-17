import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchProducts, isApiConfigured } from '../lib/api'
import { LOCAL_PRODUCTS, mergeCatalogue } from '../lib/catalogue'
import { useBranch } from './BranchContext'

/**
 * The catalogue, live where possible and bundled where not.
 *
 * **It never renders empty and it never renders a spinner.** State starts as the
 * bundled catalogue — the exact array that shipped before the backend existed — so the
 * first paint is identical to today's, with no loading flash and no layout shift. The
 * API request happens in the background; if it succeeds the list is swapped for the
 * live one, and if it fails nothing visible happens at all.
 *
 * That ordering is deliberate for a storefront. The alternative — fetch first, render
 * when it lands — buys nothing (we already have a good answer on disk) and costs a
 * blank menu on every slow connection, plus a permanently blank one on any outage.
 *
 * `status` is published for anyone who wants to surface staleness, but nothing is
 * required to read it.
 */
const CatalogueContext = createContext(null)

export function CatalogueProvider({ children }) {
  const [products, setProducts] = useState(LOCAL_PRODUCTS)

  /**
   * The branch drives a refetch, because `inStock` only exists in the response when the
   * request names one. Changing branch therefore has to re-ask rather than re-filter:
   * the availability of every product may differ, and nothing in the current list can
   * be reused to work it out.
   */
  const { branchId } = useBranch()

  // 'bundled'  showing what shipped in this build — no API configured, or none yet
  // 'live'     showing what the API returned
  // 'stale'    the API was configured but did not answer; still showing the bundle
  const [status, setStatus] = useState(isApiConfigured ? 'bundled' : 'bundled')

  useEffect(() => {
    if (!isApiConfigured) return

    // Aborted on unmount so a slow response cannot call setState afterwards, and in
    // StrictMode's double-invoked effect the first run is cancelled rather than racing
    // the second to write the same state. It also cancels the in-flight request for the
    // previous branch when the visitor switches, so a slow answer for the old branch
    // cannot land after the new one and mislabel what is sold out.
    const controller = new AbortController()
    let active = true

    fetchProducts({ branchId, signal: controller.signal })
      .then((data) => {
        if (!active) return

        // An empty or malformed payload is treated as a failure, not as "the menu is
        // empty now". A seeding accident on the API must not blank the storefront.
        if (!Array.isArray(data) || data.length === 0) {
          setStatus('stale')
          return
        }

        setProducts(mergeCatalogue(data))
        setStatus('live')
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return

        // Deliberately not surfaced to the visitor: they still have a complete menu.
        // Logged so it is visible in the console and to error reporting later.
        console.warn('[catalogue] falling back to the bundled menu:', error?.message ?? error)
        setStatus('stale')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [branchId])

  const value = useMemo(
    () => ({
      products,
      status,
      isLive: status === 'live',
      /** Cheap lookup for the cart and the detail page. Ids may be number or string. */
      findById: (id) => products.find((product) => String(product.id) === String(id)),
    }),
    [products, status]
  )

  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>
}

export function useCatalogue() {
  const context = useContext(CatalogueContext)
  if (!context) throw new Error('useCatalogue must be used inside a CatalogueProvider')
  return context
}
