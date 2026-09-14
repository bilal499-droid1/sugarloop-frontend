import { describe, expect, test, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * The nav's shop dropdown.
 *
 * It replaced a native <select>, and a select gets its keyboard and dismissal behaviour
 * from the browser for free. A hand-built one has to earn each of those, and every one
 * of them fails silently — a list that will not close still looks fine in a screenshot.
 */
const setBranchId = vi.fn()
let branchState

vi.mock('../../context/BranchContext', () => ({
  useBranch: () => branchState,
}))

import BranchPicker from './BranchPicker'

const BRANCHES = [
  { id: 'b1', name: 'Sugar Loop DHA 1', isOpenNow: true, isAcceptingOrders: true, minutesUntilLastOrder: 200 },
  { id: 'b2', name: 'Sugar Loop DHA 2', isOpenNow: false, isAcceptingOrders: false, minutesUntilLastOrder: null },
  { id: 'b3', name: 'Sugar Loop Bahria Phase 4' },
  // Trading hours, but the manager has paused orders.
  { id: 'b4', name: 'Sugar Loop NUST H-12', isOpenNow: true, isAcceptingOrders: false, minutesUntilLastOrder: null },
]

beforeEach(() => {
  setBranchId.mockReset()
  branchState = { branches: BRANCHES, branchId: null, setBranchId, hasBranches: true }
})

describe('BranchPicker compact dropdown', () => {
  test('invites a choice before one is made, and is closed to begin with', () => {
    render(<BranchPicker />)

    expect(screen.getByRole('button', { name: /choose a shop/i })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  test('lists shops by their short name, with order status only where it is known', async () => {
    render(<BranchPicker />)
    await userEvent.click(screen.getByRole('button', { name: /choose a shop/i }))

    const options = screen.getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      'DHA 1Open now',
      'DHA 2Closed now',
      // No verdict from the API: no status rather than a guessed "open".
      'Bahria Phase 4',
      // Inside trading hours but paused — must not read "Open now".
      'NUST H-12Not taking orders right now',
    ])
  })

  test('the menu-page pills mark a paused shop as well as a closed one', () => {
    render(<BranchPicker variant="pills" />)

    expect(screen.getByRole('button', { name: /dha 1/i })).toHaveTextContent(/^DHA 1$/)
    expect(screen.getByRole('button', { name: /dha 2/i })).toHaveTextContent('· closed')
    expect(screen.getByRole('button', { name: /nust/i })).toHaveTextContent('· not taking orders')
  })

  test('picking a shop selects it, closes the list and hands focus back', async () => {
    render(<BranchPicker />)
    const trigger = screen.getByRole('button', { name: /choose a shop/i })

    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('option', { name: /dha 2/i }))

    expect(setBranchId).toHaveBeenCalledWith('b2')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  test('shows and marks the current shop', async () => {
    branchState = { ...branchState, branchId: 'b1' }
    render(<BranchPicker />)

    await userEvent.click(screen.getByRole('button', { name: /dha 1/i }))

    expect(screen.getByRole('option', { name: /dha 1/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /dha 1/i })).toHaveFocus()
  })

  test('Escape closes it and returns focus to the trigger', async () => {
    render(<BranchPicker />)
    const trigger = screen.getByRole('button', { name: /choose a shop/i })

    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(setBranchId).not.toHaveBeenCalled()
  })

  test('a click anywhere else closes it without choosing', async () => {
    render(
      <>
        <BranchPicker />
        <p>elsewhere</p>
      </>
    )

    await userEvent.click(screen.getByRole('button', { name: /choose a shop/i }))
    await userEvent.click(screen.getByText('elsewhere'))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(setBranchId).not.toHaveBeenCalled()
  })

  test('arrow keys walk the options and wrap at the ends', async () => {
    render(<BranchPicker />)

    screen.getByRole('button', { name: /choose a shop/i }).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: /dha 1/i })).toHaveFocus()

    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('option', { name: /nust/i })).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('option', { name: /dha 2/i })).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(setBranchId).toHaveBeenCalledWith('b2')
  })

  test('renders nothing until branches have loaded', () => {
    branchState = { ...branchState, hasBranches: false }
    const { container } = render(<BranchPicker />)

    expect(container).toBeEmptyDOMElement()
  })
})
