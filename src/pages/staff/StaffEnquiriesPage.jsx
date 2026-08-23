import { useCallback, useEffect, useState } from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'
import { fetchEnquiries, fetchEnquirySummary } from '../../lib/staffApi'
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABEL } from '../../lib/staffConstants'
import EnquiryPanel from '../../components/staff/EnquiryPanel'

const EMPTY_FILTERS = { search: '', status: '', emailed: '' }

const selectClass =
  'h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent'

const dateOnly = new Intl.DateTimeFormat('en-PK', {
  timeZone: 'Asia/Karachi',
  day: 'numeric',
  month: 'short',
})

function EnquiryRow({ enquiry, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 border-b border-border-light last:border-b-0 cursor-pointer transition-colors ${
        isSelected ? 'bg-accent/5' : 'bg-transparent hover:bg-black/[0.02]'
      }`}
    >
      {/* Unread-style dot: a lead nobody has picked up reads as something to act on. */}
      <span
        aria-hidden="true"
        className={`shrink-0 w-1.5 h-1.5 rounded-full ${
          enquiry.status === 'new' ? 'bg-accent' : 'bg-transparent'
        }`}
      />
      <span className="flex-1 min-w-0">
        <span className="block font-display font-medium text-sm text-black truncate">
          {enquiry.company || enquiry.name}
          {!enquiry.emailed && (
            <FaExclamationTriangle
              className="inline ml-1.5 text-[0.65rem] text-[#8a6d1f] align-baseline"
              title="The notification email never sent"
              aria-label="The notification email never sent"
            />
          )}
        </span>
        <span className="block text-xs text-text-body truncate">
          {enquiry.company ? `${enquiry.name} · ` : ''}
          {enquiry.email}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[0.7rem] font-display font-semibold text-text-body">
          {ENQUIRY_STATUS_LABEL[enquiry.status] ?? enquiry.status}
        </span>
        <span className="block text-[0.7rem] text-text-body/80">
          {dateOnly.format(new Date(enquiry.receivedAt))}
        </span>
      </span>
    </button>
  )
}

/**
 * The corporate gifting inbox.
 *
 * The shop already gets an email per lead, so this screen is not about finding out one
 * arrived — it is about the three things an inbox cannot do: showing who has already been
 * called, keeping the thread when a lead passes between people, and surfacing the leads
 * whose notification email never sent, which exist in the database and nowhere else.
 *
 * Admin-only: `RequireAdmin` keeps a branch manager off the route, `StaffLayout` hides the
 * link, and every `/staff/enquiries` route sits behind `requireRole(ADMIN)` on the server.
 */
export default function StaffEnquiriesPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)

  const [enquiries, setEnquiries] = useState([])
  const [summary, setSummary] = useState(null)
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [listError, setListError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const selected = enquiries.find((row) => row.id === selectedId) ?? null

  const loadSummary = useCallback(() => {
    fetchEnquirySummary()
      .then(setSummary)
      .catch(() => {
        // The counts are decoration on top of the list. Failing to load them is not worth
        // an error banner over a screen that is otherwise working.
      })
  }, [])

  useEffect(loadSummary, [loadSummary])

  useEffect(() => {
    let active = true
    setLoading(true)
    setListError(null)

    fetchEnquiries(appliedFilters)
      .then(({ items, meta }) => {
        if (!active) return
        setEnquiries(items)
        setNextCursor(meta.nextCursor ?? null)
      })
      .catch((error) => {
        if (!active) return
        setListError(error?.message ?? 'Could not load enquiries.')
        setEnquiries([])
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
      const { items, meta } = await fetchEnquiries({ ...appliedFilters, cursor: nextCursor })
      setEnquiries((current) => [...current, ...items])
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
   * Refetching would drop the lead out from under the cursor the moment its status stops
   * matching the active filter — which is exactly when somebody has just finished working
   * it and is still reading the panel.
   */
  const handleChanged = (saved) => {
    setEnquiries((current) => current.map((row) => (row.id === saved.id ? saved : row)))
    loadSummary()
  }

  const setSelectFilter = (key) => (event) => {
    const next = { ...filters, [key]: event.target.value }
    setFilters(next)
    setAppliedFilters(next)
  }

  /** Clicking a count sets the filter it counts — the whole point of showing them. */
  const applyStatus = (status) => {
    const next = { ...EMPTY_FILTERS, status }
    setFilters(next)
    setAppliedFilters(next)
  }

  return (
    <div>
      <h1 className="m-0 mb-4 font-display font-bold text-xl text-black">Enquiries</h1>

      {summary && (
        <div className="mb-4 flex flex-wrap gap-2">
          {ENQUIRY_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => applyStatus(status)}
              className={`h-8 px-3 rounded-full font-display text-xs cursor-pointer transition-colors ${
                appliedFilters.status === status
                  ? 'bg-accent text-white border-none'
                  : 'bg-white border border-border-light text-text-body hover:border-accent'
              }`}
            >
              {ENQUIRY_STATUS_LABEL[status]} · {summary[status] ?? 0}
            </button>
          ))}
          {summary.unemailed > 0 && (
            <button
              type="button"
              onClick={() => {
                const next = { ...EMPTY_FILTERS, emailed: 'false' }
                setFilters(next)
                setAppliedFilters(next)
              }}
              className={`h-8 px-3 rounded-full font-display text-xs cursor-pointer flex items-center gap-1.5 transition-colors ${
                appliedFilters.emailed === 'false'
                  ? 'bg-[#8a6d1f] text-white border-none'
                  : 'bg-[#fff8e5] border border-[#e8d9a8] text-[#8a6d1f] hover:border-[#8a6d1f]'
              }`}
            >
              <FaExclamationTriangle aria-hidden="true" />
              Never emailed · {summary.unemailed}
            </button>
          )}
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
          <span className="font-display font-medium text-xs text-text-body">
            Company, name, email or phone
          </span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="example corp"
            className={`${selectClass} min-w-[14rem]`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Status</span>
          <select
            value={filters.status}
            onChange={setSelectFilter('status')}
            className={selectClass}
          >
            <option value="">All</option>
            {ENQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ENQUIRY_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Notification</span>
          <select
            value={filters.emailed}
            onChange={setSelectFilter('emailed')}
            className={selectClass}
          >
            <option value="">All</option>
            <option value="true">Emailed</option>
            <option value="false">Never emailed</option>
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
        <p role="alert" className="m-0 mb-3 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {listError}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-5 items-start">
        <div className="bg-white border border-border-light rounded-2xl overflow-hidden">
          {loading ? (
            <p className="m-0 px-4 py-6 text-sm text-text-body">Loading enquiries…</p>
          ) : enquiries.length === 0 ? (
            <p className="m-0 px-4 py-6 text-sm text-text-body">
              {appliedFilters === EMPTY_FILTERS
                ? 'No corporate enquiries yet.'
                : 'Nothing matches these filters.'}
            </p>
          ) : (
            <>
              {enquiries.map((enquiry) => (
                <EnquiryRow
                  key={enquiry.id}
                  enquiry={enquiry}
                  isSelected={enquiry.id === selectedId}
                  onSelect={() => setSelectedId(enquiry.id)}
                />
              ))}
              {nextCursor && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full h-10 border-none border-t border-border-light bg-transparent font-display font-medium text-sm text-accent cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              )}
            </>
          )}
        </div>

        <div>
          {selected ? (
            <EnquiryPanel enquiry={selected} onChanged={handleChanged} />
          ) : (
            <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-border-light text-sm text-text-body">
              Choose an enquiry to see it.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
