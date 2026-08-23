import { Link } from 'react-router-dom'

/**
 * The four menu categories, as a row of pills linking into the shop.
 *
 * These used to sit inside the hero, over the photograph. They moved down to the top of
 * Featured Products, which meant they also had to change colour: white-on-transparent is
 * only legible against the hero image, and on the white section below it the row would
 * have been four invisible outlines.
 *
 * So the accent blue, matching the pill vocabulary the menu page and the branch picker
 * already use — same `rounded-full`, same hover scale, same weight.
 */
const CATEGORIES = ['Croissants', 'Donuts', 'Drinks', 'Sandwiches']

// Below sm the label and padding are in vw so all four stay on one line down to the
// narrowest phones; from sm up they settle at a fixed size. Carried over from the hero,
// where the same constraint applied.
const pillClass =
  'inline-block shrink-0 bg-transparent text-accent border border-accent rounded-full font-display font-bold cursor-pointer whitespace-nowrap no-underline transition-all duration-300 ease-out hover:scale-110 hover:bg-accent hover:text-white text-[2.6vw] py-[1vw] px-[1.7vw] sm:text-nav-link sm:py-[0.25rem] sm:px-[1.15rem]'

export default function CategoryPills({ className = '' }) {
  return (
    <nav
      aria-label="Shop by category"
      className={`flex flex-nowrap items-center justify-center gap-[1.3vw] sm:gap-[clamp(0.75rem,2vw,1.5rem)] ${className}`}
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
