import drinkVideo1 from '../../assets/pm1.mp4'
import drinkVideo2 from '../../assets/pm2.mp4'
import drinkVideo3 from '../../assets/pm3.mp4'
import drinkVideo4 from '../../assets/pm5.mp4'

// onMobile: below sm the grid is 2 columns, so only these two show and the strip
// stays a single row. All four appear from sm up.
const DRINKS = [
  { src: drinkVideo1, onMobile: false },
  { src: drinkVideo2, onMobile: true },
  { src: drinkVideo3, onMobile: false },
  { src: drinkVideo4, onMobile: true },
]

export default function DrinksStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 leading-[0]" aria-label="Featured drinks">
      {DRINKS.map((drink, i) => (
        <div
          className={`aspect-[480/1042] overflow-hidden ${drink.onMobile ? '' : 'hidden sm:block'}`}
          key={i}
        >
          {/* muted + playsInline are what allow autoplay on mobile Safari and Chrome */}
          <video
            src={drink.src}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  )
}
