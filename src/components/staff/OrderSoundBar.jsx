import { useEffect, useRef, useState } from 'react'
import { FaVolumeUp } from 'react-icons/fa'
import { getAudioContext, isSoundSupported, playChime, unlockSound, useSoundReady } from '../../lib/orderSound'

/** How long "Order sound is on" stays up after switching on. */
const CONFIRM_MS = 4_000

/**
 * Shown on the Orders page while the browser still has the page's sound switched off,
 * which it does after every reload until somebody clicks. Without this, staff found out
 * the alarm was silent only once an order was already waiting.
 *
 * A click anywhere on the page switches the sound on, and that click can land before the
 * button's own does, so the bar reacts to the sound coming on rather than to its button.
 * It then plays one short chime, so whoever clicked hears that the speaker and volume are
 * actually up — unless an order is already waiting, when the alarm itself is that proof.
 */
export default function OrderSoundBar({ alarmActive = false }) {
  const ready = useSoundReady()
  const wasOff = useRef(!ready)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!ready || !wasOff.current) return undefined
    wasOff.current = false

    if (!alarmActive) playChime(getAudioContext(), { seconds: 0.5 })
    setConfirming(true)
    const timer = setTimeout(() => setConfirming(false), CONFIRM_MS)
    return () => clearTimeout(timer)
    // alarmActive is read at the moment the sound comes on, not tracked afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  if (!isSoundSupported()) return null

  if (ready) {
    if (!confirming) return null
    return (
      <div
        role="status"
        className="mb-4 flex items-center gap-3 rounded-xl border border-border-light bg-white px-4 py-3"
      >
        <FaVolumeUp className="shrink-0 text-accent" aria-hidden="true" />
        <p className="m-0 font-display text-sm text-black">
          <strong className="font-bold">Order sound is on.</strong> New orders will beep until someone
          confirms them.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border-light bg-white px-4 py-3">
      <FaVolumeUp className="shrink-0 text-accent" aria-hidden="true" />

      <p className="m-0 flex-1 min-w-0 font-display text-sm text-text-body">
        <strong className="font-bold text-black">The new-order sound is off.</strong> The browser keeps
        it off until this page is clicked. Turn it on now so the next order is heard.
      </p>

      <button
        type="button"
        onClick={() => unlockSound()}
        className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border-0 bg-accent font-display text-xs font-semibold text-white cursor-pointer hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <FaVolumeUp aria-hidden="true" />
        Turn on order sound
      </button>
    </div>
  )
}
