/**
 * Turning API products into the shape this site's components already expect.
 *
 * The bundled `productsData.js` does not go away when the API arrives. It keeps doing
 * two jobs neither of which the API can do yet:
 *
 * 1. **It owns the photography.** The API seeds `images: []` — publishing them is
 *    blocked on moving Cloudinary to a client-owned account. Our images are local
 *    `.webp` files that Vite hashes and optimises at build time. Sourcing the
 *    catalogue from the API without merging these back in would replace every
 *    product tile on the site with a grey placeholder.
 * 2. **It is the fallback.** If the API is unreachable, slow, or not configured, the
 *    menu still renders — from the same data that shipped before the backend existed.
 *    A bakery site that shows an empty menu because a server blipped is worse than one
 *    that shows a menu a few hours stale.
 *
 * What the API brings that the bundle cannot: prices that are true right now, products
 * an admin retires actually disappearing, and (once a branch is known) per-branch stock.
 */
import { PRODUCTS as LOCAL_PRODUCTS } from '../components/products/productsData'

/**
 * `legacyId` is the join.
 *
 * The API carries the numeric id each product had in this file, precisely so the two
 * catalogues can be lined up. It is also why the merged product keeps that number as
 * its `id` rather than adopting the Mongo `_id`: `/products/12` is a live URL, and
 * every cart already saved in a customer's localStorage is keyed by these numbers.
 * Changing the id would 404 the first and silently empty the second.
 */
const LOCAL_BY_ID = new Map(LOCAL_PRODUCTS.map((product) => [product.id, product]))

/** Rs 299 is `29900` over the wire — hundredths of a rupee, the way cents work. */
const MINOR_UNITS_PER_RUPEE = 100

/**
 * One API product, in storefront shape.
 *
 * Everything visual comes from the local record; everything commercial comes from the
 * API. That split is the whole design: the backend is the source of truth for what a
 * thing costs and whether it is still sold, and this bundle is the source of truth for
 * what it looks like.
 */
export function toStorefrontProduct(apiProduct) {
  const local = LOCAL_BY_ID.get(apiProduct.legacyId)

  return {
    // Falls back to the Mongo id for a product created after this bundle was built —
    // it has no legacyId and no local record, so it gets a string id and the
    // placeholder tile. Both the router and the cart already accept string ids.
    id: apiProduct.legacyId ?? apiProduct.id,

    /**
     * The Mongo `_id`. Nothing on screen uses it, but `POST /checkout/quote` and
     * `POST /orders` both identify products by it, so carrying it now means the
     * ordering stage does not have to re-fetch the catalogue to find it.
     */
    apiId: apiProduct.id,
    slug: apiProduct.slug,
    sku: apiProduct.sku,

    name: apiProduct.name,
    category: apiProduct.category,
    type: apiProduct.type,

    /**
     * Rupees, because that is what every price on this site renders as (`Rs {price}`).
     * `priceMinor` keeps the exact integer the API sent — any arithmetic that ends up
     * back at the server should use it and never the divided float, since the backend's
     * second rule is that money is never a float.
     */
    price: apiProduct.price / MINOR_UNITS_PER_RUPEE,
    priceMinor: apiProduct.price,
    priceFormatted: apiProduct.priceFormatted,

    description: apiProduct.description || local?.description || '',
    boxEligible: apiProduct.boxEligible,

    // Local, always. See the note at the top of this file.
    images: local?.images ?? [],
    image: local?.images?.[0],
    size: local?.size ?? 'sm',

    /**
     * Present only when the products were fetched for a specific branch. Left
     * `undefined` otherwise rather than defaulted to `true` — an absent field makes a
     * component ask, a wrong `true` makes it lie about a sold-out tray.
     */
    inStock: apiProduct.inStock,
  }
}

/**
 * The API's catalogue, in this site's order.
 *
 * Ordering deliberately follows the LOCAL array rather than the API's
 * `category → sortOrder → name`. The bundled order is hand-curated — Signature donuts
 * before Classic before Crafted — and the products page renders each category in array
 * order, so adopting the API's sort would visibly reshuffle the menu the moment the
 * backend is switched on. Anything genuinely new (an admin-created product with no
 * local counterpart) has no curated position, so it goes on the end where it is
 * obvious rather than interleaved somewhere arbitrary.
 */
export function mergeCatalogue(apiProducts) {
  const mapped = apiProducts.map(toStorefrontProduct)

  const positionOf = new Map(LOCAL_PRODUCTS.map((product, index) => [product.id, index]))
  const known = []
  const added = []

  for (const product of mapped) {
    if (positionOf.has(product.id)) known.push(product)
    else added.push(product)
  }

  known.sort((a, b) => positionOf.get(a.id) - positionOf.get(b.id))

  return [...known, ...added]
}

export { LOCAL_PRODUCTS }
