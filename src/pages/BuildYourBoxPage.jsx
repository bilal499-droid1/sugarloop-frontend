import { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useCatalogue } from '../context/CatalogueContext'

const BOX_SIZES = [2, 4, 6, 12]
const PRODUCT_TYPES = ['Donuts', 'Croissants']

export default function BuildYourBoxPage() {
  const [boxSize, setBoxSize] = useState(BOX_SIZES[0])
  const [productType, setProductType] = useState(PRODUCT_TYPES[0])
  const [slots, setSlots] = useState(Array(BOX_SIZES[0]).fill(null))
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()
  const { products } = useCatalogue()

  /**
   * The server requires every item in a box to be `boxEligible` and in stock at the
   * assigned branch, and re-checks both when the box is priced. Both are filtered here
   * so a box cannot be built out of items that would be rejected at checkout.
   *
   * Each condition is checked for an explicit false rather than falsiness: `boxEligible`
   * is absent on the bundled fallback catalogue, and `inStock` is absent whenever no
   * branch has been chosen. Treating either absence as "not allowed" would empty this
   * page the moment the API is unreachable.
   */
  const options = products.filter(
    (p) => p.category === productType && p.boxEligible !== false && p.inStock !== false
  )
  const filledCount = slots.filter(Boolean).length
  const isFull = filledCount === boxSize
  const total = slots.reduce((sum, item) => sum + (item ? item.price : 0), 0)

  useEffect(() => {
    setSlots(Array(boxSize).fill(null))
  }, [boxSize])

  const handleAddToSlot = (product) => {
    setSlots((current) => {
      const nextEmpty = current.findIndex((slot) => slot === null)
      if (nextEmpty === -1) return current
      const updated = [...current]
      updated[nextEmpty] = product
      return updated
    })
  }

  const handleRemoveSlot = (index) => {
    setSlots((current) => current.map((slot, i) => (i === index ? null : slot)))
  }

  const handleAddToCart = () => {
    if (!isFull) return
    const box = {
      id: `box-${boxSize}-${productType}-${Date.now()}`,
      name: `Box of ${boxSize} — ${productType}`,
      price: total,
      image: slots[0]?.image,
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
                    className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent cursor-pointer group"
                    onClick={() => handleRemoveSlot(i)}
                    aria-label={`Remove ${item.name} from box`}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full block bg-[linear-gradient(135deg,#eef1f4_0%,#e3e8ec_100%)]" />
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
              <p className="m-0 font-display font-medium text-accent text-sm">
                {isFull ? 'Your box is ready!' : `Drop your ${productType.toLowerCase()} here`}
              </p>
              <p className="mt-1 mb-0 text-xs text-[#9a9a9a]">
                {isFull
                  ? `${boxSize} items selected`
                  : `Choose your ${productType.toLowerCase()} from the following (${filledCount}/${boxSize})`}
              </p>
            </div>
          </div>

          <div className="mx-5 lg:mx-0 mb-6 lg:mb-0">
            <button
              type="button"
              className={`w-full h-12 rounded-lg font-display font-bold text-base flex items-center justify-center gap-2 ${
                isFull
                  ? 'bg-accent text-white cursor-pointer'
                  : 'bg-accent/50 text-white cursor-not-allowed'
              }`}
              onClick={handleAddToCart}
              disabled={!isFull}
            >
              {justAdded ? 'Added to cart ✓' : 'Add to cart'}
              <span className="w-1 h-1 rounded-full bg-current opacity-60" />
              Rs {total}
            </button>
          </div>
        </div>

        <div className="lg:flex-1 mt-2 lg:mt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[0.85rem] lg:gap-5 px-5 lg:px-0 pb-12 lg:pb-0">
            {options.map((product) => {
              const alreadyPlaced = slots.filter((s) => s?.id === product.id).length
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`group flex flex-col text-left ${isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => handleAddToSlot(product)}
                  disabled={isFull}
                >
                  <div className="relative border border-border-light rounded-[6px] overflow-hidden aspect-square">
                    {/* A few catalogue items have no photo yet; ProductCard shows the same
                        neutral tile for them rather than a broken <img>. */}
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <span
                        className="w-full h-full block bg-[linear-gradient(135deg,#eef1f4_0%,#e3e8ec_100%)]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="absolute top-2 right-2 w-[2.3rem] h-[2.3rem] rounded-full bg-accent text-white flex items-center justify-center gap-px shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
                      <span className="font-price italic font-semibold text-[0.5rem]">Rs</span>
                      <span className="font-price font-bold text-[0.85rem]">{product.price}</span>
                    </span>
                    {alreadyPlaced > 0 && (
                      <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/70 text-white text-[0.65rem] font-bold flex items-center justify-center">
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
