import { useEffect, useRef, useState } from 'react'
import { FaBell, FaBellSlash } from 'react-icons/fa'

/**
 * The audible half of the unacknowledged-order escalation.
 *
 * The server chases the branch at five minutes and the admin at ten, but both of those
 * are messages to a phone — and a phone in a kitchen during a rush is the thing least
 * likely to be looked at. The board is what somebody is actually in front of, so it is
 * where the alarm belongs.
 *
 * **It repeats rather than firing once.** A single chime at the moment an order lands is
 * missed by anyone who stepped away, and then never sounds again for that order. This
 * keeps going while anything sits unacknowledged, which is the whole point: it stops when
 * somebody does something, not when a timer runs out.
 *
 * The tone is synthesised rather than loaded from a file. It avoids shipping a binary for
 * two seconds of beep, and it means the alert cannot silently fail because an asset 404'd.
 */

/** How often the chime repeats while orders are waiting. */
const REPEAT_MS = 20_000

/**
 * Two short tones, a fifth apart. Deliberately not a klaxon: this fires in a shop with
 * customers in it, and an alarm people find unpleasant is an alarm they turn off.
 */
function playChime(context) {
  const now = context.currentTime

  for (const [index, frequency] of [880, 1318.5].entries()) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    // Ramped rather than switched: an abrupt start and stop on a sine wave produces an
    // audible click at both ends.
    const start = now + index * 0.18
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.12, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)

    oscillator.connect(gain).connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + 0.18)
  }
}

export default function UnacknowledgedAlert({ count }) {
  const [muted, setMuted] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const contextRef = useRef(null)

  useEffect(() => {
    if (count === 0 || muted) return undefined

    const beep = () => {
      try {
        // Created lazily and reused. Browsers cap how many AudioContexts a page may
        // open, so one per chime would eventually stop producing sound entirely.
        contextRef.current ??= new (window.AudioContext || window.webkitAudioContext)()
        const context = contextRef.current

        /**
         * Autoplay policy: a context created before the operator has interacted with the
         * page starts suspended, and `resume()` only succeeds once they have. Rather than
         * failing silently, the banner says so — a manager who thinks the sound is on
         * when it is not is worse off than one who knows it is off.
         */
        if (context.state === 'suspended') {
          context.resume().then(
            () => setBlocked(false),
            () => setBlocked(true)
          )
          if (context.state === 'suspended') {
            setBlocked(true)
            return
          }
        }

        playChime(context)
        setBlocked(false)
      } catch {
        // No Web Audio at all. The banner is still on screen, which is the part that
        // matters; the sound was always the redundant half.
        setBlocked(true)
      }
    }

    beep()
    const timer = setInterval(beep, REPEAT_MS)
    return () => clearInterval(timer)
  }, [count, muted])

  if (count === 0) return null

  return (
    <div
      role="alert"
      className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#e8d9a8] bg-[#fff8e5] px-4 py-3"
    >
      <FaBell className="shrink-0 text-[#8a6d1f]" aria-hidden="true" />

      <p className="m-0 flex-1 min-w-0 font-display text-sm text-[#8a6d1f]">
        <strong className="font-bold">
          {count} {count === 1 ? 'order is' : 'orders are'} waiting
        </strong>{' '}
        — nobody has confirmed {count === 1 ? 'it' : 'them'} yet.
        {blocked && ' (Click anywhere to enable the sound.)'}
      </p>

      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#e8d9a8] bg-white font-display text-xs text-[#8a6d1f] cursor-pointer hover:border-[#8a6d1f]"
      >
        {muted ? <FaBell aria-hidden="true" /> : <FaBellSlash aria-hidden="true" />}
        {muted ? 'Unmute' : 'Mute'}
      </button>
    </div>
  )
}
