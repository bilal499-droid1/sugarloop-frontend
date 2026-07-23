import { Link } from 'react-router-dom'
import './Hero.css'
import heroBg from '../../assets/DSC04944.jpg'
import logo from '../../assets/sugarLoop 1.png'

const NAV_LINKS = ['Home', 'Menu', 'About'] // labels are placeholders — Figma layers were named generically "Page 1" x3

export default function Hero() {
  return (
    <section className="hero" aria-label="Hero">
      <div
        className="hero__bg"
        role="img"
        aria-label="Bakery interior"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="hero__overlay" />
      <div className="hero__glow" aria-hidden="true" />

      <nav className="hero__nav">
        <div className="hero__logo">
          <img src={logo} alt="Sugarloop" />
        </div>

        <ul className="hero__nav-links">
          {NAV_LINKS.slice(0, 2).map((label) =>
            label === 'Menu' ? (
              <li key={label}>
                <Link to="/products">{label}</Link>
              </li>
            ) : (
              <li key={label}>
                <a href={`#${label.toLowerCase()}`}>{label}</a>
              </li>
            )
          )}
        </ul>

        <ul className="hero__nav-links">
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
      </nav>

      <div className="hero__bottom">
        <button className="hero__menu-btn" type="button">
          MENU
        </button>
        <h1 className="hero__headline">
          <span className="hero__headline-line1">TASTE THE LOOP</span>
          <span className="hero__headline-line2">OF HAPPINESS</span>
        </h1>
      </div>
    </section>
  )
}
