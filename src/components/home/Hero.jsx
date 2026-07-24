import { Link } from 'react-router-dom'
import heroBg from '../../assets/DSC04944.jpg'
import logo from '../../assets/sugarLoop 1.png'

const NAV_LINKS = ['Home', 'Menu', 'About'] // labels are placeholders — Figma layers were named generically "Page 1" x3

const navLinkClass =
  'inline-block text-white no-underline font-bold text-nav-link whitespace-nowrap transition-transform duration-300 ease-out hover:scale-110'

export default function Hero() {
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

      <nav className="relative z-[2] flex items-center justify-center flex-wrap sm:flex-nowrap gap-3 sm:gap-[clamp(1rem,3vw,2.75rem)] bg-overlay-nav rounded-nav-pill py-[0.85rem] px-8 w-fit max-w-full mx-auto">
        <div className="shrink-0">
          <img src={logo} alt="Sugarloop" className="h-[2.6rem] w-auto" />
        </div>

        <ul className="list-none flex gap-3 sm:gap-[clamp(1rem,3vw,2.75rem)] m-0 p-0">
          {NAV_LINKS.slice(0, 2).map((label) =>
            label === 'Menu' ? (
              <li key={label}>
                <Link to="/products" className={navLinkClass}>{label}</Link>
              </li>
            ) : (
              <li key={label}>
                <a href={`#${label.toLowerCase()}`} className={navLinkClass}>{label}</a>
              </li>
            )
          )}
        </ul>

        <ul className="list-none flex gap-3 sm:gap-[clamp(1rem,3vw,2.75rem)] m-0 p-0">
          <li>
            <a href="#contact" className={navLinkClass}>Contact</a>
          </li>
        </ul>
      </nav>

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
