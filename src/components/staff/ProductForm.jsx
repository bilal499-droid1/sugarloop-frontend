import { useState } from 'react'
import {
  createStaffProduct,
  updateStaffProduct,
  toPaisa,
  toRupees,
} from '../../lib/staffApi'
import { PRODUCT_CATEGORIES } from '../../lib/staffConstants'

const fieldClass =
  'w-full h-10 px-3 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent'

const labelClass = 'font-display font-medium text-xs text-text-body'

function Field({ label, hint, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      {children}
      {hint && !error && <span className="text-[0.7rem] text-text-body/75">{hint}</span>}
      {error && <span className="text-[0.7rem] text-red-600">{error}</span>}
    </label>
  )
}

/**
 * Create or edit a catalogue item.
 *
 * **The price field is in rupees and the request is in paisa.** That conversion happens
 * in `toPaisa`, once, and this is the only screen in the app that performs it — an admin
 * types 299 off a printed menu, the server stores 29900, and nothing in between is
 * allowed to guess which unit it is holding. Getting this backwards does not fail: it
 * produces a donut that costs Rs 2.99, and the first sign is the day's takings.
 *
 * On edit, only changed fields are sent. The server rejects an empty patch, which is the
 * right answer to a form that was opened and closed.
 */
export default function ProductForm({ product, onSaved, onCancel }) {
  const isEdit = Boolean(product)

  const [form, setForm] = useState(() => ({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    slug: product?.slug ?? '',
    category: product?.category ?? PRODUCT_CATEGORIES[0],
    type: product?.type ?? '',
    // Rupees in the box. See the note above.
    price: product ? String(toRupees(product.price)) : '',
    description: product?.description ?? '',
    boxEligible: product?.boxEligible ?? false,
    isFeatured: product?.isFeatured ?? false,
    sortOrder: String(product?.sortOrder ?? 100),
  }))

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
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
    setError(null)
    setFieldErrors({})

    const price = toPaisa(form.price)
    if (price === null) {
      setFieldErrors({ price: 'Enter a price in rupees' })
      return
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      type: form.type.trim(),
      price,
      description: form.description.trim(),
      boxEligible: form.boxEligible,
      isFeatured: form.isFeatured,
      sortOrder: Number(form.sortOrder) || 0,
    }

    // Only on create: the SKU is what a POS maps against and the server refuses to change
    // it, and an empty slug means "derive one from the name".
    if (!isEdit) {
      payload.sku = form.sku.trim()
      if (form.slug.trim()) payload.slug = form.slug.trim()
    } else if (form.slug.trim() && form.slug.trim() !== product.slug) {
      payload.slug = form.slug.trim()
    }

    setSaving(true)
    try {
      const saved = isEdit
        ? await updateStaffProduct(product.id, payload)
        : await createStaffProduct(payload)

      onSaved(saved, { created: !isEdit })
    } catch (err) {
      if (Array.isArray(err?.details) && err.details.length > 0) {
        setFieldErrors(
          Object.fromEntries(err.details.map(({ field, message }) => [field, message]))
        )
      } else if (err?.code === 'CONFLICT') {
        setError('That SKU or web address is already used by another product.')
      } else {
        setError(err?.message ?? 'Could not save that.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border-light rounded-xl p-4 lg:p-5"
    >
      <h2 className="m-0 mb-4 font-display font-bold text-base text-black">
        {isEdit ? `Edit ${product.name}` : 'New product'}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" error={fieldErrors.name}>
          <input className={fieldClass} value={form.name} onChange={set('name')} required />
        </Field>

        <Field
          label="Price (Rs)"
          hint="What you'd print on the menu — 299, not 29900."
          error={fieldErrors.price}
        >
          <input
            className={fieldClass}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={form.price}
            onChange={set('price')}
            required
          />
        </Field>

        <Field
          label="SKU"
          hint={
            isEdit
              ? 'Fixed once created — the POS maps against it.'
              : 'Uppercase, hyphenated. e.g. DON-PISTACHIO-CREAM'
          }
          error={fieldErrors.sku}
        >
          <input
            className={`${fieldClass} ${isEdit ? 'bg-black/[0.04] text-text-body' : ''}`}
            value={form.sku}
            onChange={set('sku')}
            readOnly={isEdit}
            required={!isEdit}
          />
        </Field>

        <Field
          label="Web address"
          hint={isEdit ? 'Changing this breaks existing links.' : 'Leave blank to build it from the name.'}
          error={fieldErrors.slug}
        >
          <input className={fieldClass} value={form.slug} onChange={set('slug')} />
        </Field>

        <Field label="Category" error={fieldErrors.category}>
          <select className={fieldClass} value={form.category} onChange={set('category')}>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Menu sub-heading" hint="e.g. Signature, Crafted Donuts" error={fieldErrors.type}>
          <input className={fieldClass} value={form.type} onChange={set('type')} />
        </Field>

        <Field label="Sort order" hint="Lower sorts first within its category." error={fieldErrors.sortOrder}>
          <input
            className={fieldClass}
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={set('sortOrder')}
          />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Description" error={fieldErrors.description}>
          <textarea
            className={`${fieldClass} h-auto min-h-[5rem] py-2 resize-y`}
            value={form.description}
            onChange={set('description')}
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 font-display text-sm text-black">
          <input type="checkbox" checked={form.boxEligible} onChange={set('boxEligible')} />
          Can go in a Build Your Box
        </label>
        <label className="flex items-center gap-2 font-display text-sm text-black">
          <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} />
          Featured on the home page
        </label>
      </div>

      {error && <p className="mt-3 mb-0 font-display text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-5 rounded-lg border-none bg-accent text-white font-display font-bold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-5 rounded-lg border border-border-light bg-white font-display font-medium text-sm text-text-body cursor-pointer hover:border-accent hover:text-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
