import { useEffect, useState } from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'
import { fetchStaffBranches, updateBranch } from '../../lib/staffApi'

/**
 * The kill switch, on the screen the person holding it is already looking at.
 *
 * A branch manager cannot reach Team — that route is admin-only — so the control to stop
 * the queue has to live on the order board, which is where they are standing when the
 * kitchen is drowning and the reason to press it exists. Routing this through an admin
 * would mean the queue keeps growing while somebody makes a phone call.
 *
 * Pausing does NOT close the shop. The branch stays open, staff stay in, existing orders
 * carry on being worked; only new ones stop. Closing a branch is `isActive` and stays
 * admin-only.
 *
 * Renders nothing until the branch is known, rather than guessing a state — a switch that
 * shows "taking orders" while it loads is a switch that lies for a second, and this one
 * is read at a glance under pressure.
 */
export default function BranchOrdersSwitch({ branchId }) {
  const [branch, setBranch] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!branchId) return undefined

    const controller = new AbortController()
    fetchStaffBranches({ signal: controller.signal })
      .then((all) => setBranch(all.find((b) => b.id === branchId) ?? null))
      .catch(() => {})

    return () => controller.abort()
  }, [branchId])

  if (!branch) return null

  const paused = !branch.acceptingOrders

  const toggle = async () => {
    setBusy(true)
    setError(null)
    try {
      setBranch(await updateBranch(branch.id, { acceptingOrders: paused }))
    } catch (err) {
      setError(err?.message ?? 'Could not change that.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={`mb-4 flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border ${
        paused ? 'border-[#e2c98a] bg-[#fff8e5]' : 'border-border-light bg-white'
      }`}
    >
      <span className="font-display text-sm text-black">
        {paused ? (
          <>
            <strong>{branch.name} is not taking new orders.</strong> Orders already placed
            are unaffected.
          </>
        ) : (
          <>
            <strong>{branch.name}</strong> is taking orders.
          </>
        )}
      </span>

      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`ml-auto inline-flex items-center gap-2 h-9 px-4 rounded-lg border-none text-xs font-display font-bold cursor-pointer disabled:opacity-60 ${
          paused ? 'bg-accent text-white' : 'bg-[#c0392b] text-white'
        }`}
      >
        {paused ? <FaPlay aria-hidden="true" /> : <FaPause aria-hidden="true" />}
        {busy ? 'Saving…' : paused ? 'Start taking orders' : 'Stop taking orders'}
      </button>

      {error && (
        <p role="alert" className="m-0 w-full text-xs text-[#c0392b]">
          {error}
        </p>
      )}
    </div>
  )
}
