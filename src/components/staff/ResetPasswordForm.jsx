import { useState } from 'react'
import { FaCopy, FaCheck, FaRedo } from 'react-icons/fa'
import { resetStaffPassword } from '../../lib/staffApi'
import { describePasswordProblem, generatePassword } from '../../lib/staffConstants'

/**
 * An admin setting somebody else's password.
 *
 * Deliberately does not ask for the old one — the whole reason this screen exists is that
 * the owner has lost it. That is also why it is kept apart from the edit form: it is a
 * different endpoint with a different consequence, and burying it among name and email
 * fields would make it look like an ordinary edit.
 *
 * Two things happen server-side that the operator has to be told about: every session
 * that person holds is revoked, and any lockout from failed sign-ins is cleared. The
 * second is usually why an admin is here at all.
 */
export default function ResetPasswordForm({ staffUser, onDone, onCancel }) {
  const [password, setPassword] = useState(() => generatePassword())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [done, setDone] = useState(false)

  const problem = describePasswordProblem(password)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Insecure origin or a browser that refuses. The value is on screen either way.
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (problem) {
      setError(problem)
      return
    }

    setSaving(true)
    setError(null)
    try {
      await resetStaffPassword(staffUser.id, password)
      // Stays on screen after success rather than closing: the admin still has to read
      // the password off it and send it. Closing the panel would destroy the only copy.
      setDone(true)
    } catch (err) {
      const detail = Array.isArray(err?.details) ? err.details[0]?.message : null
      setError(detail ?? err?.message ?? 'Could not reset this password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border-light rounded-2xl p-5 flex flex-col gap-4"
    >
      <div>
        <h2 className="m-0 font-display font-bold text-base text-black">Reset password</h2>
        <p className="m-0 mt-1 text-xs text-text-body">
          for {staffUser.name} · {staffUser.email}
        </p>
      </div>

      {error && (
        <p role="alert" className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="font-display font-medium text-xs text-text-body">New password</span>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            readOnly={done}
            autoComplete="off"
            spellCheck={false}
            className="h-9 w-full px-2 rounded-lg border border-border-light font-mono text-sm text-black tracking-tight outline-none focus:border-accent read-only:bg-black/5"
          />
          {!done && (
            <button
              type="button"
              onClick={() => setPassword(generatePassword())}
              title="Generate a different one"
              aria-label="Generate a different password"
              className="shrink-0 h-9 w-9 grid place-items-center rounded-lg border border-border-light bg-white text-text-body cursor-pointer hover:border-accent hover:text-accent"
            >
              <FaRedo className="text-xs" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={copy}
            title="Copy"
            aria-label="Copy password"
            className="shrink-0 h-9 w-9 grid place-items-center rounded-lg border border-border-light bg-white text-text-body cursor-pointer hover:border-accent hover:text-accent"
          >
            {copied ? (
              <FaCheck className="text-xs text-[#227a3f]" aria-hidden="true" />
            ) : (
              <FaCopy className="text-xs" aria-hidden="true" />
            )}
          </button>
        </div>
      </label>

      {done ? (
        <>
          <p className="m-0 px-3 py-2 rounded-lg bg-[#eaf7ee] text-xs text-[#227a3f]">
            Done. {staffUser.name} has been signed out everywhere and any lockout is cleared.
            Send them this password — it is not stored anywhere you can read it again.
          </p>
          <button
            type="button"
            onClick={onDone}
            className="h-9 px-4 self-start rounded-lg border-none bg-accent text-white font-display font-semibold text-sm cursor-pointer"
          >
            I've sent it
          </button>
        </>
      ) : (
        <>
          <p className="m-0 px-3 py-2 rounded-lg bg-[#fff8e5] text-xs text-[#8a6d1f]">
            This signs {staffUser.name} out of every device and clears any lockout from failed
            sign-ins.
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 rounded-lg border-none bg-accent text-white font-display font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Resetting…' : 'Reset password'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-lg border border-border-light bg-white font-display font-medium text-sm text-text-body cursor-pointer hover:border-accent hover:text-accent"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </form>
  )
}
