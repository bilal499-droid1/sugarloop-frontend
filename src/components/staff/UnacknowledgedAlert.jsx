import { useEffect, useState } from 'react'
import { FaBell, FaBellSlash } from 'react-icons/fa'
import { getAudioContext, playChime, useSoundReady } from '../../lib/orderSound'

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
 * Switching the sound on is OrderSoundBar's job; this only rings once it is on, and starts
 * the moment it comes on rather than waiting for the next round.
 */

/** How often the chime repeats while orders are waiting, measured start to start. */
const REPEAT_MS = 20_000

export default function UnacknowledgedAlert({ count }) {
  const [muted, setMuted] = useState(false)
  const soundReady = useSoundReady()

  useEffect(() => {
    if (count === 0 || muted || !soundReady) return undefined

    const context = getAudioContext()
    let silence = playChime(context)
    const timer = setInterval(() => {
      silence()
      silence = playChime(context)
    }, REPEAT_MS)

    return () => {
      clearInterval(timer)
      silence()
    }
  }, [count, muted, soundReady])

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
        {!soundReady && !muted && ' (Sound is off — click anywhere on the page to turn it on.)'}
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
