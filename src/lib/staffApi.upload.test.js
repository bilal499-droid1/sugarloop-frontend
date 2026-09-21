import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

/**
 * A product photo takes three requests, and two of them go to different places under
 * different rules. Getting the middle one wrong does not throw here — it fails in S3, on
 * a URL that looks perfectly fine — so the shape of each request is worth pinning.
 */

const PRODUCT_ID = '6aaa4b6b30ede3d318d48419'
const KEY = `products/${PRODUCT_ID}/ab12cd34-front.webp`
const SIGNED_URL = `https://bucket.s3.ap-south-1.amazonaws.com/${KEY}?X-Amz-Signature=abc`
const HEADERS = { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' }

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const photo = (overrides = {}) =>
  new File([new Uint8Array(2048)], 'front.webp', { type: 'image/webp', ...overrides })

let api
let fetchMock

beforeEach(async () => {
  // The client reads VITE_API_BASE_URL once, at import, so it has to be set before the
  // module is loaded — and loaded fresh, or a previous test's answer would stick.
  vi.stubEnv('VITE_API_BASE_URL', '/api/v1')
  vi.resetModules()
  api = await import('./staffApi')

  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('checkProductImage', () => {
  test('accepts the four formats the server accepts', () => {
    for (const type of ['image/webp', 'image/jpeg', 'image/png', 'image/avif']) {
      expect(api.checkProductImage(photo({ type }))).toBeNull()
    }
  })

  test('turns away SVG, which could carry script', () => {
    expect(api.checkProductImage(photo({ type: 'image/svg+xml' }))).toMatch(/not a WebP, JPEG/)
  })

  test('turns away an empty file and one over 5 MB', () => {
    expect(api.checkProductImage(new File([], 'empty.png', { type: 'image/png' }))).toMatch(/empty/)

    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.jpg', { type: 'image/jpeg' })
    expect(api.checkProductImage(big)).toMatch(/over 5 MB/)
  })
})

describe('uploadProductImage', () => {
  test('asks for a URL, sends the file to S3 alone, then records the key', async () => {
    const product = { id: PRODUCT_ID, images: [{ url: 'https://cdn/x.webp', publicId: KEY }] }

    fetchMock
      .mockResolvedValueOnce(json(201, { data: { upload: { uploadUrl: SIGNED_URL, key: KEY, headers: HEADERS } } }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(json(201, { data: { product } }))

    const file = photo()
    await expect(api.uploadProductImage(PRODUCT_ID, file)).resolves.toEqual(product)

    expect(fetchMock).toHaveBeenCalledTimes(3)

    // 1. The API is told what is coming.
    const [askUrl, ask] = fetchMock.mock.calls[0]
    expect(askUrl).toBe(`/api/v1/staff/products/${PRODUCT_ID}/images/upload-url`)
    expect(ask.method).toBe('POST')
    expect(JSON.parse(ask.body)).toEqual({ filename: 'front.webp', contentType: 'image/webp', size: 2048 })

    // 2. The file goes to S3, with exactly the headers the server signed and nothing else.
    const [putUrl, put] = fetchMock.mock.calls[1]
    expect(putUrl).toBe(SIGNED_URL)
    expect(put.method).toBe('PUT')
    expect(put.body).toBe(file)
    expect(put.headers).toEqual(HEADERS)

    // 3. The API is told which object was written.
    const [attachUrl, attach] = fetchMock.mock.calls[2]
    expect(attachUrl).toBe(`/api/v1/staff/products/${PRODUCT_ID}/images`)
    expect(attach.method).toBe('POST')
    expect(JSON.parse(attach.body)).toEqual({ key: KEY })
  })

  test('never sends the staff token to S3', async () => {
    fetchMock.mockImplementation(async (url) => {
      if (String(url).endsWith('/upload-url')) {
        return json(201, { data: { upload: { uploadUrl: SIGNED_URL, key: KEY, headers: HEADERS } } })
      }
      if (url === SIGNED_URL) return new Response(null, { status: 200 })
      return json(201, { data: { product: { id: PRODUCT_ID, images: [] } } })
    })

    await api.uploadProductImage(PRODUCT_ID, photo())

    const putHeaders = fetchMock.mock.calls.find(([url]) => url === SIGNED_URL)[1].headers
    expect(Object.keys(putHeaders).map((name) => name.toLowerCase())).not.toContain('authorization')
  })

  test('refuses a bad file before making any request', async () => {
    await expect(api.uploadProductImage(PRODUCT_ID, photo({ type: 'image/gif' }))).rejects.toMatchObject({
      code: 'INVALID_IMAGE',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('does not record an upload that S3 refused', async () => {
    fetchMock
      .mockResolvedValueOnce(json(201, { data: { upload: { uploadUrl: SIGNED_URL, key: KEY, headers: HEADERS } } }))
      .mockResolvedValueOnce(new Response(null, { status: 403 }))

    await expect(api.uploadProductImage(PRODUCT_ID, photo())).rejects.toMatchObject({
      code: 'UPLOAD_FAILED',
      status: 403,
    })
    // Only the URL request and the PUT — the attach call never happens.
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  test('names the bucket CORS rule when the browser gets no answer at all', async () => {
    fetchMock
      .mockResolvedValueOnce(json(201, { data: { upload: { uploadUrl: SIGNED_URL, key: KEY, headers: HEADERS } } }))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(api.uploadProductImage(PRODUCT_ID, photo())).rejects.toThrow(/CORS/)
  })

  test('passes the server its own reason when uploads are switched off', async () => {
    fetchMock.mockResolvedValueOnce(
      json(503, {
        error: {
          code: 'IMAGE_STORAGE_UNCONFIGURED',
          message: 'Image uploads are not available — S3_BUCKET is not configured on this server',
        },
      })
    )

    await expect(api.uploadProductImage(PRODUCT_ID, photo())).rejects.toMatchObject({
      code: 'IMAGE_STORAGE_UNCONFIGURED',
    })
  })
})

describe('removeStaffProductImage', () => {
  test('sends the key in the body, because it contains slashes', async () => {
    const product = { id: PRODUCT_ID, images: [] }
    fetchMock.mockResolvedValueOnce(json(200, { data: { product } }))

    await expect(api.removeStaffProductImage(PRODUCT_ID, KEY)).resolves.toEqual(product)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`/api/v1/staff/products/${PRODUCT_ID}/images`)
    expect(init.method).toBe('DELETE')
    expect(JSON.parse(init.body)).toEqual({ key: KEY })
  })
})
