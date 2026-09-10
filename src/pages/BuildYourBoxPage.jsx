import { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import ShopNav from '../components/products/ShopNav'
import BranchPicker from '../components/products/BranchPicker'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useCatalogue } from '../context/CatalogueContext'
import { useBranch } from '../context/BranchContext'
import { shortBranchName } from '../lib/branches'

const BOX_SIZES = [2, 4, 6, 12]
const PRODUCT_TYPES = ['Donuts', 'Croissants']

export default function BuildYourBoxPage() {
  const [boxSize, setBoxSize] = useState(BOX_SIZES[0])
  const [productType, setProductType] = useState(PRODUCT_TYPES[0])
  const [slots, setSlots] = useState(Array(BOX_SIZES[0]).fill(null))
  const [justAdded, setJustAdded] = useState(false)
  const { addItem, notify } = useCart()
  const { products } = useCatalogue()
  const { branch, hasBranches } = useBranch()

  /**
   * The server requires every item in a box to be `boxEligible` and in stock at the
   * assigned branch, and re-checks both when the box is priced. Neither can reach a slot
   * from here — but they are kept out in different ways.
   *
   * `boxEligible` FILTERS: an item that can never go in a box is not a box option at all.
   * `inStock` does NOT filter: a sold-out item is shown and greyed, the way the menu tiles
   * do it. A silently shorter list tells the customer nothing, while a greyed tile says
   * "we do sell this, just not at this shop today" — and the tile is disabled, so it still
   * cannot be picked.
   *
   * Checked for an explicit false rather than falsiness: `boxEligible` is absent on the
   * bundled fallback catalogue, and `inStock` is absent whenever no branch has been
   * chosen. Treating either absence as "not allowed" would empty this page the moment
   * the API is unreachable.
   */
  const options = products.filter((p) => p.category === productType && p.boxEligible !== false)
  /**
   * Which of the ALREADY PLACED items are sold out right now.
   *
   * Re-read from `products` by id rather than off the slot: a slot holds the product
   * object as it was when it was dropped in, so its `inStock` is a snapshot from that
   * moment. Switch branch afterwards and the catalogue refetches with new stock while
   * the slot keeps the stale copy — reading `slot.inStock` would report the old shop.
   */
  const soldOutSlotIds = new Set(
    slots
      .filter(Boolean)
      .map((slot) => products.find((product) => product.id === slot.id))
      .filter((product) => product?.inStock === false)
      .map((product) => product.id)
  )
  const unavailableInBox = slots.filter((slot) => slot && soldOutSlotIds.has(slot.id)).length

  const filledCount = slots.filter(Boolean).length
  const isFull = filledCount === boxSize
  const total = slots.reduce((sum, item) => sum + (item ? item.price : 0), 0)

  useEffect(() => {
    setSlots(Array(boxSize).fill(null))
  }, [boxSize])

  // Both toasts are raised OUTSIDE the setSlots updater. An updater has to stay pure —
  // StrictMode double-invokes it in development — so firing a notification from inside
  // would announce twice for one tap.
  const handleAddToSlot = (product) => {
    if (isFull) return
    setSlots((current) => {
      const nextEmpty = current.findIndex((slot) => slot === null)
      if (nextEmpty === -1) return current
      const updated = [...current]
      updated[nextEmpty] = product
      return updated
    })
    notify(product, 'added', 'Added to your box', { cartLink: false })
  }

  const handleRemoveSlot = (index) => {
    // Read before the state change, because the toast needs the name and photo of
    // something that is about to leave the slot.
    const removed = slots[index]
    setSlots((current) => current.map((slot, i) => (i === index ? null : slot)))
    if (removed) notify(removed, 'removed', 'Removed from your box', { cartLink: false })
  }

  /**
   * The box goes into the cart WITH its contents.
   *
   * It used to carry only a name and a total, which made it impossible to order: the
   * API prices a box from `{ boxSize, productIds }` and computes the total itself. A
   * line that remembered only its own total had nothing to send.
   *
   * `contents` are local catalogue ids so the cart can re-read prices and photos after a
   * rebuild; `childApiIds` are the Mongo ids checkout actually posts. Both are kept
   * because they answer different questions and deriving one from the other needs the
   * live catalogue, which may not have loaded yet.
   */
  const handleAddToCart = () => {
    // Guarded here as well as on the button: the disabled attribute is a UI state, and
    // a box with a sold-out item in it would be rejected by the server at checkout —
    // where the customer has no way to fix it.
    if (!isFull || unavailableInBox > 0) return
    const box = {
      id: `box-${boxSize}-${productType}-${Date.now()}`,
      kind: 'box',
      boxSize,
      name: `Box of ${boxSize} — ${productType}`,
      price: total,
      image: slots[0]?.image,
      contents: slots.map((item) => item.id),
      childApiIds: slots.map((item) => item.apiId),
    }
    addItem(box, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <>
      <ShopNav />

      <div className="lg:flex lg:items-start lg:gap-12 lg:px-[clamp(2rem,5vw,5.5rem)] lg:py-16">
        <div className="lg:w-[380px] lg:shrink-0 lg:sticky lg:top-8">
          <h1 className="text-center lg:text-left mt-6 mb-6 lg:mt-0 font-display font-bold text-2xl lg:text-3xl text-accent">
            Build your box
          </h1>

          {/* This used to be a plain <select> squeezed into the desktop nav, and hidden
              entirely on mobile — which meant a phone visitor could never check stock
              here at all, and the grid on the right silently showed every item as
              available regardless of what was actually left in a real branch.
              Card-and-pills matches the treatment on /products, so "check stock" reads
              as the same control wherever it appears. */}
          {hasBranches && (
            <div className="mx-5 lg:mx-0 mb-4 rounded-2xl border border-border-light bg-bg-section p-4">
              <p className="m-0 mb-3 font-display font-bold text-sm text-black">
                Checking stock at
              </p>

              <BranchPicker variant="pills" />

              <p className="mt-3 mb-0 font-display text-xs leading-relaxed text-text-body">
                {branch
                  ? `Only showing what's in stock at ${shortBranchName(branch.name)}.`
                  : 'Choose a shop to build from what it actually has today.'}
              </p>
            </div>
          )}

          <div className="mx-5 lg:mx-0 mb-4 bg-white rounded-2xl border border-[#ececec] p-4">
            <p className="m-0 font-display font-bold text-sm text-black">Select your box</p>
            <p className="mt-1 mb-3 text-xs text-[#9a9a9a]">Choose your box from the following</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BOX_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`py-2.5 rounded-lg text-sm font-medium font-display border cursor-pointer whitespace-nowrap ${
                    size === boxSize
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-[#666] border-[#e0e0e0]'
                  }`}
                  onClick={() => setBoxSize(size)}
                >
                  Box of {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-5 lg:mx-0 mb-6 bg-white rounded-2xl border border-[#ececec] p-4">
            <p className="m-0 font-display font-bold text-sm text-black">Select your product</p>
            <p className="mt-1 mb-3 text-xs text-[#9a9a9a]">Choose your product from the following</p>
            <div className="flex gap-2">
              {PRODUCT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium font-display border cursor-pointer transition-transform duration-300 ease-out hover:scale-110 ${
                    type === productType
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-[#666] border-[#e0e0e0]'
                  }`}
                  onClick={() => setProductType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-5 lg:mx-0 mb-6 border-2 border-dashed border-[#d9d9d9] rounded-2xl py-8 px-4 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-4">
              {slots.map((item, i) =>
                item ? (
                  <button
                    key={i}
                    type="button"
                    className={`relative w-16 h-16 rounded-full overflow-hidden border-2 cursor-pointer group ${
                      soldOutSlotIds.has(item.id) ? 'border-[#c0392b]' : 'border-accent'
                    }`}
                    onClick={() => handleRemoveSlot(i)}
                    aria-label={
                      soldOutSlotIds.has(item.id)
                        ? `${item.name} is sold out here. Remove it from your box`
                        : `Remove ${item.name} from box`
                    }
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover ${
                          soldOutSlotIds.has(item.id) ? 'grayscale' : ''
                        }`}
                      />
                    ) : (
                      <span className="w-full h-full block bg-[linear-gradient(135deg,#eef1f4_0%,#e3e8ec_100%)]" />
                    )}
                    {/* Sits under the hover overlay, so hovering still says "Remove" —
                        which is the action this flag is asking for. */}
                    {soldOutSlotIds.has(item.id) && (
                      <span
                        className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#c0392b] text-white text-[0.5rem] font-bold uppercase tracking-wide text-center leading-[0.85rem]"
                        aria-hidden="true"
                      >
                        Sold out
                      </span>
                    )}
                    <span className="absolute inset-0 bg-black/50 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100">
                      Remove
                    </span>
                  </button>
                ) : (
                  <span
                    key={i}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-[#c7c7c7] flex items-center justify-center text-[#c7c7c7] text-lg"
                    aria-hidden="true"
                  >
                    <FaPlus />
                  </span>
                )
              )}
            </div>
            <div className="text-center">
              <p
                className={`m-0 font-display font-medium text-sm ${
                  unavailableInBox > 0 ? 'text-[#c0392b]' : 'text-accent'
                }`}
              >
                {unavailableInBox > 0
                  ? `${unavailableInBox} item${unavailableInBox > 1 ? 's' : ''} sold out at ${
                      branch ? shortBranchName(branch.name) : 'this shop'
                    }`
                  : isFull
                    ? 'Your box is ready!'
                    : `Drop your ${productType.toLowerCase()} here`}
              </p>
              <p className="mt-1 mb-0 text-xs text-[#9a9a9a]">
                {unavailableInBox > 0
                  ? 'Tap the marked one to swap it, or pick a different shop.'
                  : isFull
                    ? `${boxSize} items selected`
                    : `Choose your ${productType.toLowerCase()} from the following (${filledCount}/${boxSize})`}
              </p>
            </div>
          </div>

          <div className="mx-5 lg:mx-0 mb-6 lg:mb-0">
            <button
              type="button"
              className={`w-full h-12 rounded-lg font-display font-bold text-base flex items-center justify-center gap-2 ${
                isFull && unavailableInBox === 0
                  ? 'bg-accent text-white cursor-pointer'
                  : 'bg-accent/50 text-white cursor-not-allowed'
              }`}
              onClick={handleAddToCart}
              disabled={!isFull || unavailableInBox > 0}
            >
              {justAdded
                ? 'Added to cart ✓'
                : unavailableInBox > 0
                  ? 'Swap the sold-out item'
                  : 'Add to cart'}
              <span className="w-1 h-1 rounded-full bg-current opacity-60" />
              Rs {total}
            </button>
          </div>
        </div>

        <div className="lg:flex-1 mt-2 lg:mt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[0.85rem] lg:gap-5 px-5 lg:px-0 pb-12 lg:pb-0">
            {options.map((product) => {
              const alreadyPlaced = slots.filter((s) => s?.id === product.id).length
              // Explicit false, not falsiness: `inStock` is absent until a branch is
              // chosen, and absent must not read as sold out or every tile would grey
              // out before anyone has picked a shop.
              const soldOut = product.inStock === false
              return (
                <button
                  key={product.id}
                  type="button"
                  // No opacity on a sold-out tile: the grayscale overlay below already
                  // says it, and stacking the two makes the photo unreadable.
                  className={`group flex flex-col text-left ${
                    isFull || soldOut ? 'cursor-not-allowed' : 'cursor-pointer'
                  } ${isFull && !soldOut ? 'opacity-50' : ''}`}
                  onClick={() => handleAddToSlot(product)}
                  disabled={isFull || soldOut}
                >
                  <div className="relative border border-border-light rounded-[6px] overflow-hidden aspect-square">
                    {/* A few catalogue items have no photo yet; ProductCard shows the same
                        neutral tile for them rather than a broken <img>. */}
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                          soldOut ? '' : 'group-hover:scale-110'
                        }`}
                      />
                    ) : (
                      <span
                        className="w-full h-full block bg-[linear-gradient(135deg,#eef1f4_0%,#e3e8ec_100%)]"
                        aria-hidden="true"
                      />
                    )}
                    {/* Same treatment as the menu tiles: desaturating the photo carries
                        the message before any label is read. Rendered BEFORE the price
                        badge so the badge paints on top of the overlay rather than under
                        it, which is the layering ProductCard uses. */}
                    {soldOut && (
                      <>
                        <span
                          className="pointer-events-none absolute inset-0 bg-white/55 backdrop-grayscale"
                          aria-hidden="true"
                        />
                        <span className="pointer-events-none absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-white font-display font-bold text-[0.6rem] uppercase tracking-wide">
                          Sold out
                        </span>
                      </>
                    )}
                    {/* Matches the menu tiles: no currency on the face of the badge, and
                        the number sized to be read at a glance. The symbol stays for screen
                        readers, which otherwise announce a bare figure with no unit. */}
                    <span className="absolute top-2 right-2 w-[2.9rem] h-[2.9rem] rounded-full bg-accent text-white flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
                      <span className="sr-only">Rs </span>
                      <span className="font-price font-bold text-[1.1rem]">{product.price}</span>
                    </span>
                    {/* Drops to the bottom when the Sold out pill has taken top-left. The
                        two only ever coexist if this item was placed and the branch was
                        switched afterwards — which is exactly when the count matters most,
                        so it moves rather than being hidden. */}
                    {alreadyPlaced > 0 && (
                      <span
                        className={`absolute left-2 ${
                          soldOut ? 'bottom-2' : 'top-2'
                        } w-5 h-5 rounded-full bg-black/70 text-white text-[0.65rem] font-bold flex items-center justify-center`}
                      >
                        {alreadyPlaced}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 mb-0 font-display font-bold text-[0.75rem] lg:text-base text-center lg:mt-3 text-black">
                    {product.name}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
