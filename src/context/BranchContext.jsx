import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchBranches, isApiConfigured } from '../lib/api'

const STORAGE_KEY = 'sugarloop.branch.v1'

const BranchContext = createContext(null)

/**
 * Which branch the visitor is shopping.
 *
 * This exists for one reason: **stock is per branch.** The API only tells us whether a
 * product is in stock when the request names a branch (`productView.js` omits `inStock`
 * entirely otherwise), so without this context the storefront can never show a sold-out
 * item, no matter what a manager toggles in the staff console.
 *
 * **No branch is chosen by default, and that is deliberate.** Guessing one — nearest,
 * busiest, first in the list — would mean telling a visitor in Bahria that Lotus is sold
 * out because it happens to be sold out in DHA. An unchosen branch means the menu renders
 * exactly as it did before this existed: every product shown, no availability claimed.
 * Claiming nothing is the honest answer until somebody says where they are.
 *
 * The choice is persisted, because a visitor who picked their branch on the menu page
 * should not be asked again on the product page, or tomorrow.
 */
export function BranchProvider({ children }) {
  const [branches, setBranches] = useState([])

  // Read synchronously on mount so the first catalogue fetch already carries the branch,
  // rather than firing once without it and again with it a tick later.
  const [branchId, setBranchIdState] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || null
    } catch {
      // Safari private mode throws on localStorage. A visitor who cannot persist a
      // choice should still be able to make one for this page view.
      return null
    }
  })

  useEffect(() => {
    if (!isApiConfigured) return

    const controller = new AbortController()
    let active = true

    fetchBranches({ signal: controller.signal })
      .then((data) => {
        if (!active || !Array.isArray(data)) return
        setBranches(data)
      })
      .catch(() => {
        // Silent: without the branch list the picker simply does not appear, and the
        // menu falls back to showing everything. Nothing the visitor can act on.
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  const setBranchId = (next) => {
    setBranchIdState(next || null)
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next)
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignored — see the read above.
    }
  }

  /**
   * A stored id that no longer exists (a branch was retired, or the database was
   * reseeded with fresh ids) must not keep being sent. The API would 404 or, worse,
   * silently return an unfiltered list that we would then present as branch-specific.
   * Only checked once the list has actually loaded, so a slow fetch does not look
   * like a missing branch.
   */
  const knownBranchId = branches.length > 0 && !branches.some((b) => b.id === branchId) ? null : branchId

  const value = useMemo(
    () => ({
      branches,
      branchId: knownBranchId,
      branch: branches.find((b) => b.id === knownBranchId) ?? null,
      setBranchId,
      hasBranches: branches.length > 0,
    }),
    [branches, knownBranchId]
  )

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
}

export function useBranch() {
  const context = useContext(BranchContext)
  if (!context) throw new Error('useBranch must be used inside a BranchProvider')
  return context
}
