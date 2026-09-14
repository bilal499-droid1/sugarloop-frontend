import { Link } from 'react-router-dom'

/**
 * The menu categories, as a row of pills linking into the shop.
 *
 * These used to sit inside the hero, over the photograph. They moved down to the top of
 * Featured Products, which meant they also had to change colour: white-on-transparent is
 * only legible against the hero image, and on the white section below it the row would
 * have been a row of invisible outlines.
 *
 * So the accent blue, matching the pill vocabulary the menu page and the branch picker
 * already use — same `rounded-full`, same hover scale, same weight.
 */
// Same order as the menu page's tabs and the carousel directly below this row —
// the three disagreed, and two of them were on this very page.
const CATEGORIES = ['Donuts', 'Brownies', 'Croissants', 'Drinks', 'Sandwiches']

// Below sm the label and padding are in vw so the row stays on one line as far down as
// it can; from sm up they settle at a fixed size. Carried over from the hero, where the
// same constraint applied.
//
// The budget is tight and worth knowing before touching these numbers: the section
// around this row adds 1.5rem of padding each side, which on a 320px phone leaves about
// 85vw of usable width. Four pills fitted that; BROWNIES is the fifth and does not, so
// the row is flex-WRAP now rather than flex-nowrap. A nowrap row does not wrap when it
// overflows — it puts a horizontal scrollbar on the whole page, on every page this row
// appears on. Wrapping drops the last pill to a centred second line on the narrowest
// phones instead, and still holds one line everywhere else. CROISSANTS and SANDWICHES
// are the ten-character words that decide the limit.
//
// The enlargement therefore went into the type and the HEIGHT only. Horizontal padding
// and the gap were left alone deliberately: those multiply across every pill and every
// gap, so widening them spends the remaining room far faster than the font does.
const pillClass =
  'inline-block shrink-0 bg-transparent text-accent border border-accent rounded-full font-display font-bold cursor-pointer whitespace-nowrap no-underline transition-all duration-300 ease-out hover:scale-110 hover:bg-accent hover:text-white text-[2.9vw] py-[1.2vw] px-[1.7vw] sm:text-nav-link sm:py-[0.25rem] sm:px-[1.15rem]'

export default function CategoryPills({ className = '' }) {
  return (
    <nav
      aria-label="Shop by category"
      className={`flex flex-wrap items-center justify-center gap-[1.3vw] gap-y-[2vw] sm:gap-[clamp(0.75rem,2vw,1.5rem)] ${className}`}
    >
      {CATEGORIES.map((category) => (
        <Link
          key={category}
          to={`/products?category=${encodeURIComponent(category)}`}
          className={pillClass}
        >
          {category.toUpperCase()}
        </Link>
      ))}
    </nav>
  )
}
