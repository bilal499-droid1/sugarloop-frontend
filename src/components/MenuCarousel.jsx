import { useState } from 'react'
import './MenuCarousel.css'
import donutsLeft from '../assets/Group 130.png'
import croissants from '../assets/Group 131.png'
import donutsRight from '../assets/Group 132.png'

// Label + "View" button are baked into each image already.
const ITEMS = [
  { label: 'Donuts', image: donutsLeft },
  { label: 'Croissants', image: croissants },
  { label: 'Donuts', image: donutsRight },
]

export default function MenuCarousel() {
  const [activeIndex, setActiveIndex] = useState(1) // center card highlighted, matches Figma sample

  return (
    <section className="menu-carousel" aria-label="Menu">
      <h2 className="menu-carousel__heading">MENU</h2>

      <div className="menu-carousel__track">
        {ITEMS.map((item, i) => (
          <button
            key={i}
            className={`menu-carousel__card ${i === activeIndex ? 'menu-carousel__card--active' : ''}`}
            onClick={() => setActiveIndex(i)}
            type="button"
          >
            <img src={item.image} alt={item.label} className="menu-carousel__image" />
          </button>
        ))}
      </div>
    </section>
  )
}
