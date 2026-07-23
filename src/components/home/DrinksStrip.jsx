import './DrinksStrip.css'
import drinkImg from '../../assets/Rectangle 910.png'

const DRINKS = [1, 2, 3, 4]

export default function DrinksStrip() {
  return (
    <div className="drinks-strip" aria-label="Featured drinks">
      {DRINKS.map((i) => (
        <div className="drinks-strip__item" key={i}>
          <img src={drinkImg} alt="" />
        </div>
      ))}
    </div>
  )
}
