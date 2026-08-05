import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" aria-hidden="true">
      <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[52%] h-[52%]" aria-hidden="true">
      <path
        d="M4 7h16M10 7V5h4v2M6 7l1 12h10l1-12M10 11v5M14 11v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// `to` overrides where the tile links (the home page's featured row sends people to
// the listing rather than the detail page). The cart controls float over the bottom
// of the photo and sit outside the Link - a button inside an anchor is invalid markup.
export default function ProductCard({ product, to }) {
  const isLg = product.size === 'lg'
  // object-cover would slice a non-square photo to fill the square tile, so those
  // are shown whole instead. Detected from the file itself - no per-product config.
  const [showWhole, setShowWhole] = useState(false)
  const { items, addItem, setQty, removeItem } = useCart()

  const href = to ?? `/products/${product.id}`
  const qty = items.find((item) => item.id === product.id)?.qty ?? 0
  // At one left, stepping down empties the line, so the control says so with a bin
  // rather than a minus that silently deletes.
  const atLast = qty === 1

  // White buttons with a blue glyph, so the control reads as part of the photo
  // rather than a second blue badge competing with the price bubble. The hairline
  // ring keeps them visible on the white-background product shots.
  const controlBase =
    'flex items-center justify-center rounded-full border-none cursor-pointer transition-colors duration-200'
  const buttonSize = isLg ? 'w-[2rem] h-[2rem] lg:w-9 lg:h-9' : 'w-[1.85rem] h-[1.85rem] lg:w-8 lg:h-8'

  return (
    <div className={`group flex flex-col ${isLg ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
      <div
        className={`relative border border-border-light rounded-[6px] overflow-hidden ${
          showWhole ? 'bg-[#eceef3]' : ''
        } ${isLg ? 'aspect-[677/668]' : 'aspect-square'}`}
      >
        <Link to={href} aria-label={product.name} className="block w-full h-full">
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
        </Link>

        <span
          className={`pointer-events-none absolute top-2 right-2 w-[2.3rem] h-[2.3rem] rounded-full bg-accent text-white flex items-center justify-center gap-px shadow-[0_2px_6px_rgba(0,0,0,0.2)] ${
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

        {/* Quantity stepper over the photo: one tap adds, and the same control then
            steps the line down or bins it, so nobody has to open the product page. */}
        <div
          className={`absolute bottom-2 right-2 flex items-center ${
            isLg ? 'lg:bottom-4 lg:right-4' : ''
          }`}
        >
          {qty > 0 && (
            <div className="flex items-center gap-1 mr-1 rounded-full bg-white ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.18)] p-[0.15rem] pr-2">
              <button
                type="button"
                aria-label={atLast ? `Remove ${product.name} from cart` : `Remove one ${product.name}`}
                onClick={() => (atLast ? removeItem(product.id) : setQty(product.id, qty - 1))}
                className={`${controlBase} ${buttonSize} bg-transparent text-accent hover:bg-[#f0e3e3] hover:text-[#c0392b]`}
              >
                {atLast ? <TrashIcon /> : <MinusIcon />}
              </button>
              <span
                aria-live="polite"
                className={`font-display font-bold text-accent leading-none min-w-[0.75rem] text-center ${
                  isLg ? 'text-[0.9rem]' : 'text-[0.8rem]'
                }`}
              >
                {qty}
              </span>
            </div>
          )}

          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => addItem(product, 1)}
            className={`${controlBase} ${buttonSize} bg-white text-accent ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:bg-[#eef2f6]`}
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      <Link
        to={href}
        className={`block no-underline mt-2 mb-0 font-display font-bold text-[0.75rem] text-center text-black ${
          isLg ? 'lg:text-[1.375rem] lg:mt-[0.85rem]' : 'lg:text-base lg:mt-3'
        }`}
      >
        {product.name}
      </Link>
    </div>
  )
}
