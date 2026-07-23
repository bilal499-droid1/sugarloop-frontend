import { useState } from 'react'
import './MenuCarousel.css'
import croissantImg from '../../assets/Rectangle 1025.png'

const ITEMS = [
  { label: 'Croissants', image: croissantImg },
  { label: 'Croissants', image: croissantImg },
  { label: 'Croissants', image: croissantImg },
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
            <span className="menu-carousel__label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="menu-carousel__dots" role="tablist" aria-label="Menu items">
        {ITEMS.map((_, i) => (
          <button
            key={i}
            className={`menu-carousel__dot ${i === activeIndex ? 'menu-carousel__dot--active' : ''}`}
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
