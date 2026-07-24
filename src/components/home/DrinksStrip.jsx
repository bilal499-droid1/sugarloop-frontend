import drinkImg from '../../assets/Rectangle 910.png'

const DRINKS = [1, 2, 3, 4]

export default function DrinksStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 leading-[0]" aria-label="Featured drinks">
      {DRINKS.map((i) => (
        <div className="aspect-[480/1042] overflow-hidden" key={i}>
          <img src={drinkImg} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  )
}
