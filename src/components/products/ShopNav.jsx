import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import { useCart } from '../../context/CartContext'
import MobileNavMenu from '../MobileNavMenu'
import SugarLoopMark from '../SugarLoopMark'

// 900 is the heaviest Satoshi face, so the extra weight comes from a same-color
// stroke thickening the glyphs - same trick MobileNavMenu uses for its links.
const navLinkClass =
  // Steps up to 2xl only past 1536px - at 24px the five links plus the enlarged
  // logo need ~1393px, which forces the whole document to scroll sideways on
  // 1024-1280 laptops.
  'text-accent no-underline font-black text-base xl:text-xl 2xl:text-2xl [-webkit-text-stroke:0.6px_#587ea2]'

const NAV_ITEMS = [
  { label: 'Products', to: '/products' },
  { label: 'Build a Box', to: '/build-your-box' },
  { label: 'Corporate Gifting', to: '/corporate-gifting' },
  { label: 'FAQ', to: '/faq' },
  { label: 'About us', href: '/#about' },
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

export default function ShopNav() {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="relative z-[2] flex items-center justify-between gap-4 pt-5 px-5 pb-0 lg:pt-10 lg:px-[clamp(2rem,5vw,5.5rem)] lg:pb-0">
      <Link to="/" aria-label="Sugarloop home">
        <SugarLoopMark className="h-[7.2rem] w-auto aspect-[432/288] block" />
      </Link>

      <ul className="hidden lg:flex list-none gap-[clamp(1.5rem,3vw,3rem)] m-0 ml-auto p-0">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <ShopNavLink item={item} className={navLinkClass} />
          </li>
        ))}
      </ul>

      <div
        className="relative flex items-center text-accent text-[1.1rem] ml-auto mr-3 lg:ml-8 lg:text-[1.25rem]"
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
        <span className="block h-[2px] w-full bg-black rounded-[1px]" />
        <span className="block h-[2px] w-full bg-black rounded-[1px]" />
        <span className="block h-[2px] w-full bg-black rounded-[1px]" />
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
