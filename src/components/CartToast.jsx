import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Long enough to read a product name, short enough that a second tap feels like it
// refreshed the same toast rather than queueing another one behind it.
const VISIBLE_MS = 2600

// Must match the duration of --animate-cart-toast-out in tokens.css. The card is
// unmounted on this timer rather than on an animationend event, which never fires
// under prefers-reduced-motion (the animation is switched off) and would strand the
// toast on screen for good.
const EXIT_MS = 200

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" aria-hidden="true">
      <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Confirmation that a cart change actually landed. Mounted once by CartProvider, so
 * every call site — the menu tiles, the product page, Build Your Box, the cart's own
 * steppers — is covered without each one growing its own copy.
 *
 * `toast.key` counts up on every change. The timer effect depends on it, so tapping
 * again restarts the countdown instead of letting the new toast inherit the old one's
 * remaining time, and the key on the card below remounts it so the entry animation
 * replays for the second tap.
 */
export default function CartToast({ toast, onDismiss }) {
  // Two phases, because the card cannot animate out of a tree it has already left:
  // it is marked leaving first, then actually dropped once the exit has played.
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!toast) return undefined

    // A toast arriving mid-exit cancels it — same element, so clearing the flag swaps
    // the class back and the entry animation replays off the remount below.
    setLeaving(false)

    const startExit = window.setTimeout(() => setLeaving(true), VISIBLE_MS)
    const drop = window.setTimeout(onDismiss, VISIBLE_MS + EXIT_MS)
    return () => {
      window.clearTimeout(startExit)
      window.clearTimeout(drop)
    }
  }, [toast, onDismiss])

  if (!toast) return null

  const removed = toast.tone === 'removed'

  return (
    // The wrapper is inert so a toast sitting over the bottom-right + button of a
    // tile cannot swallow the next tap; only the card itself takes pointer events.
    <div
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div
        key={toast.key}
        className={`pointer-events-auto flex items-center gap-3 w-full max-w-[22rem] rounded-full bg-white ring-1 ring-black/5 shadow-[0_8px_28px_rgba(0,0,0,0.18)] p-2 pr-4 ${
          leaving ? 'animate-cart-toast-out' : 'animate-cart-toast-in'
        }`}
      >
        {/* Desaturating the thumbnail on a removal is the same shorthand the sold-out
            tiles use: the photo says which product without the toast having to claim
            the item is still in the cart.
            alt="" — the name is spelled out in the text beside it, so a described
            thumbnail would just make the announcement say it twice. */}
        {toast.image ? (
          <img
            src={toast.image}
            alt=""
            className={`w-10 h-10 shrink-0 rounded-full object-cover ${
              removed ? 'grayscale opacity-70' : ''
            }`}
          />
        ) : (
          <span
            className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
              removed ? 'bg-text-body/15 text-text-body' : 'bg-accent text-white'
            }`}
          >
            {removed ? <MinusIcon /> : <CheckIcon />}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block font-display font-bold text-[0.8rem] text-black truncate">
            {toast.name}
          </span>
          <span className="block font-display text-[0.7rem] text-text-body">{toast.note}</span>
        </span>

        {toast.cartLink !== false && (
          <Link
            to="/cart"
            onClick={onDismiss}
            className="shrink-0 no-underline font-display font-bold text-[0.75rem] text-accent"
          >
            View cart
          </Link>
        )}
      </div>
    </div>
  )
}
