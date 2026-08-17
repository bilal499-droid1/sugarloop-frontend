import { useBranch } from '../../context/BranchContext'

/**
 * Lets the visitor check availability at a specific shop, which is what turns on
 * sold-out marking across the menu.
 *
 * ⚠️ Labelled "Stock at", not "Branch", and deliberately so. This choice decides which
 * branch's STOCK is shown — it does not decide which branch fulfils an order. For
 * pickup the server does honour a chosen branch, but for delivery it resolves the
 * branch from the delivery ADDRESS and ignores this entirely
 * (`checkout.service.js: resolveBranch`). Calling this "Branch" would promise a
 * delivery guarantee the checkout will not keep.
 *
 * Renders nothing until the branch list has actually loaded — an empty picker on a
 * preview build with no API would be a control that visibly does nothing.
 */
export default function BranchPicker({ className = '' }) {
  const { branches, branchId, setBranchId, hasBranches } = useBranch()

  if (!hasBranches) return null

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <span className="font-display text-xs text-text-body whitespace-nowrap">Stock at</span>
      <select
        value={branchId ?? ''}
        onChange={(event) => setBranchId(event.target.value)}
        className="h-8 max-w-[12rem] px-2 rounded-lg border border-border-light bg-white font-display text-xs text-black outline-none cursor-pointer focus:border-accent"
      >
        {/* Staying on this option is a legitimate choice, not a prompt to dismiss: it
            means "don't claim availability either way", which is what the menu did
            before branches existed. Naming it plainly beats a disabled placeholder
            that implies the visitor must pick before they may browse. */}
        <option value="">Any branch</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
    </label>
  )
}
