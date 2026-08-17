/**
 * Turning coordinates into a street address the customer recognises.
 *
 * ⚠️ **Interim.** Geocoding belongs on the backend — Step 9 (`POST /branches/resolve`)
 * is specified to take an address, geocode it with a server-held Google Maps key, and
 * return the branch. When that lands, this file should be deleted and the call moved
 * behind our own API. Two reasons it belongs there and not here:
 *
 *   1. A Maps key in the browser is a key anyone can read out of the bundle and spend.
 *   2. Geocoding is billed per lookup, so it wants a server-side cache — the same
 *      address gets looked up over and over by the same person retrying a checkout.
 *
 * Until then this uses OpenStreetMap's Nominatim, which needs no key. Note what that
 * means: the customer's coordinates are sent to a third party. It happens only when
 * they press the button, never on page load, and the order works fine without it.
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

    return {
      line1: latin(houseAndRoad) || firstLatin(parts.neighbourhood, parts.suburb),
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
