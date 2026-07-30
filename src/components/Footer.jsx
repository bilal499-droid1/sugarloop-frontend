import { Link } from 'react-router-dom'
import donutMark from '../assets/logs.svg'

// Column layout mirrors the reference footer (assets/fkk.png), minus the
// newsletter block, brand wordmark and copyright bar. Logo and link columns are
// both left-aligned on the brand-blue panel.
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
      { label: 'LinkedIn', href: '#' },
    ],
  },
]

const linkClass =
  'text-white/85 no-underline text-[1rem] transition-colors duration-200 hover:text-white'

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
      className="bg-accent-dark py-[clamp(2.5rem,6vw,4rem)] px-[clamp(1.5rem,5vw,4rem)]"
      aria-label="Footer"
    >
      {/* Logo holds the left edge, the link columns are pushed to the opposite end
          of the row. They keep their own left-aligned text so the two headings and
          their lists still line up with each other. */}
      <div className="max-w-[1200px] mx-auto flex flex-col items-start gap-10 text-left sm:flex-row sm:items-start sm:justify-between sm:gap-[clamp(2rem,5vw,4rem)]">
        {/* logs.svg's art sits at x 137.5-285.6 of a 432x288 viewBox, so 31.83% of
            the rendered width is empty gutter on the left. Because w-auto ties the
            width to the height (432/288 = 1.5x), that gutter is a fixed 0.4774 of
            the height - 4.774rem at h-10rem, 7.639rem at sm's h-16rem. Pulling it
            back puts the donut itself, not the file's edge, on the left margin.
            On top of that the footer's whole left padding is cancelled, so the
            donut lands flush on the left edge of the content well. */}
        <Link
          to="/"
          aria-label="Sugarloop home"
          className="shrink-0 ml-[calc(clamp(1.5rem,5vw,4rem)*-1-4.774rem)] sm:ml-[calc(clamp(1.5rem,5vw,4rem)*-1-7.639rem)]"
        >
          <img
            src={donutMark}
            alt="Sugarloop"
            className="h-[10rem] sm:h-[16rem] w-auto object-contain [object-position:left]"
          />
        </Link>

        <div className="grid grid-cols-1 gap-10 sm:ml-auto sm:grid-cols-2 sm:gap-[clamp(2rem,5vw,4.5rem)]">
          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="m-0 mb-[clamp(1.25rem,3vw,1.75rem)] font-display font-black text-white uppercase text-[1.15rem] tracking-[0.02em]">
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
