import { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import StatusBadge from '../../components/staff/StatusBadge'
import OrderDetailPanel from '../../components/staff/OrderDetailPanel'
import UnacknowledgedAlert from '../../components/staff/UnacknowledgedAlert'
import { useStaffAuth } from '../../context/StaffAuthContext'
 import BranchOrdersSwitch from '../../components/staff/BranchOrdersSwitch'
import { fetchOrders, fetchOrder, changeOrderStatus } from '../../lib/staffApi'
import { fetchBranches } from '../../lib/api'
import { ORDER_STATUS_LABEL, ORDER_STATUSES, FULFILMENT_LABEL } from '../../lib/staffConstants'

const time = new Intl.DateTimeFormat('en-PK', {
  timeZone: 'Asia/Karachi',
  dateStyle: 'medium',
  timeStyle: 'short',
})

const EMPTY_FILTERS = { status: '', fulfilment: '', date: '', phone: '', branchId: '' }

// Matches the cadence the API docs assume for this board. Short enough that an order
// is on screen well before the server chases anyone about it at five minutes.
const POLL_MS = 15_000

function OrderCard({ order, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
        selected ? 'border-accent bg-[#eef4f9]' : 'border-border-light bg-white hover:border-accent/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 font-display font-bold text-sm text-black">{order.orderNumber}</p>
        <StatusBadge status={order.status} />
      </div>
      <p className="m-0 mt-1 text-xs text-text-body">
        {order.contact.name} · {FULFILMENT_LABEL[order.fulfilment]} · {order.branch.code ?? order.branch.name}
      </p>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[0.7rem] text-text-body">{time.format(new Date(order.placedAt))}</span>
        <span className="font-price font-bold text-sm text-accent">{order.totals.grandTotal.formatted}</span>
      </div>
    </button>
  )
}

export default function StaffOrdersPage() {
  const { isAdmin, staffUser } = useStaffAuth()

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)

  const [branches, setBranches] = useState([])

  const [orders, setOrders] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [listLoading, setListLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [listError, setListError] = useState(null)

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  // Public and unauthenticated — the same call the branch picker on the storefront
  // would use — so an admin's filter dropdown doesn't need its own staff endpoint.
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

  // The list refetches from scratch whenever the applied filters change. Selection is
  // NOT cleared here — switching from "Placed" to "Confirmed" while looking at an order
  // that just moved between them would otherwise yank the panel out from under the
  // operator mid-read.
  useEffect(() => {
    let active = true
    setListLoading(true)
    setListError(null)

    fetchOrders(appliedFilters)
      .then(({ items, meta }) => {
        if (!active) return
        setOrders(items)
        setNextCursor(meta.nextCursor ?? null)
      })
      .catch((error) => {
        if (!active) return
        setListError(error?.message ?? 'Could not load orders.')
        setOrders([])
        setNextCursor(null)
      })
      .finally(() => active && setListLoading(false))

    return () => {
      active = false
    }
  }, [appliedFilters])

  /**
   * Keeps the board current without anybody pressing anything.
   *
   * The board had no polling at all: a new order appeared only when the operator changed
   * a filter or reloaded the page, which makes an "unacknowledged order" alert
   * meaningless — the order it is meant to warn about would not be on screen yet.
   *
   * Only the first page is refreshed. Re-fetching everything the operator has paged
   * through would reset their scroll position every fifteen seconds, and the orders that
   * need attention are the newest ones, which are on page one by definition.
   *
   * Selection is untouched, so an operator reading an order is not interrupted by it.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      // Skip while a write is in flight: the refreshed list would arrive without the
      // transition that is mid-request and briefly show the old status.
      if (document.hidden || actionBusy) return

      fetchOrders(appliedFilters)
        .then(({ items, meta }) => {
          setOrders(items)
          setNextCursor(meta.nextCursor ?? null)
        })
        // A failed poll is not worth a banner — the next one is fifteen seconds away,
        // and blanking a board that already has content is worse than a stale one.
        .catch(() => {})
    }, POLL_MS)

    return () => clearInterval(timer)
  }, [appliedFilters, actionBusy])

  /**
   * What the alarm counts. `placed` is precisely "nobody has looked at this yet" — every
   * later status is somebody having acted, which is what the server's escalation timer
   * uses as its acknowledgement too.
   */
  const unacknowledged = orders.filter((order) => order.status === 'placed').length

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const { items, meta } = await fetchOrders({ ...appliedFilters, cursor: nextCursor })
      setOrders((current) => [...current, ...items])
      setNextCursor(meta.nextCursor ?? null)
    } catch (error) {
      setListError(error?.message ?? 'Could not load more orders.')
    } finally {
      setLoadingMore(false)
    }
  }

  const selectOrder = async (id) => {
    setSelectedId(id)
    setDetail(null)
    setDetailError(null)
    setActionError(null)
    setDetailLoading(true)
    try {
      const data = await fetchOrder(id)
      setDetail(data)
    } catch (error) {
      setDetailError(error?.message ?? 'Could not load this order.')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleChangeStatus = async (status, extra = {}) => {
    if (!selectedId) return
    setActionBusy(true)
    setActionError(null)
    try {
      const data = await changeOrderStatus(selectedId, { status, ...extra })
      setDetail(data)
      // Patches the card in place rather than re-running the list query, so the board
      // doesn't jump or lose scroll position the moment an operator moves an order —
      // and a status filter that would now exclude it stays showing it until they
      // deliberately refresh, which reads as "here's what you just did", not a glitch.
      setOrders((current) => current.map((o) => (o.id === data.order.id ? data.order : o)))
    } catch (error) {
      setActionError(error?.message ?? 'Could not update this order.')
    } finally {
      setActionBusy(false)
    }
  }

  const applyFilters = (event) => {
    event.preventDefault()
    setAppliedFilters(filters)
  }

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
  }

  /**
   * A select (status, fulfilment, branch) is a closed, deliberate choice — there is no
   * "still typing" state to protect against, unlike the date and phone fields, which
   * fire a request on every keystroke if not held back. Applying it immediately means
   * picking an option visibly does something, rather than requiring a second click on
   * a separate Apply button that the option itself gave no sign it needed.
   */
  const setSelectFilter = (key) => (event) => {
    const next = { ...filters, [key]: event.target.value }
    setFilters(next)
    setAppliedFilters(next)
  }

  return (
    <div>
      <h1 className="m-0 mb-4 font-display font-bold text-xl text-black">Orders</h1>

      {/*
        A manager runs one shop and cannot reach Team, so the pause switch lives here —
        the screen they are on when the kitchen is drowning. An admin has no single branch
        to pause, and does it per branch from Team instead.
      */}
      {!isAdmin && <BranchOrdersSwitch branchId={staffUser?.branch?.id} />}

      {/* Above the filters, so a filtered view cannot hide the thing that needs doing. */}
      <UnacknowledgedAlert count={unacknowledged} />

      <form
        onSubmit={applyFilters}
        className="mb-5 flex flex-wrap items-end gap-3 bg-white border border-border-light rounded-xl p-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Status</span>
          <select
            value={filters.status}
            onChange={setSelectFilter('status')}
            className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
          >
            <option value="">All</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Fulfilment</span>
          <select
            value={filters.fulfilment}
            onChange={setSelectFilter('fulfilment')}
            className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
          >
            <option value="">All</option>
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Date</span>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
            className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Phone</span>
          <input
            type="tel"
            placeholder="03001234567"
            value={filters.phone}
            onChange={(e) => setFilters((f) => ({ ...f, phone: e.target.value }))}
            className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent w-36"
          />
        </label>

        {isAdmin && (
          <label className="flex flex-col gap-1.5">
            <span className="font-display font-medium text-xs text-text-body">Branch</span>
            <select
              value={filters.branchId}
              onChange={setSelectFilter('branchId')}
              className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
            >
              <option value="">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="submit"
          className="h-9 px-4 rounded-lg border-none bg-accent text-white text-xs font-display font-bold cursor-pointer flex items-center gap-1.5"
        >
          <FaSearch className="text-[0.65rem]" aria-hidden="true" />
          Apply
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="h-9 px-3 rounded-lg border border-border-light bg-white text-xs font-display font-medium text-text-body cursor-pointer"
        >
          Clear
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-5 items-start">
        <div className="flex flex-col gap-2">
          {listError && (
            <p role="alert" className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
              {listError}
            </p>
          )}

          {listLoading ? (
            <p className="text-sm text-text-body">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-text-body">No orders match these filters.</p>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                selected={order.id === selectedId}
                onSelect={() => selectOrder(order.id)}
              />
            ))
          )}

          {nextCursor && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-1 h-9 rounded-lg border border-border-light bg-white text-xs font-display font-medium text-text-body cursor-pointer disabled:opacity-60"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>

        <div>
          {!selectedId && (
            <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-border-light text-sm text-text-body">
              Select an order to see its details.
            </div>
          )}

          {selectedId && detailLoading && <p className="text-sm text-text-body">Loading order…</p>}

          {selectedId && detailError && (
            <p role="alert" className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
              {detailError}
            </p>
          )}

          {detail && (
            <OrderDetailPanel
              order={detail.order}
              transitions={detail.transitions}
              onChangeStatus={handleChangeStatus}
              busy={actionBusy}
              actionError={actionError}
            />
          )}
        </div>
      </div>
    </div>
  )
}
