import { useState } from 'react'
import { FaEnvelope, FaPhone, FaExclamationTriangle } from 'react-icons/fa'
import { updateEnquiry } from '../../lib/staffApi'
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_HINT,
  ENQUIRY_STATUS_LABEL,
} from '../../lib/staffConstants'

const dateTime = new Intl.DateTimeFormat('en-PK', {
  timeZone: 'Asia/Karachi',
  dateStyle: 'medium',
  timeStyle: 'short',
})

function Field({ label, children }) {
  return (
    <div>
      <p className="m-0 text-[0.7rem] uppercase tracking-wide text-text-body/70">{label}</p>
      <div className="mt-0.5 text-sm text-black break-words">{children}</div>
    </div>
  )
}

/**
 * One corporate lead, and the two things an admin does with it: get in touch, and record
 * that they did.
 *
 * The phone and email are links rather than plain text — this screen exists to be acted
 * on, and making somebody retype a number they are looking at is the difference between
 * a tool and a report.
 */
export default function EnquiryPanel({ enquiry, onChanged }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const run = async (payload) => {
    setBusy(true)
    setError(null)
    try {
      onChanged(await updateEnquiry(enquiry.id, payload))
      setNote('')
    } catch (err) {
      setError(err?.message ?? 'Could not save that.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white border border-border-light rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 font-display font-bold text-base text-black truncate">
            {enquiry.company || enquiry.name}
          </h2>
          <p className="m-0 mt-0.5 text-xs text-text-body">
            {enquiry.company ? `${enquiry.name} · ` : ''}
            {dateTime.format(new Date(enquiry.receivedAt))} · ref {enquiry.reference}
          </p>
        </div>
        <span className="shrink-0 px-2 py-1 rounded-full bg-accent/10 text-accent text-[0.65rem] font-display font-semibold">
          {ENQUIRY_STATUS_LABEL[enquiry.status] ?? enquiry.status}
        </span>
      </div>

      {/* The lead exists and is safe — it is stored before the email is attempted — but
          nobody has been told about it, so it will never surface in the shop's inbox.
          This screen is the only place it can be found. */}
      {!enquiry.emailed && (
        <p className="m-0 flex items-start gap-2 px-3 py-2 rounded-lg bg-[#fff8e5] text-xs text-[#8a6d1f]">
          <FaExclamationTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            The notification email for this one never sent, so it is not in the shop's inbox.
            Nobody has been alerted except through this screen.
          </span>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Contact">{enquiry.name}</Field>
        <Field label="Company">
          {enquiry.company || <span className="text-text-body">Not given</span>}
        </Field>
        <Field label="Phone">
          {/* Optional on a question — the server only demands it of a gifting lead, whom
              somebody is going to ring about a quote. Rendering the link anyway would
              give this panel a `tel:` that dials nothing. */}
          {enquiry.phone ? (
            <a
              href={`tel:${enquiry.phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-1.5 text-accent no-underline hover:underline"
            >
              <FaPhone className="text-[0.7rem]" aria-hidden="true" />
              {enquiry.phone}
            </a>
          ) : (
            <span className="text-text-body">Not given</span>
          )}
        </Field>
        <Field label="Email">
          <a
            href={`mailto:${enquiry.email}`}
            className="inline-flex items-center gap-1.5 text-accent no-underline hover:underline"
          >
            <FaEnvelope className="text-[0.7rem]" aria-hidden="true" />
            {enquiry.email}
          </a>
        </Field>
      </div>

      {enquiry.subject && <Field label="Subject">{enquiry.subject}</Field>}

      {enquiry.message && (
        <Field label="What they asked for">
          {/* whitespace-pre-line: they typed line breaks, and flattening them turns a
              list of requirements into a paragraph. */}
          <p className="m-0 whitespace-pre-line leading-relaxed">{enquiry.message}</p>
        </Field>
      )}

      {error && (
        <p role="alert" className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {error}
        </p>
      )}

      <div>
        <p className="m-0 mb-1.5 text-[0.7rem] uppercase tracking-wide text-text-body/70">
          Mark as
        </p>
        <div className="flex flex-wrap gap-2">
          {ENQUIRY_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={busy || status === enquiry.status}
              title={ENQUIRY_STATUS_HINT[status]}
              onClick={() => run({ status, ...(note.trim() ? { note: note.trim() } : {}) })}
              className={`h-9 px-3 rounded-lg font-display font-medium text-sm cursor-pointer transition-colors ${
                status === enquiry.status
                  ? 'bg-accent text-white border-none cursor-default'
                  : 'bg-white border border-border-light text-text-body hover:border-accent hover:text-accent'
              } disabled:opacity-60`}
            >
              {ENQUIRY_STATUS_LABEL[status]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="m-0 mb-1.5 text-[0.7rem] uppercase tracking-wide text-text-body/70">
          Notes
        </p>

        {enquiry.notes.length === 0 ? (
          <p className="m-0 mb-2 text-xs text-text-body">
            Nothing recorded yet. Whoever picks this up next will read what you write here.
          </p>
        ) : (
          <ul className="m-0 mb-3 p-0 list-none flex flex-col gap-2">
            {enquiry.notes.map((entry, index) => (
              <li key={index} className="px-3 py-2 rounded-lg bg-[#f6f7f9]">
                <p className="m-0 text-sm text-black whitespace-pre-line">{entry.text}</p>
                <p className="m-0 mt-1 text-[0.7rem] text-text-body">
                  {entry.byName} · {dateTime.format(new Date(entry.at))}
                </p>
              </li>
            ))}
          </ul>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Rang them — wants a quote for 200 boxes by Friday"
          className="w-full py-2 px-3 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent resize-y"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={busy || !note.trim()}
            onClick={() => run({ note: note.trim() })}
            className="h-9 px-4 rounded-lg border-none bg-accent text-white font-display font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Saving…' : 'Add note'}
          </button>
          <span className="text-[0.7rem] text-text-body/80">
            Notes can't be edited or deleted afterwards.
          </span>
        </div>
      </div>
    </div>
  )
}
