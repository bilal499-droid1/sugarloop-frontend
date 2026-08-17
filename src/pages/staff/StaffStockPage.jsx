import { useEffect, useState } from 'react'
import { useStaffAuth } from '../../context/StaffAuthContext'
import { fetchStock, setStock } from '../../lib/staffApi'
import { fetchBranches } from '../../lib/api'
import { CATEGORIES } from '../../components/products/productsData'

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-wait ${
        on ? 'bg-[#2fa360]' : 'bg-[#d0453a]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function StockRow({ item, onToggle, pending }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border-light last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="m-0 font-display font-medium text-sm text-black truncate">{item.name}</p>
        <p className="m-0 text-xs text-text-body">
          {item.category} · {item.type} · {item.sku}
        </p>
      </div>
      <p className="w-16 shrink-0 text-right font-price text-sm text-text-body">{item.priceFormatted}</p>
      <span
        className={`w-20 shrink-0 text-right text-xs font-display font-semibold ${
          item.inStock ? 'text-[#227a3f]' : 'text-[#c0392b]'
        }`}
      >
        {item.inStock ? 'In stock' : 'Sold out'}
      </span>
      <Toggle on={item.inStock} disabled={pending} onChange={(next) => onToggle(item, next)} />
    </div>
  )
}

export default function StaffStockPage() {
  const { staffUser, isAdmin } = useStaffAuth()

  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState(isAdmin ? '' : (staffUser?.branch?.id ?? ''))

  const [category, setCategory] = useState('')
  const [inStockFilter, setInStockFilter] = useState('')

  const [branch, setBranch] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [toggleError, setToggleError] = useState(null)

  useEffect(() => {
    if (!isAdmin) return
    let active = true
    fetchBranches()
      .then((data) => active && setBranches(data ?? []))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [isAdmin])

  useEffect(() => {
    // An admin who has not picked a branch yet has nothing meaningful to load — there
    // is no "all branches" stock sheet, matching the API (`stock.service.js`).
    if (!branchId) {
      setItems([])
      setBranch(null)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    fetchStock({
      branchId,
      category: category || undefined,
      inStock: inStockFilter === '' ? undefined : inStockFilter === 'true',
    })
      .then((data) => {
        if (!active) return
        setBranch(data.branch)
        setItems(data.items)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.message ?? 'Could not load the stock sheet.')
        setItems([])
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [branchId, category, inStockFilter])

  const handleToggle = async (item, next) => {
    setToggleError(null)
    setPendingId(item.id)
    // Optimistic — a manager standing at an empty tray needs the switch to answer
    // immediately, and setStock is idempotent, so a failure just reverts the flip.
    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, inStock: next } : row)))
    try {
      const { item: updated } = await setStock(item.id, { inStock: next, branchId })
      setItems((current) => current.map((row) => (row.id === item.id ? updated : row)))
    } catch (err) {
      setItems((current) => current.map((row) => (row.id === item.id ? { ...row, inStock: !next } : row)))
      setToggleError(err?.message ?? `Could not update ${item.name}.`)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div>
      <h1 className="m-0 mb-4 font-display font-bold text-xl text-black">Stock</h1>

      <div className="mb-5 flex flex-wrap items-end gap-3 bg-white border border-border-light rounded-xl p-4">
        {isAdmin && (
          <label className="flex flex-col gap-1.5">
            <span className="font-display font-medium text-xs text-text-body">Branch</span>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent min-w-[14rem]"
            >
              <option value="">Choose a branch…</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
          >
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Availability</span>
          <select
            value={inStockFilter}
            onChange={(e) => setInStockFilter(e.target.value)}
            className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
          >
            <option value="">All</option>
            <option value="true">In stock</option>
            <option value="false">Sold out</option>
          </select>
        </label>

        {branch && (
          <p className="m-0 ml-auto text-xs text-text-body">
            Showing <span className="font-display font-semibold text-black">{branch.name}</span>
          </p>
        )}
      </div>

      {!branchId && isAdmin && (
        <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-border-light text-sm text-text-body">
          Choose a branch to see its stock sheet.
        </div>
      )}

      {error && (
        <p role="alert" className="m-0 mb-3 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {error}
        </p>
      )}
      {toggleError && (
        <p role="alert" className="m-0 mb-3 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {toggleError}
        </p>
      )}

      {branchId && (
        <div className="bg-white border border-border-light rounded-2xl px-4">
          {loading ? (
            <p className="py-6 text-sm text-text-body">Loading stock…</p>
          ) : items.length === 0 ? (
            <p className="py-6 text-sm text-text-body">No products match these filters.</p>
          ) : (
            items.map((item) => (
              <StockRow key={item.id} item={item} onToggle={handleToggle} pending={pendingId === item.id} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
