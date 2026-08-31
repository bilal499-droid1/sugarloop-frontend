import { useEffect, useState } from 'react'
import { FaFileDownload } from 'react-icons/fa'
import { useStaffAuth } from '../../context/StaffAuthContext'
import {
  fetchDailyReport,
  downloadDailyReport,
  fetchSalesSummary,
  downloadSalesSummary,
} from '../../lib/staffApi'
import { fetchBranches } from '../../lib/api'
import {
  FAILURE_REASON_LABEL,
  FULFILMENT_LABEL,
  ORDER_STATUS_LABEL,
} from '../../lib/staffConstants'

/**
 * The daily report.
 *
 * Everything on screen is the server's own arithmetic — the page renders `report.takings`
 * and never adds up an order list itself. The same rule the checkout page follows, for the
 * same reason: a second implementation of "what did we take today" is a second answer, and
 * the one on the screen is the one somebody reconciles a till against.
 */

/**
 * Today in Asia/Karachi, as `YYYY-MM-DD`.
 *
 * Not `new Date().toISOString().slice(0, 10)` — that is today in UTC, which for a shop
 * trading to 03:00 is the wrong day for the five hours that matter most.
 */
function businessToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return parts
}

function Stat({ label, value, hint, strong = false }) {
  return (
    <div className="bg-white border border-border-light rounded-xl p-4">
      <p className="m-0 text-[0.7rem] uppercase tracking-wide text-text-body/70">{label}</p>
      <p
        className={`m-0 mt-1 font-price font-bold ${
          strong ? 'text-2xl text-accent' : 'text-lg text-black'
        }`}
      >
        {value}
      </p>
      {hint && <p className="m-0 mt-0.5 text-[0.7rem] text-text-body">{hint}</p>}
    </div>
  )
}

function Panel({ title, children, empty }) {
  return (
    <div className="bg-white border border-border-light rounded-xl p-4">
      <p className="m-0 mb-2 text-[0.7rem] uppercase tracking-wide text-text-body/70">{title}</p>
      {empty ? <p className="m-0 text-sm text-text-body">{empty}</p> : children}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-light last:border-b-0">
      <span className="text-sm text-black">{label}</span>
      <span className="font-price text-sm text-text-body whitespace-nowrap">{value}</span>
    </div>
  )
}

/** Reads back what a total actually covered, e.g. "13 Aug 2026 — 24 Aug 2026". */
function spanLabel(report, { emptyLabel = 'No orders yet' } = {}) {
  if (!report.firstOrderAt) return emptyLabel

  const day = (value) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium' }).format(
      new Date(value)
    )

  return `${day(report.firstOrderAt)} — ${day(report.lastOrderAt)}`
}

const MODE = { DAY: 'day', RANGE: 'range', ALL: 'all' }

/** `YYYY-MM-DD` this many days before the given business date. */
function daysBefore(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

export default function StaffReportsPage() {
  const { staffUser, isAdmin } = useStaffAuth()

  const [mode, setMode] = useState(MODE.DAY)
  const [date, setDate] = useState(businessToday())
  // Defaults to the last 7 days including today — the range somebody actually wants when
  // they reach for this control, rather than an empty pair of boxes to fill in twice.
  const [from, setFrom] = useState(() => daysBefore(businessToday(), 6))
  const [to, setTo] = useState(businessToday())
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState('')

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(null)

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

  const isAllTime = mode === MODE.ALL
  const isRange = mode === MODE.RANGE
  /** Both windows are the same summary endpoint — all-time is simply one with no bounds. */
  const isSummary = isAllTime || isRange

  /**
   * Caught here as well as on the server.
   *
   * The API answers 422 for a backwards range, which is correct but arrives as a red bar
   * after a round trip. A date pair is trivially checkable in the browser, and the two
   * inputs are right there to fix. ISO dates sort lexicographically, so this is the same
   * comparison the validator makes.
   */
  const rangeIsBackwards = isRange && from && to && from > to

  useEffect(() => {
    if (rangeIsBackwards) return

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const scope = { branchId: branchId || undefined, signal: controller.signal }
    const request = isSummary
      ? fetchSalesSummary(isRange ? { from, to, ...scope } : scope)
      : fetchDailyReport({ date, ...scope })

    request
      .then((data) => setReport(data.report))
      .catch((err) => {
        if (controller.signal.aborted) return
        // A report that failed must not leave the previous numbers on screen looking
        // like the ones that were asked for.
        setReport(null)
        setError(err?.message ?? 'Could not load the report.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [isSummary, isRange, rangeIsBackwards, from, to, date, branchId])

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadError(null)
    try {
      const scope = { branchId: branchId || undefined }
      await (isSummary
        ? downloadSalesSummary(isRange ? { from, to, ...scope } : scope)
        : downloadDailyReport({ date, ...scope }))
    } catch (err) {
      setDownloadError(err?.message ?? 'Could not download the report.')
    } finally {
      setDownloading(false)
    }
  }

  const scopeLabel = isAdmin
    ? (branches.find((b) => b.id === branchId)?.name ?? 'All branches')
    : (staffUser?.branch?.name ?? 'Your branch')

  return (
    <div>
      <h1 className="m-0 mb-4 font-display font-bold text-xl text-black">
        {isAllTime ? 'Total sales' : isRange ? 'Sales over a period' : 'Daily report'}
      </h1>

      <div className="mb-5 flex flex-wrap items-end gap-3 bg-white border border-border-light rounded-xl p-4">
        {/* Two questions, not one with a filter: "what did we take today" and "what have
            we taken so far" are answered by different windows over the same orders, and
            a date picker that silently means nothing in one of them reads as broken. */}
        <div className="flex flex-col gap-1.5">
          <span className="font-display font-medium text-xs text-text-body">Show</span>
          <div className="inline-flex rounded-lg border border-border-light overflow-hidden">
            {[
              [MODE.DAY, 'One day'],
              [MODE.RANGE, 'Date range'],
              [MODE.ALL, 'All time'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={`h-9 px-3 border-none text-xs font-display font-bold cursor-pointer ${
                  mode === value ? 'bg-accent text-white' : 'bg-white text-text-body'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mode === MODE.DAY && (
          <label className="flex flex-col gap-1.5">
            <span className="font-display font-medium text-xs text-text-body">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
            />
          </label>
        )}

        {isRange && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="font-display font-medium text-xs text-text-body">From</span>
              <input
                type="date"
                value={from}
                // `max`/`min` stop the pair being crossed in the picker at all, which is
                // better than letting it happen and then explaining it.
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-display font-medium text-xs text-text-body">To</span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
              />
            </label>
          </>
        )}

        {isAdmin && (
          <label className="flex flex-col gap-1.5">
            <span className="font-display font-medium text-xs text-text-body">Branch</span>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="h-9 px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent min-w-[14rem]"
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !report}
          className="ml-auto h-9 px-4 rounded-lg border-none bg-accent text-white text-xs font-display font-bold cursor-pointer inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-wait"
        >
          <FaFileDownload aria-hidden="true" />
          {downloading ? 'Preparing…' : 'Download PDF'}
        </button>
      </div>

      {rangeIsBackwards && (
        <p role="alert" className="m-0 mb-3 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          The start date is after the end date — the numbers below are from the last range
          that made sense.
        </p>
      )}
      {error && (
        <p role="alert" className="m-0 mb-3 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {error}
        </p>
      )}
      {downloadError && (
        <p role="alert" className="m-0 mb-3 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {downloadError}
        </p>
      )}

      {loading && !report && (
        <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-border-light text-sm text-text-body">
          Loading…
        </div>
      )}

      {report && (
        <div className={loading ? 'opacity-60' : undefined}>
          {/*
            For a range this reads back the span of orders actually FOUND, not the dates
            asked for — so a week whose orders all landed on one day says so, instead of
            implying the whole week was trading.
          */}
          <p className="m-0 mb-3 text-xs text-text-body">
            {scopeLabel} ·{' '}
            {isRange
              ? `${from} → ${to} · ${spanLabel(report, { emptyLabel: 'No orders in this range' })}`
              : isAllTime
                ? spanLabel(report)
                : report.date}
          </p>

          <div className="grid grid-cols-2 max-[900px]:grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
            <Stat
              label={
                isAllTime ? 'Total sales to date' : isRange ? 'Total over this period' : 'Total taken'
              }
              value={report.takings.gross.formatted}
              hint="Completed orders only"
              strong
            />
            <Stat label="Orders completed" value={String(report.takings.orders)} />
            <Stat label="Items subtotal" value={report.takings.net.formatted} />
            <Stat label="Delivery fees" value={report.takings.deliveryFees.formatted} />
          </div>

          <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-3">
            <Panel title={`Orders by status — ${report.ordersPlaced} placed`}>
              {Object.entries(report.byStatus)
                .filter(([, count]) => count > 0)
                .map(([status, count]) => (
                  <Row key={status} label={ORDER_STATUS_LABEL[status] ?? status} value={count} />
                ))}
              {report.ordersPlaced === 0 && (
                <p className="m-0 text-sm text-text-body">
                  {isAllTime
                    ? 'No orders yet.'
                    : isRange
                      ? 'No orders in this range.'
                      : 'No orders on this day.'}
                </p>
              )}
            </Panel>

            <Panel
              title="By fulfilment"
              empty={report.byFulfilment.length === 0 ? 'Nothing completed yet.' : null}
            >
              {report.byFulfilment.map((row) => (
                <Row
                  key={row.fulfilment}
                  label={`${FULFILMENT_LABEL[row.fulfilment] ?? row.fulfilment} — ${row.orders}`}
                  value={row.gross.formatted}
                />
              ))}
            </Panel>

            <Panel
              title={isSummary ? 'Best sellers' : 'What sold'}
              empty={
                report.topItems.length === 0
                  ? isAllTime
                    ? 'Nothing sold yet.'
                    : isRange
                      ? 'Nothing sold in this range.'
                      : 'Nothing sold on this day.'
                  : null
              }
            >
              {report.topItems.map((row) => (
                <Row key={row.sku} label={`${row.qty} × ${row.name}`} value={row.revenue.formatted} />
              ))}
            </Panel>

            <Panel
              title="Failures by reason"
              empty={report.failures.length === 0 ? 'No failed orders.' : null}
            >
              {report.failures.map((row) => (
                <Row
                  key={row.reason}
                  label={FAILURE_REASON_LABEL[row.reason] ?? row.reason}
                  value={row.count}
                />
              ))}
            </Panel>
          </div>
        </div>
      )}
    </div>
  )
}
