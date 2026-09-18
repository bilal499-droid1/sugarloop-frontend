import { useEffect, useState } from 'react'

/**
 * The staff board's order sound, shared by the "turn on order sound" bar and the
 * unacknowledged-order alarm so both talk about the same AudioContext.
 *
 * Browsers start every page's audio switched off and only allow it once the person has
 * clicked, tapped or pressed a key on that page. Nothing a site does can skip that, so the
 * aim here is to get the click early — at the start of a shift, from the bar — rather
 * than discover the sound is off when an order is already waiting.
 *
 * The tone is synthesised rather than loaded from a file. It avoids shipping a binary for
 * five seconds of beep, and it means the alert cannot silently fail because an asset 404'd.
 */

/** How long each round of the alarm lasts. One short chime was too easy to miss in a kitchen. */
export const CHIME_SECONDS = 5

/** One two-tone pair plus a short gap; repeated until the round is filled. */
const PAIR_SECONDS = 0.5
const TONE_SECONDS = 0.18

/**
 * Peak level per tone. Tones never overlap, so this cannot clip. It was 0.12 on a sine,
 * which a laptop speaker across a noisy counter barely carried.
 */
const PEAK_GAIN = 0.6

let context = null
const listeners = new Set()

const AudioContextClass = () =>
  typeof window === 'undefined' ? undefined : window.AudioContext || window.webkitAudioContext

/** False only in a browser with no Web Audio at all, where no click will help. */
export const isSoundSupported = () => Boolean(AudioContextClass())

export const isSoundReady = () => context?.state === 'running'

function notify() {
  const ready = isSoundReady()
  for (const listener of listeners) listener(ready)
}

/**
 * Created lazily and reused. Browsers cap how many AudioContexts a page may open, so one
 * per chime would eventually stop producing sound entirely.
 */
export function getAudioContext() {
  const Context = AudioContextClass()
  if (!Context) return null
  if (!context) {
    context = new Context()
    context.addEventListener?.('statechange', notify)
  }
  return context
}

/**
 * Switches the page's audio on. Only succeeds inside, or after, a click or key press on
 * the page; before that the browser leaves it suspended. Resolves to whether it worked.
 */
export function unlockSound() {
  const audio = getAudioContext()
  if (!audio) return Promise.resolve(false)
  if (audio.state === 'running') return Promise.resolve(true)
  return audio.resume().then(
    () => {
      notify()
      return isSoundReady()
    },
    () => false
  )
}

/**
 * Two short tones, a fifth apart, repeated for `seconds`. Returns a function that
 * silences whatever is still scheduled, so Mute or a confirmed order cuts it off at once
 * rather than letting the rest of the round play out.
 *
 * A square wave through a low-pass filter: the square carries far more energy than a sine
 * at the same peak, and the filter takes off the buzzy top end so it still reads as a
 * chime rather than a klaxon in a shop with customers in it.
 */
export function playChime(audio, { seconds = CHIME_SECONDS } = {}) {
  const now = audio.currentTime
  const oscillators = []

  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 3000
  filter.connect(audio.destination)

  for (let pair = 0; pair * PAIR_SECONDS < seconds; pair++) {
    for (const [index, frequency] of [880, 1318.5].entries()) {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()

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

/**
 * Whether the order sound can play right now, kept current.
 *
 * Any click or key press on the page switches it on, not only the bar's button, so a
 * manager who clicks straight into an order has done enough. And a page reached by
 * clicking through from the login screen has usually been clicked already — the browser
 * remembers that — so the bar never shows at all.
 */
export function useSoundReady() {
  const [ready, setReady] = useState(isSoundReady)

  useEffect(() => {
    listeners.add(setReady)
    setReady(isSoundReady())

    if (!isSoundSupported() || isSoundReady()) return () => listeners.delete(setReady)

    if (navigator.userActivation?.hasBeenActive) unlockSound()

    const onGesture = () => {
      unlockSound().then((ok) => {
        if (ok) removeGestureListeners()
      })
    }
    const removeGestureListeners = () => {
      document.removeEventListener('pointerdown', onGesture, true)
      document.removeEventListener('keydown', onGesture, true)
    }
    document.addEventListener('pointerdown', onGesture, true)
    document.addEventListener('keydown', onGesture, true)

    return () => {
      listeners.delete(setReady)
      removeGestureListeners()
    }
  }, [])

  return ready
}
