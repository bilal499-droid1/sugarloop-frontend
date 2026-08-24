/**
 * Turning coordinates into a street address, to pre-fill the address fields.
 *
 * **This is a convenience, not a decision.** The geocoding that matters — placing a typed
 * address and choosing which branch delivers to it — moved server-side in Step 9
 * (`POST /branches/resolve`), where the Maps key is unreadable by page scripts and paid
 * lookups are cached across every customer. Nothing here influences which branch is
 * assigned, what the order costs, or whether it is inside the delivery radius.
 *
 * All this does is save the customer typing after they tap "Use my current location". It
 * still sends their coordinates to OpenStreetMap, so it runs only on that tap, never on
 * page load, and a failure costs an autofill rather than a checkout.
 *
 * Worth moving behind our own API too if the reverse lookup ever becomes load-bearing.
 */

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

/** Nominatim asks callers to stay under ~1 request/second. A person pressing a button
 *  cannot realistically exceed that, but the timeout keeps a slow answer from holding
 *  the form hostage — the coordinates are already in hand and are what actually matter. */
const TIMEOUT_MS = 6000

/**
 * Best-effort street address for a point.
 *
 * Returns `null` rather than throwing on any failure. Nothing here is required: the
 * coordinates alone are enough to price and assign the order, and the address field is
 * a convenience the customer can always type themselves. A geocoder being down must
 * never be the reason somebody cannot order a donut.
 */
export async function reverseGeocode({ lat, lng }, { signal } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const onCallerAbort = () => controller.abort()
  signal?.addEventListener('abort', onCallerAbort)

  try {
    const query = new URLSearchParams({
      format: 'jsonv2',
      lat: String(lat),
      lon: String(lng),
      // 18 is roughly building level. Lower and it returns a suburb, which is useless
      // to a rider; higher adds nothing a delivery needs.
      zoom: '18',
      addressdetails: '1',
      /**
       * Force Latin script. Without this Nominatim answers in the local language where
       * one is mapped, and Islamabad returns suburbs in Urdu — "12-ایچ" lands in the
       * address box instead of "H-12". The rest of this form, and the staff dashboard
       * that will read the order, are in English.
       */
      'accept-language': 'en',
    })

    const response = await fetch(`${NOMINATIM}?${query}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) return null

    const data = await response.json()
    const parts = data?.address
    if (!parts) return null

    // Nominatim's field names vary by country and by what is mapped at that point, so
    // each slot takes the first key that is actually present rather than assuming one.
    const houseAndRoad = [parts.house_number, parts.road].filter(Boolean).join(' ')

    /**
     * `accept-language` only helps where an English name has actually been mapped. Much
     * of Islamabad has none, so the suburb comes back in Urdu regardless — H-12 returns
     * "ایچ-12". Rather than drop an Urdu value into an otherwise-English form, prefer the
     * first candidate that contains Latin letters, and fall back to leaving the field
     * empty. Empty is honest and the customer fills it in; a script they did not choose
     * in a field they did not type reads like a bug.
     */
    const latin = (value) => (value && /[A-Za-z]/.test(value) ? value : '')
    const firstLatin = (...values) => values.map(latin).find(Boolean) ?? ''
    /** Unlike `firstLatin`, keeps every distinct match — used where one word (just
     *  "DHA Phase 2") is too thin to be worth typing in for the customer to correct. */
    const joinLatin = (...values) => {
      const seen = new Set()
      for (const value of values) {
        const clean = latin(value)
        if (clean) seen.add(clean)
      }
      return [...seen].join(', ')
    }

    return {
      // No house/road mapped at this point (true for most of DHA) — fall back to every
      // area-level detail available rather than just the first, so the customer has
      // something worth correcting instead of one bare word. `residential` is Nominatim's
      // name for a named housing scheme/sector (e.g. "DHA Phase 2") — often the most
      // specific thing mapped where no street is, so it leads.
      line1: latin(houseAndRoad) || joinLatin(parts.residential, parts.neighbourhood, parts.suburb),
      area: firstLatin(parts.suburb, parts.neighbourhood, parts.city_district, parts.village),
      city: firstLatin(parts.city, parts.town, parts.state_district) || 'Islamabad',
      /** The full human-readable string, for confirming the pin landed somewhere sane. */
      label: data.display_name ?? '',
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onCallerAbort)
  }
}
