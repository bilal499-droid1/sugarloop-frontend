import { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { discontinueStaffProduct, fetchStaffProducts, updateStaffProduct } from '../../lib/staffApi'
import { PRODUCT_CATEGORIES } from '../../lib/staffConstants'
import ProductForm from '../../components/staff/ProductForm'

const EMPTY_FILTERS = { search: '', category: '', isActive: '' }

const selectClass =
  'h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent'

function ProductRow({ product, onEdit, onDiscontinue, onRestore, busy }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 border-b border-border-light last:border-b-0 sm:flex-nowrap ${
        product.isActive ? '' : 'bg-black/[0.02]'
      }`}
    >
      <span className="flex-1 min-w-0">
        <span className="block font-display font-medium text-sm text-black truncate">
          {product.name}
          {!product.isActive && (
            <span className="ml-2 px-1.5 rounded bg-black/[0.06] font-display text-[0.62rem] font-semibold uppercase tracking-wide text-text-body">
              Off the menu
            </span>
          )}
        </span>
        <span className="block text-xs text-text-body truncate">
          {product.sku} · {product.category}
          {product.type ? ` · ${product.type}` : ''}
        </span>
      </span>

      {/* The formatted string comes from the server, so nothing here divides by 100. */}
      <span className="shrink-0 whitespace-nowrap font-price font-bold text-sm text-accent">
        {product.priceFormatted}
      </span>

      <span className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="h-8 px-3 rounded-lg border border-border-light bg-white font-display text-xs text-text-body cursor-pointer hover:border-accent hover:text-accent"
        >
          Edit
        </button>
        {product.isActive ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onDiscontinue(product)}
            className="h-8 px-3 rounded-lg border border-border-light bg-white font-display text-xs text-[#a4443a] cursor-pointer hover:border-[#a4443a] disabled:opacity-50"
          >
            Discontinue
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => onRestore(product)}
            className="h-8 px-3 rounded-lg border border-border-light bg-white font-display text-xs text-text-body cursor-pointer hover:border-accent hover:text-accent disabled:opacity-50"
          >
            Put back
          </button>
        )}
      </span>
    </div>
  )
}

/**
 * The catalogue, as an admin manages it.
 *
 * Until this screen existed, changing a price meant a developer editing a seed file and
 * re-running it. That is the gap this closes — and it is also why every write here is
 * audited server-side: one edit changes what every future customer is charged.
 *
 * Nothing on this page deletes. "Discontinue" takes an item off the menu everywhere and
 * "Put back" reverses it; the document survives either way, because every historical
 * order line points at it.
 */
export default function StaffProductsPage() {
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [listError, setListError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setListError(null)

    fetchStaffProducts(appliedFilters)
      .then(({ items, meta }) => {
        if (!active) return
        setProducts(items)
        setNextCursor(meta.nextCursor ?? null)
      })
      .catch((error) => {
        if (!active) return
        setListError(error?.message ?? 'Could not load the catalogue.')
        setProducts([])
        setNextCursor(null)
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [appliedFilters])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const { items, meta } = await fetchStaffProducts({ ...appliedFilters, cursor: nextCursor })
      setProducts((current) => [...current, ...items])
      setNextCursor(meta.nextCursor ?? null)
    } catch (error) {
      setListError(error?.message ?? 'Could not load more.')
    } finally {
      setLoadingMore(false)
    }
  }

  /**
   * Patches the row in place rather than refetching.
   *
   * Refetching would re-sort the list and, with a filter applied, make the product the
   * admin just edited vanish from under their cursor.
   */
  const replaceInList = (saved) => {
    setProducts((current) => current.map((p) => (p.id === saved.id ? saved : p)))
  }

  const handleSaved = (saved, { created }) => {
    if (created) setProducts((current) => [saved, ...current])
    else replaceInList(saved)
    setEditing(null)
  }

  const setStatus = async (product, action) => {
    setBusyId(product.id)
    setListError(null)
    try {
      const saved =
        action === 'discontinue'
          ? await discontinueStaffProduct(product.id)
          : await updateStaffProduct(product.id, { isActive: true })
      replaceInList(saved)
    } catch (error) {
      setListError(error?.message ?? 'Could not change that.')
    } finally {
      setBusyId(null)
    }
  }

  const setSelectFilter = (key) => (event) => {
    const next = { ...filters, [key]: event.target.value }
    setFilters(next)
    setAppliedFilters(next)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-display font-bold text-xl text-black">Products</h1>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing({})}
            className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border-none bg-accent text-white font-display font-bold text-sm cursor-pointer"
          >
            <FaPlus className="text-xs" aria-hidden="true" />
            New product
          </button>
        )}
      </div>

      {editing && (
        <div className="mb-5">
          <ProductForm
            product={editing.id ? editing : null}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          setAppliedFilters(filters)
        }}
        className="mb-5 flex flex-wrap items-end gap-3 bg-white border border-border-light rounded-xl p-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Name or SKU</span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="chocoholic"
            className={`${selectClass} min-w-[14rem]`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Category</span>
          <select
            value={filters.category}
            onChange={setSelectFilter('category')}
            className={selectClass}
          >
            <option value="">All</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">On the menu</span>
          {/* Defaults to "All" rather than to active only: the product an admin cannot
              find on the site is usually the one that was switched off. */}
          <select
            value={filters.isActive}
            onChange={setSelectFilter('isActive')}
            className={selectClass}
          >
            <option value="">All</option>
            <option value="true">On the menu</option>
            <option value="false">Discontinued</option>
          </select>
        </label>

        <button
          type="submit"
          className="h-9 px-4 rounded-lg border border-border-light bg-white font-display font-medium text-sm text-text-body cursor-pointer hover:border-accent hover:text-accent"
        >
          Search
        </button>
      </form>

      {listError && (
        <p className="mb-3 font-display text-sm text-red-600" role="alert">
          {listError}
        </p>
      )}

      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        {loading && products.length === 0 ? (
          <p className="m-0 px-3 py-6 text-center font-display text-sm text-text-body">Loading…</p>
        ) : products.length === 0 ? (
          <p className="m-0 px-3 py-6 text-center font-display text-sm text-text-body">
            No products match that.
          </p>
        ) : (
          products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              busy={busyId === product.id}
              onEdit={setEditing}
              onDiscontinue={(p) => setStatus(p, 'discontinue')}
              onRestore={(p) => setStatus(p, 'restore')}
            />
          ))
        )}
      </div>

      {nextCursor && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-3 h-9 px-4 rounded-lg border border-border-light bg-white font-display font-medium text-sm text-text-body cursor-pointer hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}
