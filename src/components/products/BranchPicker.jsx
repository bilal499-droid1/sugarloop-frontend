import { useBranch } from '../../context/BranchContext'
import { shortBranchName } from '../../lib/branches'

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
 *              the way. A select, but sized and rounded like everything else here.
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
        <PillOption
          isActive={!branchId}
          onClick={() => setBranchId('')}
          label="All shops"
        />
        {branches.map((branch) => (
          <PillOption
            key={branch.id}
            isActive={branch.id === branchId}
            onClick={() => setBranchId(branch.id)}
            label={shortBranchName(branch.name)}
            // Genuinely useful rather than decorative: a visitor deciding where to
            // collect from wants to know which shops are actually trading right now.
            isClosed={branch.isOpenNow === false}
          />
        ))}
      </div>
    )
  }

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <span className="font-display text-sm text-text-body whitespace-nowrap">Stock at</span>
      <select
        value={branchId ?? ''}
        onChange={(event) => setBranchId(event.target.value)}
        className="h-9 max-w-[13rem] pl-3 pr-2 rounded-cta-pill border border-border-light bg-white font-display text-sm text-black outline-none cursor-pointer transition-colors hover:border-accent focus:border-accent"
      >
        {/* Staying on this option is a legitimate choice, not a prompt to dismiss: it
            means "don't claim availability either way", which is what the menu did
            before branches existed. Naming it plainly beats a disabled placeholder
            that implies the visitor must pick before they may browse. */}
        <option value="">All shops</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {shortBranchName(branch.name)}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * One pill. Shaped and animated like the category tabs above it on the same page —
 * `rounded-cta-pill` and the hover scale are the page's existing vocabulary, not new
 * decisions.
 */
function PillOption({ isActive, onClick, label, isClosed = false }) {
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
      {isClosed && (
        <span
          className={`font-display text-[0.68rem] ${isActive ? 'text-white/75' : 'text-text-body/60'}`}
        >
          · closed
        </span>
      )}
    </button>
  )
}
