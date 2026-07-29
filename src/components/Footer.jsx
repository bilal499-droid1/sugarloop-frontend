import { Link } from 'react-router-dom'
import donutMark from '../assets/logs.svg'

// Column layout mirrors the reference footer (assets/fkk.png), minus the
// newsletter block, brand wordmark and copyright bar. Colors are inverted from
// the reference since this footer sits on white rather than near-black.
const COLUMNS = [
  {
    heading: 'LEARN MORE',
    links: [
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
  {
    heading: 'KEEP IN TOUCH',
    links: [
      { label: '051-111-557-799', href: 'tel:051111557799' },
      { label: 'Our Locations', href: '#' },
      { label: 'Instagram', href: '#' },
    ],
  },
]

const linkClass =
  'text-text-body no-underline text-[1rem] transition-colors duration-200 hover:text-accent'

function FooterLink({ link }) {
  return link.to ? (
    <Link to={link.to} className={linkClass}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className={linkClass}>
      {link.label}
    </a>
  )
}

export default function Footer() {
  return (
    <footer
      className="bg-white border-t border-faq-border py-[clamp(2.5rem,6vw,4rem)] px-[clamp(1.5rem,5vw,4rem)]"
      aria-label="Footer"
    >
      {/* Logo takes the slot the newsletter block occupies in the reference, so the
          link columns sit right-aligned exactly as they do there. */}
      <div className="max-w-[1200px] mx-auto flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-[clamp(2rem,5vw,4rem)]">
        {/* logs.svg centres the donut in a 432x288 viewBox, so the art is only ~28%
            of the file's width - sizing by height alone would leave a wide gap. */}
        <Link to="/" aria-label="Sugarloop home" className="shrink-0">
          <img
            src={donutMark}
            alt="Sugarloop"
            className="h-[10rem] sm:h-[16rem] w-auto object-contain [object-position:left]"
          />
        </Link>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-[clamp(2rem,5vw,4.5rem)]">
          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="m-0 mb-[clamp(1.25rem,3vw,1.75rem)] font-display font-black text-black uppercase text-[1.15rem] tracking-[0.02em]">
                {column.heading}
              </h2>
              <ul className="list-none m-0 p-0 flex flex-col gap-[clamp(0.75rem,2vw,1.1rem)]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  )
}
