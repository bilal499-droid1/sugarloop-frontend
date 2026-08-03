import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import donutImg from '../../assets/a1.webp'
import croissantImg from '../../assets/a5.webp'
import drinkImg from '../../assets/a3.webp'
import sandwichImg from '../../assets/a2.webp'
import { PRODUCTS } from '../products/productsData'

const CATEGORY_ITEMS = [
  { label: 'Donuts', image: donutImg, to: '/products?category=Donuts' },
  { label: 'Croissants', image: croissantImg, to: '/products?category=Croissants' },
  { label: 'Drinks', image: drinkImg, to: '/products?category=Drinks' },
  { label: 'Sandwiches', image: sandwichImg, to: '/products?category=Sandwiches' },
]

// One pick per category, by catalogue id: Chocolate Croissant, Mango, Mocha
// Frappe, Sizzling Fajita. Name and photo are read from PRODUCTS rather than
// duplicated, so a rename or a new photo flows through here on its own; filtered
// so pulling an item from the catalogue drops it here instead of crashing.
const FEATURED_ITEMS = [18, 10, 39, 25]
  .map((id) => PRODUCTS.find((product) => product.id === id))
  .filter(Boolean)
  .map((product) => ({
    label: product.name,
    image: product.image,
    to: `/products/${product.id}`,
  }))

// featured swaps the four category tiles for individual products, each linking to
// its own detail page instead of a filtered listing.
export default function MenuCarousel({ title = 'MENU', featured = false }) {
  const items = featured ? FEATURED_ITEMS : CATEGORY_ITEMS
  const [activeIndex, setActiveIndex] = useState(1) // center card highlighted, matches Figma sample
  const trackRef = useRef(null)

  // Horizontal-only centering: avoids scrollIntoView, which would also move the page vertically
  const centerCard = (i, behavior) => {
    const track = trackRef.current
    const card = track?.children[i]
    if (!track || !card || track.scrollWidth <= track.clientWidth) return
    track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior })
  }

  // Start on the highlighted (second) card in the mobile scroller
  useEffect(() => {
    centerCard(activeIndex, 'auto')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      className="py-[clamp(2.5rem,6vw,4rem)] px-[clamp(1.5rem,5vw,4rem)] bg-white text-center"
      aria-label={title}
    >
      <h2 className="font-display font-bold text-[clamp(1.25rem,2vw,1.5rem)] tracking-[0.02em] m-0 mb-[clamp(1.5rem,4vw,2.5rem)]">
        {title}
      </h2>

      <div
        ref={trackRef}
        className="grid grid-cols-4 gap-[clamp(0.75rem,2vw,1.5rem)] max-w-[1100px] mx-auto max-[720px]:flex max-[720px]:max-w-none max-[720px]:overflow-x-auto max-[720px]:snap-x max-[720px]:snap-mandatory max-[720px]:-mx-[clamp(1.5rem,5vw,4rem)] max-[720px]:px-[clamp(1.5rem,5vw,4rem)] max-[720px]:pb-2 max-[720px]:[scrollbar-width:none] max-[720px]:[&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            className={`group bg-none border-[1.5px] rounded-[14px] p-0 cursor-pointer overflow-hidden flex flex-col font-display no-underline transition-transform duration-300 ease-out hover:scale-105 max-[720px]:flex-none max-[720px]:w-[68vw] max-[720px]:max-w-[260px] max-[720px]:snap-center ${
              i === activeIndex ? 'border-accent' : 'border-transparent'
            }`}
            onClick={() => setActiveIndex(i)}
          >
            {/* Catalogue photos are square, so the tall category ratio would crop the
                product itself; featured keeps them square and uncut. */}
            <img
              src={item.image}
              alt={item.label}
              className={`w-full object-cover bg-[#111] ${
                featured ? 'aspect-square' : 'aspect-[601/888]'
              }`}
            />
            <span className="bg-white text-black font-bold text-[0.85rem] py-[0.6rem] px-3 flex items-center justify-center gap-2">
              {item.label}
              {featured && (
                <span
                  aria-hidden="true"
                  className="w-[1.4rem] h-[1.4rem] shrink-0 rounded-full bg-accent text-white flex items-center justify-center text-[0.6rem] transition-transform duration-300 ease-out group-hover:translate-x-1"
                >
                  <FaArrowRight />
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
