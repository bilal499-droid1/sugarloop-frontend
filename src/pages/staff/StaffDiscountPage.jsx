import { useEffect, useState } from 'react'
import { fetchShopSettings, updateShopSettings } from '../../lib/staffApi'

const MAX_PERCENT = 90

const inputClass =
  'h-10 w-24 px-3 rounded-lg border border-border-light font-price font-bold text-base text-black outline-none focus:border-accent'

/**
 * The checkout discount, set from the console instead of by a code change and a deploy.
 *
 * One value for every branch, taken off the items (never the delivery fee). Admin only:
 * the server refuses a branch manager and records which admin changed it. A customer part-way through checkout when it
 * changes is shown the new total before they can place the order, because the server
 * re-prices every order and refuses one whose total moved.
 */
export default function StaffDiscountPage() {
  const [saved, setSaved] = useState(null)
  const [value, setValue] = useState('')
  const [loadError, setLoadError] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchShopSettings({ signal: controller.signal })
      .then((settings) => {
        setSaved(settings)
        setValue(String(settings.checkoutDiscountPercent))
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') setLoadError(err?.message ?? 'Could not load the discount.')
      })
    return () => controller.abort()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setDone(false)

    // Checked here as well as on the server, so the common slips get an answer at once.
    const trimmed = value.trim()
    const percent = Number(trimmed)
    if (trimmed === '' || !Number.isInteger(percent) || percent < 0 || percent > MAX_PERCENT) {
      setError(`Enter a whole number from 0 to ${MAX_PERCENT}. 0 turns the discount off.`)
      return
    }

    setSaving(true)
    try {
      const settings = await updateShopSettings({ checkoutDiscountPercent: percent })
      setSaved(settings)
      setValue(String(settings.checkoutDiscountPercent))
      setDone(true)
    } catch (err) {
      setError(
        (Array.isArray(err?.details) && err.details[0]?.message) ||
          err?.message ||
          'Could not save the discount.'
      )
    } finally {
      setSaving(false)
    }
  }

  const current = saved?.checkoutDiscountPercent

  return (
    <div className="max-w-[32rem]">
      <h1 className="m-0 mb-4 font-display font-bold text-xl text-black">Discount</h1>

      {loadError && (
        <p className="m-0 mb-4 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {loadError}
        </p>
      )}

      {saved && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border-light rounded-2xl p-5 flex flex-col gap-4"
        >
          <div>
            <h2 className="m-0 font-display font-bold text-base text-black">Checkout discount</h2>
            <p className="m-0 mt-1 text-xs text-text-body">
              {current > 0
                ? `Customers get ${current}% off the items at checkout, at every branch.`
                : 'No discount is running. Customers pay full price.'}
            </p>
          </div>

          {done && (
            <p className="m-0 px-3 py-2 rounded-lg bg-[#eaf7ee] text-xs text-[#227a3f]">
              Saved. New orders get {current > 0 ? `${current}% off` : 'no discount'} from now on.
              Orders already placed keep their price.
            </p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="font-display font-medium text-xs text-text-body">
              Discount (%)
            </span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max={MAX_PERCENT}
                step="1"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value)
                  setDone(false)
                }}
                className={inputClass}
              />
              <span className="font-display font-bold text-base text-black">%</span>
            </span>
            {error ? (
              <span className="text-[0.7rem] text-[#c0392b]">{error}</span>
            ) : (
              <span className="text-[0.7rem] text-text-body/80">
                Comes off the items only, never the delivery fee. 0 turns it off. The Rs 500
                delivery minimum is checked before the discount.
              </span>
            )}
          </label>

          <button
            type="submit"
            disabled={saving || value.trim() === String(current)}
            className="self-start h-10 px-5 rounded-lg border-none bg-accent text-white text-sm font-display font-bold cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}
    </div>
  )
}
