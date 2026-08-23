/**
 * Branch display helpers.
 *
 * Lives in `lib/` rather than alongside the picker because the menu page needs it too,
 * and exporting a plain function from a component file trips `react-refresh` — a
 * component module is expected to export only components.
 */

/**
 * "Sugar Loop DHA 1" → "DHA 1".
 *
 * The shop's own name is redundant on the shop's own site, and at pill size it is the
 * half that pushes the part people actually read off the end of the row. Falls back to
 * the full name if stripping leaves nothing, so a branch named only "Sugar Loop" still
 * renders as something.
 */
export function shortBranchName(name) {
  return String(name ?? '').replace(/^sugar\s*loop\s*/i, '').trim() || name
}
