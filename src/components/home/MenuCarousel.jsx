import { useState } from 'react'
import croissantImg from '../../assets/Rectangle 1025.png'

const ITEMS = [
  { label: 'Croissants', image: croissantImg },
  { label: 'Croissants', image: croissantImg },
  { label: 'Croissants', image: croissantImg },
]

export default function MenuCarousel() {
  const [activeIndex, setActiveIndex] = useState(1) // center card highlighted, matches Figma sample

  return (
    <section
      className="py-[clamp(2.5rem,6vw,4rem)] px-[clamp(1.5rem,5vw,4rem)] bg-white text-center"
      aria-label="Menu"
    >
      <h2 className="font-display font-bold text-[clamp(1.25rem,2vw,1.5rem)] tracking-[0.02em] m-0 mb-[clamp(1.5rem,4vw,2.5rem)]">
        MENU
      </h2>

      <div className="grid grid-cols-3 max-[720px]:grid-cols-1 gap-[clamp(0.75rem,2vw,1.5rem)] max-w-[1100px] max-[720px]:max-w-[320px] mx-auto">
        {ITEMS.map((item, i) => (
          <button
            key={i}
            className={`bg-none border-2 rounded-[14px] p-0 cursor-pointer overflow-hidden flex flex-col font-display transition-transform duration-300 ease-out hover:scale-105 ${
              i === activeIndex ? 'border-accent' : 'border-transparent'
            }`}
            onClick={() => setActiveIndex(i)}
            type="button"
          >
            <img
              src={item.image}
              alt={item.label}
              className="w-full aspect-[601/888] object-cover bg-[#111]"
            />
            <span className="bg-white text-black font-bold text-[0.85rem] py-[0.6rem] text-center">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-[clamp(1.25rem,3vw,2rem)]" role="tablist" aria-label="Menu items">
        {ITEMS.map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full border-none cursor-pointer p-0 ${
              i === activeIndex ? 'bg-accent' : 'bg-[#d9d9d9]'
            }`}
            onClick={() => setActiveIndex(i)}
            aria-label={`Show item ${i + 1}`}
            aria-selected={i === activeIndex}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </section>
  )
}
