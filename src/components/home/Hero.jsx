import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import heroBg from '../../assets/bgh1.webp'
import mobileHeroBg from '../../assets/category/GDRGG-04.webp'
import { useCart } from '../../context/CartContext'
import MobileNavMenu from '../MobileNavMenu'
import DesktopMenuDropdown from '../DesktopMenuDropdown'
import SugarLoopMark from '../SugarLoopMark'

// A shared reference, not a copy: it heads both the pill nav and the hamburger,
// and MOBILE_NAV_ITEMS de-dupes by identity so the drawer lists it once.
const HOME_ITEM = { label: 'Home', to: '/#home' }

// `to` rather than `href` on the hash links so the router handles them: a plain
// anchor reloads the whole app, and ScrollToTop only sees the hash on a
// client-side navigation. /#home is the hero section, i.e. the page top, and
// /#contact is the footer.
const NAV_ITEMS = [
  HOME_ITEM,
  { label: 'Menu', to: '/products' },
  { label: 'Contact', to: '/#contact' },
]

// Surfaced via the desktop-only hamburger next to the pill nav, so the rest of
// the site stays reachable from the homepage without crowding Home/Menu/Contact.
// Home leads it anyway: a hamburger that can't take you back to the top reads as
// incomplete, even though the pill nav beside it carries the same link.
const MORE_PAGES = [
  HOME_ITEM,
  { label: 'Products', to: '/products' },
  { label: 'Build a Box', to: '/build-your-box' },
  { label: 'Corporate Gifting', to: '/corporate-gifting' },
  { label: 'FAQ', to: '/faq' },
  { label: 'About us', to: '/#about' },
]

// MORE_PAGES rides the desktop-only hamburger, so on a phone those pages had no
// route in at all - the drawer carried Home/Menu/Contact and nothing else. It gets
// both lists instead, minus the entries NAV_ITEMS already covers: Home outright,
// and Products because Menu is already pointing at /products.
const MOBILE_NAV_ITEMS = [
  ...NAV_ITEMS,
  ...MORE_PAGES.filter((item) => !NAV_ITEMS.includes(item) && item.to !== '/products'),
]

const navLinkClass =
  'inline-block text-white no-underline font-bold text-nav-link whitespace-nowrap transition-transform duration-300 ease-out hover:scale-110'

const HERO_CATEGORIES = ['Croissants', 'Donuts', 'Drinks', 'Sandwiches']

// Below sm the label and padding are in vw so all four pills stay on one line down to
// the narrowest phones; from sm up the label matches the nav links above.
const categoryBtnClass =
  'inline-block shrink-0 bg-transparent text-white border border-white rounded-full font-display font-bold cursor-pointer whitespace-nowrap no-underline transition-transform duration-300 ease-out hover:scale-110 text-[2.6vw] py-[1vw] px-[1.7vw] sm:text-nav-link sm:py-[0.25rem] sm:px-[1.15rem]'

function NavLink({ item, className, onClick }) {
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

// Always white: unlike ShopNav's onImage toggle, the hero photo is the only
// background this nav ever sits on.
function CartLink({ className }) {
  const { count } = useCart()
  return (
    <Link to="/cart" className={`relative flex items-center text-white ${className}`} aria-label={`Cart, ${count} items`}>
      <FaShoppingCart />
      {count > 0 && (
        <span className="absolute -top-2 -right-[0.6rem] min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-accent-dark text-white font-display font-bold text-[0.65rem] flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  )
}

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Mobile aspect tracks GDRGG-04.png (1638x1959) so its baked-in headline isn't
  // cropped by bg-cover; min-h only kicks in from sm up for the same reason.
  return (
    <section
      id="home"
      className="relative w-full aspect-[1638/1959] sm:aspect-[1920/1080] sm:min-h-[500px] overflow-hidden flex flex-col justify-between py-[clamp(1.5rem,3vw,3.4rem)] px-[clamp(1.5rem,5vw,5.3rem)]"
      aria-label="Hero"
    >
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat block sm:hidden"
        role="img"
        aria-label="Cream-filled sugared donuts"
        style={{ backgroundImage: `url(${mobileHeroBg})` }}
      />
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat hidden sm:block md:bg-fixed"
        role="img"
        aria-label="Cream-filled sugared donuts"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Edge scrims only: they keep the nav and buttons legible while leaving the
          headline baked into bgh1.png at its true white. */}
      <div
        className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[14%] sm:h-1/3 bg-gradient-to-t from-black/45 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-[2] w-full">
        <div className="flex sm:hidden items-center justify-between">
          <SugarLoopMark className="h-[4.4rem] w-auto aspect-[432/288]" />
          <div className="flex items-center gap-5">
            <CartLink className="text-[1.3rem]" />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="flex flex-col justify-center gap-[5px] w-7 h-6 bg-none border-none cursor-pointer p-0"
            >
              <span className="block h-[2px] w-full bg-white rounded-[1px]" />
              <span className="block h-[2px] w-full bg-white rounded-[1px]" />
              <span className="block h-[2px] w-full bg-white rounded-[1px]" />
            </button>
          </div>
        </div>

        <MobileNavMenu
          open={menuOpen}
          items={MOBILE_NAV_ITEMS}
          onClose={() => setMenuOpen(false)}
          variant="light"
        />

        <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center w-full">
          <SugarLoopMark className="h-[7.8rem] w-auto aspect-[432/288] justify-self-start" />

          <div className="flex items-center justify-center gap-3">
            <nav className="flex items-center justify-center gap-[clamp(1rem,3vw,2.75rem)] bg-overlay-nav rounded-nav-pill py-[0.85rem] px-8 w-fit max-w-full">
              <ul className="list-none flex gap-[clamp(1rem,3vw,2.75rem)] m-0 p-0">
                {NAV_ITEMS.map((item) => (
                  <li key={item.label}>
                    <NavLink item={item} className={navLinkClass} />
                  </li>
                ))}
              </ul>
            </nav>

            <DesktopMenuDropdown items={MORE_PAGES} />
          </div>

          <CartLink className="text-[1.4rem] justify-self-end" />
        </div>
      </div>

      <div className="relative z-[2] flex justify-center mb-[clamp(1.5rem,5vw,4rem)]">
        <div className="flex flex-nowrap items-center justify-center gap-[1.3vw] sm:gap-[clamp(0.75rem,2vw,1.5rem)]">
          {HERO_CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/products?category=${encodeURIComponent(category)}`}
              className={categoryBtnClass}
            >
              {category.toUpperCase()}
            </Link>
          ))}
        </div>
        {/* Headline is baked into bgh1.png; kept here for screen readers and SEO. */}
        <h1 className="sr-only">Taste the loop of happiness</h1>
      </div>
    </section>
  )
}
