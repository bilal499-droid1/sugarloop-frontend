import { useEffect, useId, useRef, useState } from 'react'
import { FaCheck, FaChevronDown, FaStore } from 'react-icons/fa'
import { useBranch } from '../../context/BranchContext'
import { branchOrderStatus, shortBranchName } from '../../lib/branches'

/** Status dot colours. Amber is "trading, but you cannot order right now". */
const TONE_DOT = {
  open: 'bg-[#3aa76d]',
  warn: 'bg-[#e0a526]',
  closed: 'bg-[#c4c4c4]',
}

/**
 * Lets the visitor check availability at a specific shop, which is what turns on
 * sold-out marking across the menu.
 *
 * ⚠️ Labelled around STOCK, never "Branch", and deliberately so. This choice decides
 * which branch's stock is shown — it does not decide which branch fulfils an order. For
 * pickup the server does honour a chosen branch, but for delivery it resolves the branch
 * from the delivery ADDRESS and ignores this entirely
 * (`checkout.service.js: resolveBranch`). Calling it "Branch" would promise a delivery
 * guarantee the checkout will not keep.
 *
 * Two variants, because it appears in two places that want very different things:
 *
 *   `pills`    the menu page, where this is a real piece of the page and gets the
 *              site's pill language — the same shape as the category tabs directly
 *              above it, so it reads as part of the design rather than a form control
 *              someone forgot to style.
 *   `compact`  the nav, where there is room for one control and it has to stay out of
 *              the way. A custom dropdown rather than a native <select>: a select's
 *              option list is drawn by the operating system, so on Windows it opened as
 *              a grey system menu that matched nothing else on the site.
 *
 * Renders nothing until the branch list has loaded — an empty picker on a preview build
 * with no API would be a control that visibly does nothing.
 */

export default function BranchPicker({ className = '', variant = 'compact' }) {
  const { branches, branchId, setBranchId, hasBranches } = useBranch()

  if (!hasBranches) return null

  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`} role="group" aria-label="Check stock at a shop">
        {branches.map((branch) => (
          <PillOption
            key={branch.id}
            isActive={branch.id === branchId}
            onClick={() => setBranchId(branch.id)}
            label={shortBranchName(branch.name)}
            // Genuinely useful rather than decorative: a visitor deciding where to
            // collect from wants to know which shops will actually take an order now.
            note={branchOrderStatus(branch)?.short}
          />
        ))}
      </div>
    )
  }

  return (
    <ShopDropdown className={className} branches={branches} branchId={branchId} onSelect={setBranchId} />
  )
}

/**
 * The nav's shop chooser.
 *
 * Built to behave like the select it replaces, because people already know how a select
 * works: it opens on click, closes on Escape or a click anywhere else, the arrow keys
 * walk the options, and focus returns to the trigger once a shop is picked — so a
 * keyboard user is never stranded inside a list that has just disappeared.
 */
function ShopDropdown({ className, branches, branchId, onSelect }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const listId = useId()

  const selected = branches.find((branch) => branch.id === branchId)

  // Outside click and Escape only need listening for while the list is open.
  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // On open, land on the current shop — or the first one if none is chosen yet — so the
  // arrow keys start from where the visitor already is.
  useEffect(() => {
    if (!open) return
    const index = Math.max(0, branches.findIndex((branch) => branch.id === branchId))
    optionRefs.current[index]?.focus()
  }, [open, branches, branchId])

  const moveFocus = (event, index) => {
    const last = branches.length - 1
    const next = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key]

    if (next === undefined) return
    event.preventDefault()
    optionRefs.current[next]?.focus()
  }

  const choose = (id) => {
    onSelect(id)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault()
            setOpen(true)
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={`group flex items-center gap-2.5 h-11 pl-1.5 pr-4 rounded-cta-pill border bg-white font-display cursor-pointer transition-all duration-200 hover:border-accent hover:shadow-[0_4px_14px_rgba(88,126,162,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
          open ? 'border-accent shadow-[0_4px_14px_rgba(88,126,162,0.15)]' : 'border-border-light'
        }`}
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent text-[0.85rem]">
          <FaStore aria-hidden="true" />
        </span>

        <span className="flex flex-col items-start leading-none text-left">
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-text-body/60">Stock at</span>
          <span
            className={`mt-1 max-w-[9rem] truncate text-[0.875rem] font-bold ${selected ? 'text-black' : 'text-accent'}`}
          >
            {selected ? shortBranchName(selected.name) : 'Choose a shop'}
          </span>
        </span>

        <FaChevronDown
          aria-hidden="true"
          className={`ml-1 text-[0.7rem] transition-transform duration-200 ${
            open ? 'rotate-180 text-accent' : 'text-text-body/50 group-hover:text-accent'
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[17rem] rounded-2xl border border-border-light bg-white p-2 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          <p className="m-0 px-3 pt-2 pb-2.5 font-display text-[0.65rem] font-bold uppercase tracking-[0.1em] text-text-body/60">
            Check stock at
          </p>

          <ul id={listId} role="listbox" aria-label="Shops" className="list-none m-0 p-0 flex flex-col gap-0.5">
            {branches.map((branch, index) => {
              const isSelected = branch.id === branchId
              const status = branchOrderStatus(branch)

              return (
                <li key={branch.id} role="presentation">
                  <button
                    ref={(node) => {
                      optionRefs.current[index] = node
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(branch.id)}
                    onKeyDown={(event) => moveFocus(event, index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-0 text-left font-display cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:bg-bg-section ${
                      isSelected ? 'bg-accent/10' : 'bg-transparent hover:bg-bg-section'
                    }`}
                  >
                    <span className="flex-1 min-w-0">
                      <span className={`block truncate text-[0.9rem] font-bold ${isSelected ? 'text-accent' : 'text-black'}`}>
                        {shortBranchName(branch.name)}
                      </span>
                      {/* branchOrderStatus follows isAcceptingOrders, so a manager's
                          pause turns this amber — see the helper for why not isOpenNow. */}
                      {status && (
                        <span className="mt-0.5 flex items-center gap-1.5 text-[0.72rem] text-text-body/70">
                          <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${TONE_DOT[status.tone]}`} />
                          {status.label}
                        </span>
                      )}
                    </span>

                    {isSelected && <FaCheck aria-hidden="true" className="shrink-0 text-[0.75rem] text-accent" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * One pill. Shaped and animated like the category tabs above it on the same page —
 * `rounded-cta-pill` and the hover scale are the page's existing vocabulary, not new
 * decisions.
 */
function PillOption({ isActive, onClick, label, note = null }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-cta-pill border font-display font-medium text-sm cursor-pointer transition-all duration-300 ease-out hover:scale-105 ${
        isActive
          ? 'bg-accent border-accent text-white'
          : 'bg-white border-border-light text-text-body hover:border-accent hover:text-accent'
      }`}
    >
      {label}
      {note && (
        <span
          className={`font-display text-[0.68rem] ${isActive ? 'text-white/75' : 'text-text-body/60'}`}
        >
          · {note}
        </span>
      )}
    </button>
  )
}
