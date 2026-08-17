import { useState } from 'react'
import { FAILURE_REASON_LABEL, FAILURE_REASONS } from '../../lib/staffConstants'

/**
 * The one status change that needs more than a click.
 *
 * Mirrors the server's own rule (`services/orderStatus.js`) rather than trusting the
 * request to fail and showing that error: a reason is always required, and a note
 * becomes required the moment 'other' is picked — because 'other' with no explanation
 * is a missing reason code that happened to pass validation, and whoever reads the
 * monthly report in three months cannot ask the rider what happened.
 */
export default function FailOrderForm({ onSubmit, onCancel, busy }) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')

  const noteRequired = reason === 'other'
  const canSubmit = reason && (!noteRequired || note.trim().length > 0)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({ reason, note: note.trim() || null })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-4 rounded-xl border border-[#f3c9c4] bg-[#fef7f6] flex flex-col gap-3"
    >
      <p className="m-0 font-display font-bold text-sm text-[#c0392b]">Mark this order failed</p>

      <label className="flex flex-col gap-1.5">
        <span className="font-display font-medium text-xs text-text-body">Reason</span>
        <select
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-10 px-2 rounded-lg border border-border-light bg-white font-display text-sm text-black outline-none focus:border-accent"
        >
          <option value="" disabled>
            Choose a reason
          </option>
          {FAILURE_REASONS.map((code) => (
            <option key={code} value={code}>
              {FAILURE_REASON_LABEL[code]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-display font-medium text-xs text-text-body">
          Note {noteRequired ? '(required for "Other")' : '(optional)'}
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="e.g. Rang the customer twice, no answer"
          className="px-2 py-2 rounded-lg border border-border-light bg-white font-display text-sm text-black outline-none focus:border-accent resize-y"
        />
      </label>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="h-9 px-3 rounded-lg border border-border-light bg-white text-xs font-display font-medium text-text-body cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit || busy}
          className="h-9 px-4 rounded-lg border-none bg-[#c0392b] text-white text-xs font-display font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? 'Failing order…' : 'Confirm — mark failed'}
        </button>
      </div>
    </form>
  )
}
