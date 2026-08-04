import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

// `to` overrides where the tile links (the home page's featured row sends people to
// the listing rather than the detail page); `showAddToCart` adds the button below
// the name, kept outside the Link since a button inside an anchor is invalid markup.
export default function ProductCard({ product, to, showAddToCart = false }) {
  const isLg = product.size === 'lg'
  // object-cover would slice a non-square photo to fill the square tile, so those
  // are shown whole instead. Detected from the file itself - no per-product config.
  const [showWhole, setShowWhole] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <div className={`group flex flex-col ${isLg ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
      <Link to={to ?? `/products/${product.id}`} className="flex flex-col no-underline text-inherit">
        <div
          className={`relative border border-border-light rounded-[6px] overflow-hidden ${
            showWhole ? 'bg-[#eceef3]' : ''
          } ${isLg ? 'aspect-[677/668]' : 'aspect-square'}`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget
                setShowWhole(Math.abs(naturalWidth / naturalHeight - 1) > 0.02)
              }}
              className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-110 ${
                showWhole ? 'object-contain' : 'object-cover'
              }`}
            />
          ) : (
            <div
              className="w-full h-full bg-[linear-gradient(135deg,#eef1f4_0%,#e3e8ec_100%)]"
              aria-hidden="true"
            />
          )}
          <span
            className={`absolute top-2 right-2 w-[2.3rem] h-[2.3rem] rounded-full bg-accent text-white flex items-center justify-center gap-px shadow-[0_2px_6px_rgba(0,0,0,0.2)] ${
              isLg ? 'lg:w-14 lg:h-14 lg:top-4 lg:right-4' : ''
            }`}
          >
            <span className={`font-price italic font-semibold text-[0.5rem] ${isLg ? 'lg:text-xs' : ''}`}>
              Rs
            </span>
            <span className={`font-price font-bold text-[0.85rem] ${isLg ? 'lg:text-[1.375rem]' : ''}`}>
              {product.price}
            </span>
          </span>
        </div>
        <p
          className={`mt-2 mb-0 font-display font-bold text-[0.75rem] text-center text-black ${
            isLg ? 'lg:text-[1.375rem] lg:mt-[0.85rem]' : 'lg:text-base lg:mt-3'
          }`}
        >
          {product.name}
        </p>
      </Link>

      {showAddToCart && (
        <button
          type="button"
          className="mt-2 w-full h-9 border-none rounded-[4px] bg-accent-dark text-white font-display font-bold text-[0.7rem] cursor-pointer lg:h-10 lg:text-[0.85rem]"
          onClick={handleAddToCart}
        >
          {justAdded ? 'Added ✓' : 'Add to cart'}
        </button>
      )}
    </div>
  )
}
