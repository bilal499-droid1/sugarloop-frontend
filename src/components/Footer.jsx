import { Link } from 'react-router-dom'
import donutMark from '../assets/logs.svg'

// Column layout mirrors the reference footer (assets/fkk.png), minus the
// newsletter block, brand wordmark and copyright bar. Logo and link columns are
// both left-aligned on the brand-blue panel.
const COLUMNS = [
  {
    heading: 'KEEP IN TOUCH',
    links: [
      { label: '051-111-557-799', href: 'tel:051111557799' },
      // `to` so the router handles it: a plain anchor reloads the whole app, and
      // ScrollToTop only sees the hash on a client-side navigation.
      { label: 'Our Locations', to: '/faq#locations' },
      { label: 'Instagram', href: '#' },
      { label: 'LinkedIn', href: '#' },
    ],
  },
  {
    heading: 'LEARN MORE',
    links: [
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
]

// Full white rather than white/85: the footer panel is now the lighter brand blue,
// and dimmed white on it falls below a readable contrast ratio.
const linkClass =
  'text-white no-underline text-[1rem] transition-opacity duration-200 hover:opacity-80'

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
  // id="contact" is the hero nav's Contact target: the KEEP IN TOUCH column below
  // is the only contact detail on the site, so the link lands on the footer itself.
  // overflow-x-hidden is load-bearing now the logo hangs off the RIGHT edge. A
  // negative left margin overflows towards x<0, which browsers never give a
  // scrollbar for; a negative right margin overflows past the viewport width,
  // which they do - and that would put a horizontal scrollbar on every page,
  // since the footer is on all of them.
  return (
    <footer
      id="contact"
      className="bg-accent overflow-x-hidden py-[clamp(2.5rem,6vw,4rem)] px-[clamp(1.5rem,5vw,4rem)]"
      aria-label="Footer"
    >
      {/* The link columns hold the left edge and the logo is pushed to the opposite
          end of the row. The columns keep their own left-aligned text so the two
          headings and their lists still line up with each other. */}
      <div className="max-w-[1200px] mx-auto flex flex-col items-start gap-10 text-left sm:flex-row sm:items-start sm:justify-between sm:gap-[clamp(2rem,5vw,4rem)]">
        <div className="grid grid-cols-1 gap-10 sm:mr-auto sm:grid-cols-2 sm:gap-[clamp(2rem,5vw,4.5rem)]">
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

        {/* logs.svg's art sits at x 137.5-285.6 of a 432x288 viewBox, so 33.89% of
            the rendered width is empty gutter on the right. Because w-auto ties the
            width to the height (432/288 = 1.5x), that gutter is a fixed 0.5083 of
            the height - 5.083rem at h-10rem, 8.133rem at sm's h-16rem. Pulling it
            back puts the donut itself, not the file edge, on the right margin, and
            cancelling the footer's right padding lands it flush on the right edge of
            the content well. object-position moves across with it, or object-contain
            would park the art against the wrong side of its box.
            ml adds 15% of that same margin on the left. The value it scales is
            negative, so the 15% is negative too and the donut shifts left, away
            from the very edge, rather than being pushed further out.
            The trailing +140px on mr makes that margin 140px less negative, which
            walks the whole logo 140px further left off the right edge.
            mt pulls it 30px up. items-start on the row means the logo hangs from
            the top, so a negative top margin moves it without dragging the link
            columns along. */}
        <Link
          to="/"
          aria-label="Sugarloop home"
          className="shrink-0 mt-[-30px] ml-[-4.774rem] sm:ml-[calc((clamp(1.5rem,5vw,4rem)*-1-8.133rem)*0.15)] sm:mr-[calc(clamp(1.5rem,5vw,4rem)*-1-8.133rem+140px)]"
        >
          <img
            src={donutMark}
            alt="Sugarloop"
            className="h-[10rem] sm:h-[16rem] w-auto object-contain [object-position:right]"
          />
        </Link>
      </div>
    </footer>
  )
}
