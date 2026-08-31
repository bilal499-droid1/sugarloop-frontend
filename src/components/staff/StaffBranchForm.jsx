import { useState } from 'react'
import { createBranch } from '../../lib/staffApi'

const inputClass =
  'h-9 w-full px-2 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent'

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

const EMPTY = {
  code: '',
  name: '',
  address: '',
  phone: '',
  lat: '',
  lng: '',
}

/**
 * Opening a shop.
 *
 * Exists because a new branch manager needs a branch to manage: `POST /staff/users`
 * demands a `branchId`, so until the shop is a row there is nobody to assign. Branches
 * used to be seed-only, which meant a developer and a deploy to open one.
 *
 * Only the six fields with no sensible default are asked for. Hours (11:00–03:00), the
 * 2 km delivery radius, the 30-minute last-order cutoff and both fulfilment modes are the
 * client's standing terms and are left to the server — an admin opening a fifth shop on
 * the same terms should not have to restate them, and the server owns those defaults
 * anyway.
 *
 * Coordinates are typed rather than geocoded. The four seeded branches came from the
 * client's own Google Maps pins for a reason the geocoder cannot fix yet: OpenStreetMap
 * resolves areas but not individual buildings, so asking it to find "Nadir Arcade" returns
 * nothing. A pin the admin reads off a map is right; a lookup that silently misses by
 * 300 m puts every delivery quote at the wrong shop.
 */
export default function StaffBranchForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const edit = (key) => (event) => {
    const { value } = event.target
    setForm((current) => ({ ...current, [key]: value }))
    if (fieldErrors[key]) {
      setFieldErrors((current) => {
        const { [key]: _cleared, ...rest } = current
        return rest
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const lat = Number(form.lat)
    const lng = Number(form.lng)

    // Caught here rather than left to the 422, because `Number('')` is 0 — a blank pin
    // would otherwise submit as the Gulf of Guinea rather than as a missing field.
    if (!Number.isFinite(lat) || form.lat.trim() === '') {
      setFieldErrors({ lat: 'Enter the latitude from the map pin.' })
      return
    }
    if (!Number.isFinite(lng) || form.lng.trim() === '') {
      setFieldErrors({ lng: 'Enter the longitude from the map pin.' })
      return
    }

    setSaving(true)
    try {
      const branch = await createBranch({
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        location: { lat, lng },
      })

      onCreated(branch)
    } catch (error) {
      if (Array.isArray(error?.details) && error.details.length > 0) {
        // The server names the pin fields `location.lat` / `location.lng`; the inputs are
        // flat, so the prefix has to come off or the message lands on nothing.
        setFieldErrors(
          Object.fromEntries(
            error.details.map(({ field, message }) => [field.replace(/^location\./, ''), message])
          )
        )
      } else {
        setFormError(error?.message ?? 'Could not open this branch.')
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
      <h2 className="m-0 font-display font-bold text-base text-black">Add a new branch</h2>

      {formError && (
        <p role="alert" className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {formError}
        </p>
      )}

      <Field
        label="Code"
        error={fieldErrors.code}
        hint="2–10 letters or digits. Appears in every order number this branch issues, so it can never be changed."
      >
        <input
          type="text"
          value={form.code}
          onChange={edit('code')}
          required
          maxLength={10}
          placeholder="Short code"
          className={`${inputClass} uppercase`}
        />
      </Field>

      <Field label="Name" error={fieldErrors.name}>
        <input
          type="text"
          value={form.name}
          onChange={edit('name')}
          required
          maxLength={120}
          placeholder="The shop's name, as customers see it"
          className={inputClass}
        />
      </Field>

      <Field label="Address" error={fieldErrors.address}>
        <input
          type="text"
          value={form.address}
          onChange={edit('address')}
          required
          maxLength={300}
          placeholder="Street, area, city"
          className={inputClass}
        />
      </Field>

      <Field
        label="Phone"
        error={fieldErrors.phone}
        hint="Every WhatsApp message about this branch ends with this number."
      >
        <input
          type="tel"
          value={form.phone}
          onChange={edit('phone')}
          required
          maxLength={40}
          placeholder="This branch's own line"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude" error={fieldErrors.lat}>
          <input
            type="text"
            inputMode="decimal"
            value={form.lat}
            onChange={edit('lat')}
            required
            placeholder="First number"
            className={inputClass}
          />
        </Field>
        <Field label="Longitude" error={fieldErrors.lng}>
          <input
            type="text"
            inputMode="decimal"
            value={form.lng}
            onChange={edit('lng')}
            required
            placeholder="Second number"
            className={inputClass}
          />
        </Field>
      </div>

      <p className="m-0 px-3 py-2 rounded-lg bg-[#fff8e5] text-xs text-[#8a6d1f]">
        Right-click the shop in Google Maps and copy the two numbers it shows — latitude
        first. Deliveries are quoted from this pin, within 2 km.
      </p>

      <p className="m-0 text-[0.7rem] text-text-body/80">
        Opens 11:00–03:00 for delivery and pickup, with a 2 km radius and last orders 30
        minutes before close — the same terms as the other branches.
      </p>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="h-9 px-4 rounded-lg border-none bg-accent text-white font-display font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Adding…' : 'Add branch'}
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
