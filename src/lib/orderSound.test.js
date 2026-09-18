import { afterEach, describe, expect, test, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'

/**
 * jsdom has no Web Audio, so this stands in for it: starts suspended the way a real
 * context does before anyone has clicked, and records every tone it is asked to play.
 */
class FakeAudioContext extends EventTarget {
  static instances = []
  state = 'suspended'
  currentTime = 0
  destination = {}
  oscillators = []

  constructor() {
    super()
    FakeAudioContext.instances.push(this)
  }

  resume() {
    this.state = 'running'
    this.dispatchEvent(new Event('statechange'))
    return Promise.resolve()
  }

  createBiquadFilter() {
    return { type: '', frequency: { value: 0 }, connect: vi.fn() }
  }

  createGain() {
    const param = { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
    return { gain: param, connect: vi.fn((next) => next) }
  }

  createOscillator() {
    const oscillator = {
      type: '',
      frequency: { value: 0 },
      connect: vi.fn((next) => next),
      start: vi.fn(),
      stop: vi.fn(),
    }
    this.oscillators.push(oscillator)
    return oscillator
  }
}

// The context is a module-level singleton, so each test takes a fresh module.
async function load() {
  vi.resetModules()
  FakeAudioContext.instances = []
  vi.stubGlobal('AudioContext', FakeAudioContext)
  return {
    sound: await import('./orderSound.js'),
    OrderSoundBar: (await import('../components/staff/OrderSoundBar.jsx')).default,
    UnacknowledgedAlert: (await import('../components/staff/UnacknowledgedAlert.jsx')).default,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('playChime', () => {
  test('fills five seconds with ten two-tone pairs', async () => {
    const { sound } = await load()
    const context = sound.getAudioContext()

    sound.playChime(context)

    expect(context.oscillators).toHaveLength(20)
    const lastStart = context.oscillators.at(-1).start.mock.calls[0][0]
    expect(lastStart).toBeGreaterThan(4.5)
    expect(lastStart).toBeLessThan(5)
  })

  test('the returned function silences every scheduled tone', async () => {
    const { sound } = await load()
    const context = sound.getAudioContext()

    const silence = sound.playChime(context)
    silence()

    for (const oscillator of context.oscillators) expect(oscillator.stop).toHaveBeenCalledWith()
  })
})

describe('OrderSoundBar', () => {
  test('asks for the sound while it is off, then confirms with one short chime', async () => {
    const { OrderSoundBar } = await load()
    render(createElement(OrderSoundBar))

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /turn on order sound/i })))

    expect(screen.queryByRole('button', { name: /turn on order sound/i })).toBeNull()
    expect(screen.getByRole('status').textContent).toMatch(/order sound is on/i)
    expect(FakeAudioContext.instances[0].oscillators).toHaveLength(2)
  })

  test('a click anywhere on the page switches it on too', async () => {
    const { OrderSoundBar } = await load()
    render(createElement(OrderSoundBar))

    await act(async () => fireEvent.pointerDown(document.body))

    expect(screen.queryByRole('button', { name: /turn on order sound/i })).toBeNull()
  })

  test('stays out of the way while an order is already ringing', async () => {
    const { OrderSoundBar } = await load()
    render(createElement(OrderSoundBar, { alarmActive: true }))

    await act(async () => fireEvent.pointerDown(document.body))

    expect(FakeAudioContext.instances[0].oscillators).toHaveLength(0)
  })
})

describe('UnacknowledgedAlert', () => {
  test('starts ringing the moment the sound is switched on, not at the next round', async () => {
    const { UnacknowledgedAlert } = await load()
    render(createElement(UnacknowledgedAlert, { count: 1 }))

    expect(screen.getByRole('alert').textContent).toMatch(/sound is off/i)

    await act(async () => fireEvent.pointerDown(document.body))

    expect(FakeAudioContext.instances[0].oscillators).toHaveLength(20)
    expect(screen.getByRole('alert').textContent).not.toMatch(/sound is off/i)
  })

  test('Mute cuts the round off at once', async () => {
    const { UnacknowledgedAlert } = await load()
    render(createElement(UnacknowledgedAlert, { count: 1 }))
    await act(async () => fireEvent.pointerDown(document.body))

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /mute/i })))

    for (const oscillator of FakeAudioContext.instances[0].oscillators) {
      expect(oscillator.stop).toHaveBeenCalledWith()
    }
  })
})
