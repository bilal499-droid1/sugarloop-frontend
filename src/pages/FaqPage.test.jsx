import { describe, expect, test, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

/**
 * The ask-a-question form.
 *
 * Worth testing because of what it used to do: set a local flag, tell the visitor "we'll
 * get back to you shortly", and send nothing anywhere. It looked correct in every
 * screenshot and in every click-through, which is exactly the failure a test catches and
 * a reviewer does not.
 *
 * So the assertions are about the request actually leaving, and about the promise on the
 * screen only appearing when it did.
 */
const submitEnquiry = vi.fn()

vi.mock('../lib/api', () => ({
  isApiConfigured: true,
  submitEnquiry: (...args) => submitEnquiry(...args),
}))

/**
 * The page's chrome, stubbed out. ShopNav reads the cart and catalogue contexts, so
 * rendering it here would mean standing up two providers to test a form that touches
 * neither — and a failure in the cart would then show up as a failure in this file.
 */
vi.mock('../components/products/ShopNav', () => ({ default: () => null }))
vi.mock('../components/Footer', () => ({ default: () => null }))

const { default: FaqPage } = await import('./FaqPage')

function renderPage() {
  return render(
    <MemoryRouter>
      <FaqPage />
    </MemoryRouter>
  )
}

async function fillIn(user) {
  await user.type(screen.getByPlaceholderText('Your name'), 'Bilal')
  await user.type(screen.getByPlaceholderText('Your email'), 'bilal@example.pk')
  await user.type(
    screen.getByPlaceholderText('Write your question'),
    'Do the crafted donuts contain nuts?'
  )
}

describe('FaqPage question form', () => {
  beforeEach(() => {
    submitEnquiry.mockReset()
  })

  test('posts the question as an enquiry of kind question', async () => {
    const user = userEvent.setup()
    submitEnquiry.mockResolvedValue({ enquiry: { reference: 'A1B2C3D4' } })

    renderPage()
    await fillIn(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(submitEnquiry).toHaveBeenCalledTimes(1))
    expect(submitEnquiry).toHaveBeenCalledWith({
      kind: 'question',
      name: 'Bilal',
      email: 'bilal@example.pk',
      message: 'Do the crafted donuts contain nuts?',
    })
  })

  test('shows the reference, which is what the visitor can quote later', async () => {
    const user = userEvent.setup()
    submitEnquiry.mockResolvedValue({ enquiry: { reference: 'A1B2C3D4' } })

    renderPage()
    await fillIn(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText(/A1B2C3D4/)).toBeInTheDocument()
  })

  test('promises nothing when the send failed', async () => {
    // The whole reason this form was rewritten. A confirmation shown regardless of what
    // happened is the bug, not a cosmetic detail.
    const user = userEvent.setup()
    submitEnquiry.mockRejectedValue({ code: 'INTERNAL', message: 'boom' })

    renderPage()
    await fillIn(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText(/Something went wrong sending that/)).toBeInTheDocument()
    expect(screen.queryByText(/We'll get back to you shortly/)).not.toBeInTheDocument()
  })

  test('puts a rejected field’s message under that field', async () => {
    const user = userEvent.setup()
    submitEnquiry.mockRejectedValue({
      code: 'VALIDATION_ERROR',
      details: [{ field: 'email', message: 'Must be a valid email address' }],
    })

    renderPage()
    await fillIn(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText('Must be a valid email address')).toBeInTheDocument()
  })

  test('clears the form after a successful send, so it cannot be sent twice by accident', async () => {
    const user = userEvent.setup()
    submitEnquiry.mockResolvedValue({ enquiry: { reference: 'A1B2C3D4' } })

    renderPage()
    await fillIn(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await screen.findByText(/A1B2C3D4/)
    expect(screen.getByPlaceholderText('Write your question')).toHaveValue('')
    expect(screen.getByPlaceholderText('Your name')).toHaveValue('')
  })
})
