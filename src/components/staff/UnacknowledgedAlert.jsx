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
 * five seconds of beep, and it means the alert cannot silently fail because an asset 404'd.
 */

/** How often the chime repeats while orders are waiting, measured start to start. */
const REPEAT_MS = 20_000

/** How long each round of beeping lasts. One short chime was too easy to miss in a kitchen. */
const CHIME_SECONDS = 5

/** One two-tone pair plus a short gap; repeated until CHIME_SECONDS is filled. */
const PAIR_SECONDS = 0.5
const TONE_SECONDS = 0.18

/**
 * Peak level per tone. Tones never overlap, so this cannot clip. It was 0.12 on a sine,
 * which a laptop speaker across a noisy counter barely carried.
 */
const PEAK_GAIN = 0.6

/**
 * Two short tones, a fifth apart, repeated for CHIME_SECONDS. Returns a function that
 * silences whatever is still scheduled, so Mute or a confirmed order cuts it off at once
 * rather than letting the rest of the five seconds play out.
 *
 * A square wave through a low-pass filter: the square carries far more energy than a sine
 * at the same peak, and the filter takes off the buzzy top end so it still reads as a
 * chime rather than a klaxon in a shop with customers in it.
 */
function playChime(context) {
  const now = context.currentTime
  const oscillators = []

  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 3000
  filter.connect(context.destination)

  for (let pair = 0; pair * PAIR_SECONDS < CHIME_SECONDS; pair++) {
    for (const [index, frequency] of [880, 1318.5].entries()) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'square'
      oscillator.frequency.value = frequency

      // Ramped rather than switched: an abrupt start and stop produces an audible click
      // at both ends.
      const start = now + pair * PAIR_SECONDS + index * TONE_SECONDS
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(PEAK_GAIN, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)

      oscillator.connect(gain).connect(filter)
      oscillator.start(start)
      oscillator.stop(start + TONE_SECONDS)
      oscillators.push(oscillator)
    }
  }

  return () => {
    for (const oscillator of oscillators) {
      try {
        oscillator.stop()
      } catch {
        // Already finished; nothing to silence.
      }
    }
  }
}

export default function UnacknowledgedAlert({ count }) {
  const [muted, setMuted] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const contextRef = useRef(null)

  useEffect(() => {
    if (count === 0 || muted) return undefined

    let silence = () => {}

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

        silence()
        silence = playChime(context)
        setBlocked(false)
      } catch {
        // No Web Audio at all. The banner is still on screen, which is the part that
        // matters; the sound was always the redundant half.
        setBlocked(true)
      }
    }

    beep()
    const timer = setInterval(beep, REPEAT_MS)
    return () => {
      clearInterval(timer)
      silence()
    }
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
