import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// The Pixel id is read once at import, so each test imports a fresh module after
// setting it.
async function loadPixel(id) {
  vi.resetModules()
  vi.stubEnv('VITE_META_PIXEL_ID', id)
  return import('./metaPixel.js')
}

const order = {
  orderNumber: 'SL-260917-0007',
  metaEventId: 'purchase_SL-260917-0007',
  items: [
    { kind: 'product', sku: 'DON-KITKAT-CRUNCH', name: 'KitKat Crunch', qty: 2, unitPrice: { amount: 42_900 } },
    { kind: 'box', name: 'Box of 6', qty: 1, unitPrice: { amount: 150_000 } },
  ],
  totals: { grandTotal: { amount: 245_800 } },
}

beforeEach(() => {
  delete window.fbq
  delete window._fbq
  document.head.querySelectorAll('script').forEach((s) => s.remove())
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('without a pixel id', () => {
  test('nothing is loaded and nothing is sent', async () => {
    const pixel = await loadPixel('')
    pixel.trackPurchase(order)
    pixel.track('PageView')

    expect(window.fbq).toBeUndefined()
    expect(document.querySelector('script[src*="fbevents"]')).toBeNull()
  })
})

describe('with a pixel id', () => {
  test('loads Meta once and initialises the pixel', async () => {
    const pixel = await loadPixel('1234567890123456')
    pixel.track('PageView')
    pixel.track('PageView')

    expect(document.querySelectorAll('script[src*="fbevents"]')).toHaveLength(1)
    expect(window.fbq.queue[0]).toEqual(['init', '1234567890123456'])
    expect(window.fbq.queue.filter(([, name]) => name === 'PageView')).toHaveLength(2)
  })

  test('purchase carries the server event id and reports rupees', async () => {
    const pixel = await loadPixel('1234567890123456')
    pixel.trackPurchase(order)

    const [, name, data, options] = window.fbq.queue.at(-1)
    expect(name).toBe('Purchase')
    expect(options).toEqual({ eventID: 'purchase_SL-260917-0007' })
    expect(data.value).toBe(2458)
    expect(data.currency).toBe('PKR')
    // Same ids the server sends: sku for a product, name for a box.
    expect(data.content_ids).toEqual(['DON-KITKAT-CRUNCH', 'Box of 6'])
    expect(data.contents[0]).toEqual({ id: 'DON-KITKAT-CRUNCH', quantity: 2, item_price: 429 })
  })

  test('a broken fbq never throws into the page', async () => {
    const pixel = await loadPixel('1234567890123456')
    window.fbq = () => {
      throw new Error('blocked')
    }
    expect(() => pixel.track('AddToCart')).not.toThrow()
  })

  test('the staff console is not tracked', async () => {
    const pixel = await loadPixel('1234567890123456')
    expect(pixel.isTrackedPath('/staff/orders')).toBe(false)
    expect(pixel.isTrackedPath('/products/12')).toBe(true)
  })
})
