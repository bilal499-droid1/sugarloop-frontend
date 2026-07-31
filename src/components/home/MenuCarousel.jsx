import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import donutImg from '../../assets/a1.webp'
import croissantImg from '../../assets/a5.webp'
import drinkImg from '../../assets/a3.webp'
import sandwichImg from '../../assets/a2.webp'

const ITEMS = [
  { label: 'Donuts', image: donutImg },
  { label: 'Croissants', image: croissantImg },
  { label: 'Drinks', image: drinkImg },
  { label: 'Sandwiches', image: sandwichImg },
]

export default function MenuCarousel({ title = 'MENU', linkToCategory = true }) {
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

  const selectItem = (i) => {
    setActiveIndex(i)
    centerCard(i, 'smooth')
  }

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
        {ITEMS.map((item, i) => {
          const cardClass = `bg-none border-[1.5px] rounded-[14px] p-0 cursor-pointer overflow-hidden flex flex-col font-display no-underline transition-transform duration-300 ease-out hover:scale-105 max-[720px]:flex-none max-[720px]:w-[68vw] max-[720px]:max-w-[260px] max-[720px]:snap-center ${
            i === activeIndex ? 'border-accent' : 'border-transparent'
          }`
          const cardContent = (
            <>
              <img
                src={item.image}
                alt={item.label}
                className="w-full aspect-[601/888] object-cover bg-[#111]"
              />
              <span className="bg-white text-black font-bold text-[0.85rem] py-[0.6rem] text-center">
                {item.label}
              </span>
            </>
          )

          // Without linkToCategory the card is a plain selector: it highlights and
          // centers itself but never routes away from the page.
          return linkToCategory ? (
            <Link
              key={i}
              to={`/products?category=${encodeURIComponent(item.label)}`}
              className={cardClass}
              onClick={() => setActiveIndex(i)}
            >
              {cardContent}
            </Link>
          ) : (
            <button key={i} type="button" className={cardClass} onClick={() => selectItem(i)}>
              {cardContent}
            </button>
          )
        })}
      </div>
    </section>
  )
}
