import { useState } from 'react'
import { FaKey, FaPen, FaPowerOff, FaUndo } from 'react-icons/fa'
import { deactivateStaffUser, updateStaffUser } from '../../lib/staffApi'
import { STAFF_ROLE_LABEL } from '../../lib/staffConstants'

const dateTime = new Intl.DateTimeFormat('en-PK', {
  timeZone: 'Asia/Karachi',
  dateStyle: 'medium',
  timeStyle: 'short',
})

function Field({ label, children }) {
  return (
    <div>
      <p className="m-0 text-[0.7rem] uppercase tracking-wide text-text-body/70">{label}</p>
      <div className="mt-0.5 text-sm text-black">{children}</div>
    </div>
  )
}

const actionClass =
  'flex items-center gap-2 h-9 px-3 rounded-lg border border-border-light bg-white font-display font-medium text-sm text-text-body cursor-pointer hover:border-accent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-light disabled:hover:text-text-body'

/**
 * One staff member: what is true about them, and what an admin may do about it.
 *
 * The three destructive-ish rules are mirrored from the server rather than left to be
 * discovered through a refused request — you cannot switch off your own account, and you
 * cannot switch off the last active admin (that one is only knowable server-side, so it
 * arrives as a 409 and is shown verbatim).
 */
export default function StaffUserPanel({ staffUser, isSelf, onEdit, onResetPassword, onChanged }) {
  // Two-step rather than a typed confirmation. Deactivating is reversible with one click
  // and the genuinely dangerous cases (yourself, the last admin) are refused outright, so
  // demanding a typed name would be friction that buys nothing.
  const [confirming, setConfirming] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState(null)

  const run = async (action) => {
    setWorking(true)
    setError(null)
    try {
      onChanged(await action())
      setConfirming(false)
    } catch (err) {
      setError(err?.message ?? 'That did not work.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="bg-white border border-border-light rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 font-display font-bold text-base text-black">
            {staffUser.name}
            {isSelf && (
              <span className="ml-2 align-middle px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[0.65rem] font-semibold">
                You
              </span>
            )}
          </h2>
          <p className="m-0 mt-0.5 text-xs text-text-body">{staffUser.email}</p>
        </div>
        <span
          className={`shrink-0 px-2 py-1 rounded-full text-[0.65rem] font-display font-semibold ${
            staffUser.isActive ? 'bg-[#eaf7ee] text-[#227a3f]' : 'bg-[#f1f1f1] text-text-body'
          }`}
        >
          {staffUser.isActive ? 'Active' : 'Switched off'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Role">{STAFF_ROLE_LABEL[staffUser.role] ?? staffUser.role}</Field>
        <Field label="Branch">
          {/* Keyed off the ROLE, not off the branch being absent. "All branches" is what
              being an admin means; a manager with no branch name is a data problem, and
              printing the admin's label over it would hide it. */}
          {staffUser.role === 'admin' ? (
            <span className="text-text-body">All branches</span>
          ) : (
            (staffUser.branch?.name ?? staffUser.branch?.code ?? (
              <span className="text-text-body">No branch</span>
            ))
          )}
        </Field>
        <Field label="Last signed in">
          {staffUser.lastLoginAt ? (
            dateTime.format(new Date(staffUser.lastLoginAt))
          ) : (
            <span className="text-text-body">Never</span>
          )}
        </Field>
        <Field label="Added">
          {staffUser.createdAt ? dateTime.format(new Date(staffUser.createdAt)) : '—'}
        </Field>
      </div>

      {error && (
        <p role="alert" className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {error}
        </p>
      )}

      {confirming ? (
        <div className="flex flex-col gap-3 px-3 py-3 rounded-lg bg-[#fff8e5]">
          <p className="m-0 text-xs text-[#8a6d1f]">
            Switch off {staffUser.name}? They are signed out immediately and cannot sign in
            again. Their name stays on every order they handled, and you can switch them back
            on at any time.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={working}
              onClick={() => run(() => deactivateStaffUser(staffUser.id))}
              className="h-9 px-4 rounded-lg border-none bg-[#c0392b] text-white font-display font-semibold text-sm cursor-pointer disabled:opacity-50"
            >
              {working ? 'Switching off…' : 'Yes, switch off'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-9 px-4 rounded-lg border border-border-light bg-white font-display font-medium text-sm text-text-body cursor-pointer"
            >
              Keep active
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onEdit} className={actionClass}>
            <FaPen className="text-xs" aria-hidden="true" />
            Edit
          </button>

          <button
            type="button"
            onClick={onResetPassword}
            disabled={isSelf}
            title={
              isSelf
                ? 'Change your own password from Account — it asks for your current one.'
                : undefined
            }
            className={actionClass}
          >
            <FaKey className="text-xs" aria-hidden="true" />
            Reset password
          </button>

          {staffUser.isActive ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={isSelf}
              title={isSelf ? 'You cannot switch off your own account.' : undefined}
              className={actionClass}
            >
              <FaPowerOff className="text-xs" aria-hidden="true" />
              Switch off
            </button>
          ) : (
            <button
              type="button"
              disabled={working}
              onClick={() => run(() => updateStaffUser(staffUser.id, { isActive: true }))}
              className={actionClass}
            >
              <FaUndo className="text-xs" aria-hidden="true" />
              {working ? 'Switching on…' : 'Switch back on'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
