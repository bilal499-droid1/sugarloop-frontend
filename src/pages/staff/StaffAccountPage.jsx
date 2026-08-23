import { useState } from 'react'
import { useStaffAuth } from '../../context/StaffAuthContext'
import { changeMyPassword } from '../../lib/staffApi'
import { STAFF_ROLE_LABEL, describePasswordProblem } from '../../lib/staffConstants'

const inputClass =
  'h-9 w-full px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent'

function Field({ label, error, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-display font-medium text-xs text-text-body">{label}</span>
      {children}
      {error ? (
        <span className="text-[0.7rem] text-[#c0392b]">{error}</span>
      ) : hint ? (
        <span className="text-[0.7rem] text-text-body/80">{hint}</span>
      ) : null}
    </label>
  )
}

/**
 * Your own account, and the one thing you can do to it: change your password.
 *
 * This screen is why the first password an admin hands out can be a throwaway. Without
 * it, every password in the system is one the admin chose, typed into WhatsApp, and can
 * still read — and nobody but the admin can ever rotate it.
 *
 * Available to every signed-in staff member, admin or branch manager. It is deliberately
 * NOT the same endpoint as the admin reset on the Team screen: this one demands the
 * current password, because a 15-minute access token left open on a phone in a kitchen
 * must not be enough to take an account over permanently.
 */
export default function StaffAccountPage() {
  const { staffUser } = useStaffAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [fieldError, setFieldError] = useState(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setFieldError(null)
    setDone(false)

    // Confirmation is a browser-side idea — the API has no second field, because it has
    // no way to tell a typo from an intention. Checking it here is the whole point: a
    // mistyped new password locks you out of an account you were trying to secure.
    if (newPassword !== confirmation) {
      setFieldError({ confirmation: 'These do not match.' })
      return
    }

    const problem = describePasswordProblem(newPassword)
    if (problem) {
      setFieldError({ newPassword: problem })
      return
    }

    if (newPassword === currentPassword) {
      setFieldError({ newPassword: 'Choose something different from your current password.' })
      return
    }

    setSaving(true)
    try {
      await changeMyPassword({ currentPassword, newPassword })
      setDone(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmation('')
    } catch (err) {
      // The server answers INVALID_PASSWORD when the current one is wrong. That belongs
      // against the field it describes, not as a sentence at the top of the form.
      if (err?.code === 'INVALID_PASSWORD') {
        setFieldError({ currentPassword: err.message })
      } else if (Array.isArray(err?.details) && err.details.length > 0) {
        setFieldError({ newPassword: err.details[0].message })
      } else {
        setError(err?.message ?? 'Could not change your password.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[32rem]">
      <h1 className="m-0 mb-4 font-display font-bold text-xl text-black">Account</h1>

      <div className="mb-5 bg-white border border-border-light rounded-2xl p-5">
        <p className="m-0 font-display font-bold text-base text-black">{staffUser?.name}</p>
        <p className="m-0 mt-0.5 text-xs text-text-body">{staffUser?.email}</p>
        <p className="m-0 mt-2 text-xs text-text-body">
          {STAFF_ROLE_LABEL[staffUser?.role] ?? staffUser?.role}
          {staffUser?.branch?.name ? ` · ${staffUser.branch.name}` : ' · all branches'}
        </p>
        <p className="m-0 mt-3 text-[0.7rem] text-text-body/80">
          Your name, email, role and branch are set by an admin.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border-light rounded-2xl p-5 flex flex-col gap-4"
      >
        <h2 className="m-0 font-display font-bold text-base text-black">Change password</h2>

        {done && (
          <p className="m-0 px-3 py-2 rounded-lg bg-[#eaf7ee] text-xs text-[#227a3f]">
            Done. Every other device you were signed in on has been signed out. This one stays
            signed in.
          </p>
        )}
        {error && (
          <p role="alert" className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
            {error}
          </p>
        )}

        <Field label="Current password" error={fieldError?.currentPassword}>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </Field>

        <Field
          label="New password"
          error={fieldError?.newPassword}
          hint="At least 12 characters. A short phrase you can remember beats a short scramble you cannot."
        >
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            className={inputClass}
          />
        </Field>

        <Field label="New password again" error={fieldError?.confirmation}>
          <input
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
            autoComplete="new-password"
            className={inputClass}
          />
        </Field>

        <p className="m-0 px-3 py-2 rounded-lg bg-[#fff8e5] text-xs text-[#8a6d1f]">
          Changing this signs you out on every other device. Do it if you think somebody else
          knows your password.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="h-9 px-4 self-start rounded-lg border-none bg-accent text-white font-display font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Changing…' : 'Change password'}
        </button>
      </form>
    </div>
  )
}
