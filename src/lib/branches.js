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

/**
 * The four shops, as a fallback for when the API is not configured.
 *
 * Mirrors `scripts/seed.js` in the backend — same names, same addresses, same
 * coordinates. Duplicated rather than fetched for the same reason `productsData.js` is:
 * leaving `VITE_API_BASE_URL` empty is a supported mode, and a "Find Sugarloop" section
 * that renders nothing is a worse answer than one rendering four real addresses.
 *
 * ⚠️ The API wins whenever it answers. This is a floor, not a source of truth — if a
 * branch moves, it moves in the backend seed first and here second.
 *
 * Coordinates are [lat, lng] as the API returns them, NOT the [lng, lat] GeoJSON order
 * the database stores. Getting those backwards puts all four shops in the Indian Ocean.
 */
export const FALLBACK_BRANCHES = [
  {
    id: 'fallback-dha1',
    code: 'DHA1',
    name: 'Sugar Loop DHA 1',
    address: 'H32V+J2F, DHA Phase 1, Islamabad',
    location: { lat: 33.5515545, lng: 73.0925354 },
  },
  {
    id: 'fallback-dha2',
    code: 'DHA2',
    name: 'Sugar Loop DHA 2',
    address: '1st Floor, Nadir Arcade, Sector E, DHA Phase II, Islamabad',
    location: { lat: 33.5312498, lng: 73.1574172 },
  },
  {
    id: 'fallback-bah4',
    code: 'BAH4',
    name: 'Sugar Loop Bahria Phase 4',
    address: 'Marina Commercial, Corniche Road, near WeDrink, Bahria Town Phase 4, Islamabad 46220',
    location: { lat: 33.5465939, lng: 73.1233008 },
  },
  {
    id: 'fallback-nust',
    code: 'NUST',
    name: 'Sugar Loop NUST H-12',
    address: 'SINES / NSTP Building, NUST, Khyber Road, H-12, Islamabad 44000',
    location: { lat: 33.6461047, lng: 72.9974445 },
  },
]

/**
 * A Google Maps embed URL for a branch.
 *
 * Driven by COORDINATES, not by a text query. The old FAQ page embedded
 * `?q=DHA Phase 2`, which asks Google to guess — and Google's guess for an area name is
 * the middle of the area, not the shop. These are the same coordinates the delivery
 * radius is measured from, so the pin is the actual door.
 *
 * Falls back to the address when a branch somehow has no point on it, which is better
 * than an empty map frame.
 */
export function branchMapUrl(branch) {
  const { lat, lng } = branch?.location ?? {}
  const query =
    Number.isFinite(lat) && Number.isFinite(lng) ? `${lat},${lng}` : (branch?.address ?? '')

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}
