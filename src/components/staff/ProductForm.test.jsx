import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ProductForm from './ProductForm'
import * as staffApi from '../../lib/staffApi'

vi.mock('../../lib/staffApi', async (importOriginal) => ({
  ...(await importOriginal()),
  createStaffProduct: vi.fn(),
  updateStaffProduct: vi.fn(),
  uploadProductImage: vi.fn(),
  removeStaffProductImage: vi.fn(),
}))

const created = { id: 'p1', sku: 'DON-TEST', slug: 'test', name: 'Test donut', images: [] }
const withPhoto = {
  ...created,
  images: [{ url: 'https://cdn/a.webp', alt: '', order: 0, publicId: 'products/p1/a.webp' }],
}

const photo = (name = 'front.webp') => new File([new Uint8Array(1024)], name, { type: 'image/webp' })

async function fillNewProduct(user) {
  await user.type(screen.getByLabelText('Name'), 'Test donut')
  await user.type(screen.getByLabelText(/^Price/), '299')
  await user.type(screen.getByLabelText(/^SKU/), 'DON-TEST')
}

beforeEach(() => {
  vi.resetAllMocks()
  // jsdom has no blob URLs, and the pending thumbnail asks for one.
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

describe('ProductForm photos', () => {
  test('on a new product, uploads only after the product exists, then closes', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    staffApi.createStaffProduct.mockResolvedValue(created)
    staffApi.uploadProductImage.mockResolvedValue(withPhoto)

    render(<ProductForm product={null} onSaved={onSaved} onCancel={() => {}} />)
    await fillNewProduct(user)

    const file = photo()
    await user.upload(screen.getByLabelText('Add photos'), file)

    // Chosen, not sent: there is no product id to upload against yet.
    expect(staffApi.uploadProductImage).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Create product' }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(withPhoto, { created: true }))
    expect(staffApi.uploadProductImage).toHaveBeenCalledWith('p1', file)
    expect(staffApi.createStaffProduct.mock.invocationCallOrder[0]).toBeLessThan(
      staffApi.uploadProductImage.mock.invocationCallOrder[0]
    )
  })

  test('if a queued photo fails, the product still exists and the form stays open on it', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    const onPhotosChanged = vi.fn()
    staffApi.createStaffProduct.mockResolvedValue(created)
    staffApi.uploadProductImage.mockRejectedValue(new Error('Storage refused the photo (403).'))

    render(
      <ProductForm
        product={null}
        onSaved={onSaved}
        onPhotosChanged={onPhotosChanged}
        onCancel={() => {}}
      />
    )
    await fillNewProduct(user)
    await user.upload(screen.getByLabelText('Add photos'), photo())
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    expect(await screen.findByText(/product was created, but a photo did not upload/i)).toBeInTheDocument()
    expect(screen.getByText(/Storage refused the photo \(403\)/)).toBeInTheDocument()

    // It did not close, the list was told about the new product, and the form is now
    // editing it — so a second Save is an update, not a duplicate create.
    expect(onSaved).not.toHaveBeenCalled()
    expect(onPhotosChanged).toHaveBeenCalledWith(created)
    expect(screen.getByRole('heading', { name: 'Edit Test donut' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  test('on an existing product, a picked photo uploads at once and appears', async () => {
    const user = userEvent.setup()
    const onPhotosChanged = vi.fn()
    staffApi.uploadProductImage.mockResolvedValue(withPhoto)

    render(
      <ProductForm
        product={{ ...created, price: 29900 }}
        onSaved={() => {}}
        onPhotosChanged={onPhotosChanged}
        onCancel={() => {}}
      />
    )

    const file = photo()
    await user.upload(screen.getByLabelText('Add photos'), file)

    await waitFor(() => expect(staffApi.uploadProductImage).toHaveBeenCalledWith('p1', file))
    expect(onPhotosChanged).toHaveBeenCalledWith(withPhoto)
    expect(await screen.findByRole('button', { name: 'Remove this photo' })).toBeInTheDocument()
  })

  test('removing a photo asks first, then deletes it', async () => {
    const user = userEvent.setup()
    staffApi.removeStaffProductImage.mockResolvedValue(created)

    render(
      <ProductForm
        product={{ ...withPhoto, price: 29900 }}
        onSaved={() => {}}
        onCancel={() => {}}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Remove this photo' }))
    expect(staffApi.removeStaffProductImage).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Confirm: delete this photo' }))
    await waitFor(() =>
      expect(staffApi.removeStaffProductImage).toHaveBeenCalledWith('p1', 'products/p1/a.webp')
    )
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /this photo/ })).not.toBeInTheDocument()
    )
  })

  test('a file that is not a photo is refused at the picker without an upload', async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<ProductForm product={null} onSaved={() => {}} onCancel={() => {}} />)

    await user.upload(
      screen.getByLabelText('Add photos'),
      new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(/logo\.svg is not a WebP, JPEG/)
    expect(staffApi.uploadProductImage).not.toHaveBeenCalled()
  })
})
