import { useEffect, useState } from 'react'
import heroBgDesktop1 from '../../assets/p1.png'
import heroBg2 from '../../assets/pp2.png'
import heroBg3 from '../../assets/pp3.png'
import mobileHeroBg1 from '../../assets/mv1.png'
import mobileHeroBg2 from '../../assets/mv2.png'
import mobileHeroBg3 from '../../assets/mv3.png'
import ShopNav from './ShopNav'

const DESKTOP_SLIDES = [heroBgDesktop1, heroBg2, heroBg3]
const MOBILE_SLIDES = [mobileHeroBg1, mobileHeroBg2, mobileHeroBg3]
const SLIDE_INTERVAL_MS = 5000

export default function ProductsHero({ categories, activeCategory, onSelectCategory }) {
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % DESKTOP_SLIDES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative" aria-label="Products hero">
      <div className="relative overflow-hidden aspect-[393/471] lg:aspect-[1920/827] min-h-[420px] lg:min-h-[600px] flex flex-col pb-8 lg:pb-10">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat block lg:hidden"
          style={{ backgroundImage: `url(${MOBILE_SLIDES[slideIndex]})` }}
        />
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat hidden lg:block"
          style={{ backgroundImage: `url(${DESKTOP_SLIDES[slideIndex]})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.15)_35%,rgba(0,0,0,0.05)_100%)]" />

        <ShopNav />

        <div className="relative z-[2] mt-10 px-5 lg:mt-[clamp(2rem,6vw,5rem)] lg:px-[clamp(2rem,5vw,5.5rem)]">
          <h1 className="m-0 mb-3 font-display font-medium text-[#3d3d3d] tracking-[-0.03em] flex flex-col leading-[1] text-center lg:text-left">
            <span className="text-[1rem] font-normal lg:text-[clamp(2.5rem,4.5vw,4.0625rem)]">
              Have a look at our
            </span>
            <span className="text-[2.25rem] font-bold uppercase text-accent lg:text-[clamp(2.5rem,4.5vw,4.0625rem)] lg:normal-case">
              fresh products
            </span>
          </h1>
          <p className="hidden lg:block lg:max-w-[38rem] lg:mt-6 lg:text-[1.125rem] lg:leading-[1.5] lg:font-semibold lg:text-white">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
          </p>
        </div>
      </div>

      <div
        className="relative z-[2] flex flex-wrap gap-[0.6rem] pt-6 px-5 pb-0 max-w-full lg:flex-col lg:items-start lg:gap-4 lg:p-0 lg:mt-[clamp(-17rem,-21vw,-7rem)] lg:ml-[clamp(2rem,5vw,5.5rem)]"
        role="group"
        aria-label="Filter by category"
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`font-display font-medium text-[0.8rem] rounded-cta-pill py-[0.4rem] px-4 cursor-pointer whitespace-nowrap transition-transform duration-300 ease-out hover:scale-110 lg:text-[1.125rem] lg:py-[0.7rem] lg:px-[1.6rem] ${
              category === activeCategory
                ? 'bg-accent-dark text-white border border-accent-dark lg:bg-accent lg:border-accent'
                : 'bg-white text-accent-dark border border-accent-dark lg:bg-transparent lg:text-accent lg:border-accent'
            }`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  )
}
