import { useState } from 'react'
import { FaBoxOpen } from 'react-icons/fa'
import StatusBadge from './StatusBadge'
import FailOrderForm from './FailOrderForm'
import { FULFILMENT_LABEL, ORDER_STATUS_LABEL, TERMINAL_STATUSES } from '../../lib/staffConstants'

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

function ItemRow({ item }) {
  return (
    <div className="py-2 border-b border-border-light last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 font-display font-medium text-sm text-black">
          {item.qty} × {item.name}
          {item.kind === 'box' && (
            <span className="ml-1.5 inline-flex items-center gap-1 text-[0.65rem] text-accent align-middle">
              <FaBoxOpen aria-hidden="true" /> box of {item.boxSize}
            </span>
          )}
        </p>
        <p className="m-0 font-price font-bold text-sm text-accent whitespace-nowrap">
          {item.lineTotal.formatted}
        </p>
      </div>
      {item.kind === 'box' && item.children?.length > 0 && (
        <ul className="m-0 mt-1 pl-4 list-disc text-xs text-text-body">
          {item.children.map((child, i) => (
            <li key={`${child.sku}-${i}`}>{child.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Who moved a status. Staff names aren't fetched here — resolving an id to a name
 *  needs the staff directory, which is more machinery than a history line is worth —
 *  so the raw id rides along in the title attribute for anyone who needs to look it
 *  up in the database, and the visible label is just the kind of actor. */
function ActorLabel({ by }) {
  if (by === 'system') return <span>System</span>
  return <span title={by}>Staff</span>
}

export default function OrderDetailPanel({ order, transitions, onChangeStatus, busy, actionError }) {
  const [failing, setFailing] = useState(false)

  // { allowed: [...next legal statuses], isTerminal } — see services/orderStatus.js.
  const allowed = transitions?.allowed ?? []
  const nonFailedTransitions = allowed.filter((status) => status !== 'failed')
  const canFail = allowed.includes('failed')
  const isTerminal = transitions?.isTerminal ?? TERMINAL_STATUSES.has(order.status)

  const handleFail = ({ reason, note }) => {
    onChangeStatus('failed', { reason, note })
    setFailing(false)
  }

  return (
    <div className="bg-white border border-border-light rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 font-display font-bold text-lg text-black">{order.orderNumber}</p>
          <p className="m-0 text-xs text-text-body">Placed {dateTime.format(new Date(order.placedAt))}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Contact">
          {order.contact.name}
          <br />
          <a href={`tel:${order.contact.phone}`} className="text-accent">
            {order.contact.phone}
          </a>
        </Field>
        <Field label="Fulfilment">
          {FULFILMENT_LABEL[order.fulfilment] ?? order.fulfilment}
          <br />
          <span className="text-text-body">{order.branch.name ?? order.branch.code}</span>
        </Field>

        {order.address && (
          <Field label="Delivery address">
            {order.address.line1}
            {order.address.area ? `, ${order.address.area}` : ''}
            {order.address.city ? `, ${order.address.city}` : ''}
            {order.address.notes && (
              <>
                <br />
                <span className="text-text-body italic">{order.address.notes}</span>
              </>
            )}
            {/* The typed address is often just a sector/phase in poorly-mapped areas —
                the pinned coordinate is the precise thing, so give the rider a map link
                straight to it rather than making them re-type it into their own maps app. */}
            {order.address.location?.lat != null && order.address.location?.lng != null && (
              <>
                <br />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${order.address.location.lat},${order.address.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  📍 Open exact pin in Google Maps
                </a>
              </>
            )}
          </Field>
        )}

        {order.distanceKm != null && (
          <Field label="Distance from branch">{order.distanceKm.toFixed(1)} km</Field>
        )}
      </div>

      <div>
        <p className="m-0 mb-2 text-[0.7rem] uppercase tracking-wide text-text-body/70">Items</p>
        <div className="rounded-xl border border-border-light px-3">
          {order.items.map((item, i) => (
            <ItemRow key={`${item.sku ?? item.name}-${i}`} item={item} />
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-1 text-xs text-text-body">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{order.totals.subtotal.formatted}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span>{order.totals.deliveryFee.formatted}</span>
          </div>
          {order.totals.discount.amount > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{order.totals.discount.formatted}</span>
            </div>
          )}
          <div className="flex justify-between font-display font-bold text-sm text-black pt-1 border-t border-border-light">
            <span>Total</span>
            <span className="text-accent">{order.totals.grandTotal.formatted}</span>
          </div>
        </div>
      </div>

      {order.failureReason && (
        <p className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          Failed — {order.failureReason}
        </p>
      )}

      <div>
        <p className="m-0 mb-2 text-[0.7rem] uppercase tracking-wide text-text-body/70">History</p>
        <ol className="m-0 p-0 list-none flex flex-col gap-2">
          {order.statusHistory.map((event, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
              <div>
                <span className="font-display font-medium text-black">
                  {ORDER_STATUS_LABEL[event.status] ?? event.status}
                </span>
                <span className="text-text-body">
                  {' '}
                  — {dateTime.format(new Date(event.at))} · <ActorLabel by={event.by} />
                </span>
                {event.note && <p className="m-0 mt-0.5 text-text-body italic">"{event.note}"</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {actionError && (
        <p role="alert" className="m-0 px-3 py-2 rounded-lg bg-[#fdecea] text-xs text-[#c0392b]">
          {actionError}
        </p>
      )}

      {!isTerminal && (
        <div>
          <p className="m-0 mb-2 text-[0.7rem] uppercase tracking-wide text-text-body/70">
            Move this order
          </p>
          <div className="flex flex-wrap gap-2">
            {nonFailedTransitions.map((status) => (
              <button
                key={status}
                type="button"
                disabled={busy}
                onClick={() => onChangeStatus(status)}
                className="h-9 px-4 rounded-lg border-none bg-accent text-white text-xs font-display font-bold cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {busy ? 'Updating…' : `Mark ${ORDER_STATUS_LABEL[status]}`}
              </button>
            ))}
            {canFail && !failing && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setFailing(true)}
                className="h-9 px-4 rounded-lg border border-[#e3a29b] bg-white text-[#c0392b] text-xs font-display font-bold cursor-pointer disabled:opacity-60"
              >
                Mark failed
              </button>
            )}
          </div>

          {failing && (
            <FailOrderForm onSubmit={handleFail} onCancel={() => setFailing(false)} busy={busy} />
          )}
        </div>
      )}
    </div>
  )
}
