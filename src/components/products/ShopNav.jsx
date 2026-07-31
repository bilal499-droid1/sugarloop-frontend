import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import { useCart } from '../../context/CartContext'
import MobileNavMenu from '../MobileNavMenu'
import SugarLoopMark from '../SugarLoopMark'
import plogo from '../../assets/Plogo.svg'

// Steps up to 2xl only past 1536px - at 24px the five links plus the enlarged
// logo need ~1393px, which forces the whole document to scroll sideways on
// 1024-1280 laptops.
const navLinkBase = 'no-underline text-base xl:text-xl 2xl:text-2xl'

// Medium to match the on-image variant: black plus a same-color stroke thickening
// the glyphs read far heavier than the rest of these pages.
const navLinkClass = `${navLinkBase} text-accent font-medium`

// onImage variant: the links sit on the hero photo rather than a light page, so
// no stroke - the weight is what the design asks for, not a legibility crutch.
const navLinkOnImageClass = `${navLinkBase} text-white font-medium`

// The mark reads oversized on a phone, where it takes a real share of the width.
// 5.76rem is 80% of the desktop 7.2rem, which is unchanged from lg up.
const logoSizeClass = 'h-[5.76rem] lg:h-[7.2rem]'

const NAV_ITEMS = [
  { label: 'Products', to: '/products' },
  { label: 'Build a Box', to: '/build-your-box' },
  { label: 'Corporate Gifting', to: '/corporate-gifting' },
  { label: 'FAQ', to: '/faq' },
  // `to` rather than `href` so the router handles it: a plain anchor reloads the
  // whole app, and ScrollToTop only sees the hash on a client-side navigation.
  { label: 'About us', to: '/#about' },
]

function ShopNavLink({ item, className, onClick }) {
  return item.to ? (
    <Link to={item.to} className={className} onClick={onClick}>
      {item.label}
    </Link>
  ) : (
    <a href={item.href} className={className} onClick={onClick}>
      {item.label}
    </a>
  )
}

// onImage is opt-in: ShopNav also renders on Corporate Gifting, FAQ, Build a Box
// and Product Detail, which are light pages where white links would vanish.
export default function ShopNav({ onImage = false }) {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="relative z-[2] flex items-center justify-between gap-4 pt-5 px-5 pb-0 lg:pt-10 lg:px-[clamp(2rem,5vw,5.5rem)] lg:pb-0">
      <Link to="/" aria-label="Sugarloop home">
        {/* Plogo is a white mark, so it only works over the hero photo - the light
            pages keep the blue wordmark or the logo would vanish into the page.
            It carries its own 432x307.47 ratio, so height alone sizes it. */}
        {onImage ? (
          <img src={plogo} alt="Sugarloop" className={`${logoSizeClass} w-auto block`} />
        ) : (
          <SugarLoopMark className={`${logoSizeClass} w-auto aspect-[432/288] block`} />
        )}
      </Link>

      <ul className="hidden lg:flex list-none gap-[clamp(1.5rem,3vw,3rem)] m-0 ml-auto p-0">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <ShopNavLink item={item} className={onImage ? navLinkOnImageClass : navLinkClass} />
          </li>
        ))}
      </ul>

      {/* Cart follows the links: white over the hero photo, accent on the light
          pages where a white cart would disappear. */}
      <div
        className={`relative flex items-center text-[1.1rem] ml-auto mr-3 lg:ml-8 lg:text-[1.25rem] ${
          onImage ? 'text-white' : 'text-accent'
        }`}
        aria-label={`Cart, ${count} items`}
      >
        <FaShoppingCart />
        {count > 0 && (
          <span className="absolute -top-2 -right-[0.6rem] min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-accent-dark text-white font-display font-bold text-[0.65rem] flex items-center justify-center">
            {count}
          </span>
        )}
      </div>

      <button
        className="flex flex-col justify-center gap-1 w-[22px] h-[21px] bg-none border-none cursor-pointer p-0 lg:hidden"
        type="button"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {/* Same switch as the links and cart: white over the hero photo, black on
            the light pages where white bars would be invisible. */}
        {[0, 1, 2].map((bar) => (
          <span
            key={bar}
            className={`block h-[2px] w-full rounded-[1px] ${onImage ? 'bg-white' : 'bg-black'}`}
          />
        ))}
      </button>

      {/* variant="light" so this drawer matches the one the home page hero opens */}
      <MobileNavMenu
        open={menuOpen}
        items={NAV_ITEMS.filter((item) => item.label !== 'Products')}
        onClose={() => setMenuOpen(false)}
        variant="light"
      />
    </nav>
  )
}
