import { useMemo, useState } from 'react'
import { FaCopy, FaCheck, FaRedo } from 'react-icons/fa'
import { createStaffUser, updateStaffUser } from '../../lib/staffApi'
import {
  STAFF_ROLES,
  STAFF_ROLE_LABEL,
  describePasswordProblem,
  generatePassword,
} from '../../lib/staffConstants'

const inputClass =
  'h-9 w-full px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent disabled:bg-black/5 disabled:text-text-body'

function Field({ label, hint, error, children }) {
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
 * The first password for a new account, shown once.
 *
 * Generated rather than invented by the admin, because four managers handed passwords by
 * one person is exactly how four managers end up sharing `sugarloop123`. It stays
 * editable: an admin who wants to set something specific still can.
 *
 * "Shown once" is literal — the API returns the account, never the password, so once this
 * panel closes the only copy is whatever the admin wrote down. The owner replaces it from
 * their own account page, which is the point of the whole exercise.
 */
function PasswordField({ value, onChange, error }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access is refused on insecure origins and by some browsers. The value
      // is visible in the field, so a failed copy costs a manual selection, not the flow.
    }
  }

  return (
    <Field
      label="First password"
      error={error}
      hint="Shown once. Send it to them, and ask them to change it from Account after their first sign-in."
    >
      <div className="flex gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className={`${inputClass} font-mono tracking-tight`}
        />
        <button
          type="button"
          onClick={() => onChange(generatePassword())}
          title="Generate a different one"
          aria-label="Generate a different password"
          className="shrink-0 h-9 w-9 grid place-items-center rounded-lg border border-border-light bg-white text-text-body cursor-pointer hover:border-accent hover:text-accent"
        >
          <FaRedo className="text-xs" aria-hidden="true" />
        </button>
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
    </Field>
  )
}

/**
 * Create and edit in one component, because the fields are the same set and keeping them
 * in two files guarantees they drift.
 *
 * Two rules are mirrored from the server rather than merely enforced there:
 *
 *   - An admin has NO branch; a branch manager MUST have one. Picking Admin empties and
 *     disables the branch select, because sending both is a 422.
 *   - You cannot change your own role. The server answers 403; offering the control and
 *     then explaining the refusal is worse than not offering it.
 */
export default function StaffUserForm({ mode, staffUser, branches, isSelf, onSaved, onCancel }) {
  const isCreate = mode === 'create'

  const [name, setName] = useState(staffUser?.name ?? '')
  const [email, setEmail] = useState(staffUser?.email ?? '')
  const [role, setRole] = useState(staffUser?.role ?? 'branch_manager')
  const [branchId, setBranchId] = useState(staffUser?.branch?.id ?? '')
  // Generated once on mount rather than on every render, or it would change under the
  // admin's cursor while they were reading it.
  const [password, setPassword] = useState(() => (isCreate ? generatePassword() : ''))

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const isAdminRole = role === 'admin'

  /**
   * Editing a field clears the complaint about it.
   *
   * Without this, picking the branch the form just demanded leaves "A branch manager must
   * be assigned to a branch" sitting under the now-correct select, which reads as the
   * choice not having registered.
   */
  const edit = (setter, field) => (value) => {
    setter(value)
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const { [field]: _cleared, ...rest } = current
        return rest
      })
    }
  }

  /** Only what actually moved. An empty PATCH is a 422 by design on the server. */
  const changes = useMemo(() => {
    if (isCreate) return null

    const patch = {}
    if (name.trim() !== staffUser.name) patch.name = name.trim()
    if (email.trim().toLowerCase() !== staffUser.email) patch.email = email.trim().toLowerCase()
    if (role !== staffUser.role) patch.role = role
    const nextBranch = isAdminRole ? null : branchId
    if (nextBranch !== (staffUser.branch?.id ?? null)) patch.branchId = nextBranch
    return patch
  }, [isCreate, name, email, role, branchId, isAdminRole, staffUser])

  const nothingChanged = !isCreate && Object.keys(changes).length === 0

  const passwordProblem = isCreate ? describePasswordProblem(password) : null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    if (!isAdminRole && !branchId) {
      setFieldErrors({ branchId: 'A branch manager must be assigned to a branch.' })
      return
    }
    if (passwordProblem) {
      setFieldErrors({ password: passwordProblem })
      return
    }

    setSaving(true)
    try {
      const saved = isCreate
        ? await createStaffUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
            branchId,
          })
        : await updateStaffUser(staffUser.id, changes)

      onSaved(saved, { created: isCreate })
    } catch (error) {
      // Zod and Mongoose validation both come back as `[{ field, message }]`, so a 422
      // lands on the input that caused it instead of as a sentence above the form.
      if (Array.isArray(error?.details) && error.details.length > 0) {
        setFieldErrors(
          Object.fromEntries(error.details.map(({ field, message }) => [field, message]))
        )
        setFormError(null)
      } else {
        setFormError(error?.message ?? 'Could not save this account.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border-light rounded-2xl p-5 flex flex-col gap-4"
    >
      <h2 className="m-0 font-display font-bold text-base text-black">
        {isCreate ? 'Add a staff member' : `Edit ${staffUser.name}`}
      </h2>

      {formError && (
        <p role="alert" className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {formError}
        </p>
      )}

      <Field label="Name" error={fieldErrors.name}>
        <input
          type="text"
          value={name}
          onChange={(e) => edit(setName, 'name')(e.target.value)}
          required
          maxLength={120}
          className={inputClass}
        />
      </Field>

      <Field label="Email" error={fieldErrors.email}>
        <input
          type="email"
          value={email}
          onChange={(e) => edit(setEmail, 'email')(e.target.value)}
          required
          autoComplete="off"
          className={inputClass}
        />
      </Field>

      <Field
        label="Role"
        error={fieldErrors.role}
        hint={isSelf ? 'You cannot change your own role — ask another admin.' : undefined}
      >
        <select
          value={role}
          onChange={(e) => edit(setRole, 'role')(e.target.value)}
          disabled={isSelf}
          className={inputClass}
        >
          {STAFF_ROLES.map((value) => (
            <option key={value} value={value}>
              {STAFF_ROLE_LABEL[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Branch"
        error={fieldErrors.branchId}
        hint={isAdminRole ? 'An admin works across all four branches.' : undefined}
      >
        <select
          value={isAdminRole ? '' : branchId}
          onChange={(e) => edit(setBranchId, 'branchId')(e.target.value)}
          disabled={isAdminRole}
          className={inputClass}
        >
          <option value="">{isAdminRole ? 'All branches' : 'Choose a branch…'}</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </Field>

      {isCreate && (
        <PasswordField value={password} onChange={edit(setPassword, 'password')} error={fieldErrors.password} />
      )}

      {!isCreate && changes.role !== undefined && (
        <p className="m-0 px-3 py-2 rounded-lg bg-[#fff8e5] text-xs text-[#8a6d1f]">
          Changing a role signs {staffUser.name} out of every device immediately.
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving || nothingChanged}
          className="h-9 px-4 rounded-lg border-none bg-accent text-white font-display font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : isCreate ? 'Create account' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-lg border border-border-light bg-white font-display font-medium text-sm text-text-body cursor-pointer hover:border-accent hover:text-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
