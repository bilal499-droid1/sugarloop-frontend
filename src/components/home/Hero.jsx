import { useState } from 'react'
import { Link } from 'react-router-dom'
import heroBg from '../../assets/DSC04944.jpg'
import logo from '../../assets/sugarLoop 1.png'
import MobileNavMenu from '../MobileNavMenu'

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'Menu', to: '/products' },
  { label: 'Contact', href: '#contact' },
]

const navLinkClass =
  'inline-block text-white no-underline font-bold text-nav-link whitespace-nowrap transition-transform duration-300 ease-out hover:scale-110'

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

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <section
      className="relative w-full aspect-[1920/1080] min-h-[500px] overflow-hidden flex flex-col justify-between py-[clamp(1.5rem,3vw,3.4rem)] px-[clamp(1.5rem,5vw,5.3rem)]"
      aria-label="Hero"
    >
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat md:bg-fixed"
        role="img"
        aria-label="Bakery interior"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-overlay-hero-dark" />
      <div
        className="absolute w-[55%] aspect-[1762/1314] left-[-15%] top-[30%] bg-glow-vignette blur-[120px] opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-[2] w-full">
        <div className="flex sm:hidden items-center justify-between">
          <img src={logo} alt="Sugarloop" className="h-[2.2rem] w-auto" />
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

        <MobileNavMenu open={menuOpen} items={NAV_ITEMS} onClose={() => setMenuOpen(false)} />

        <nav className="hidden sm:flex items-center justify-center gap-[clamp(1rem,3vw,2.75rem)] bg-overlay-nav rounded-nav-pill py-[0.85rem] px-8 w-fit max-w-full mx-auto">
          <div className="shrink-0">
            <img src={logo} alt="Sugarloop" className="h-[2.6rem] w-auto" />
          </div>

          <ul className="list-none flex gap-[clamp(1rem,3vw,2.75rem)] m-0 p-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink item={item} className={navLinkClass} />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="relative z-[2] flex items-center gap-[clamp(1rem,3vw,2rem)]">
        <button
          className="shrink-0 bg-white text-black border-none rounded-btn-sm font-display font-bold text-btn-label py-[0.6rem] px-[1.6rem] cursor-pointer whitespace-nowrap self-end mb-[0.5em] transition-transform duration-300 ease-out hover:scale-110"
          type="button"
        >
          MENU
        </button>
        <h1 className="relative z-[2] m-0 text-white font-bold tracking-hero leading-[1.35] flex flex-col">
          <span className="text-hero-line1">TASTE THE LOOP</span>
          <span className="text-hero-line2">OF HAPPINESS</span>
        </h1>
      </div>
    </section>
  )
}
