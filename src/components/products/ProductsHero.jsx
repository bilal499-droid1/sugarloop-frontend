import desktopHeroBg from '../../assets/zz.webp'
// BM.png is 1639x1959 (0.837), cut to match the mobile hero's 393/471 slot, so
// bg-cover shows it whole with the baked-in MENU centred.
import mobileHeroBg from '../../assets/BM.webp'
import ShopNav from './ShopNav'

export default function ProductsHero({ categories, activeCategory, onSelectCategory }) {
  return (
    <section className="relative" aria-label="Products hero">
      <div className="relative overflow-hidden aspect-[393/471] lg:aspect-[1920/827] min-h-[420px] lg:min-h-[600px] flex flex-col pb-8 lg:pb-10">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat block lg:hidden"
          style={{ backgroundImage: `url(${mobileHeroBg})` }}
        />
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat hidden lg:block"
          style={{ backgroundImage: `url(${desktopHeroBg})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.15)_35%,rgba(0,0,0,0.05)_100%)]" />

        <ShopNav onImage />

        <div className="relative z-[2] mt-10 px-5 lg:mt-[clamp(2rem,6vw,5rem)] lg:px-[clamp(2rem,5vw,5.5rem)]">
          {/* Both backgrounds (BM.png on mobile, zz.png past lg) have MENU baked
              in, so the live heading stays screen-reader-only rather than
              printing the word twice. */}
          <h1 className="sr-only">MENU</h1>
        </div>
      </div>

      {/* Below lg only: past lg the ProductGrid sidebar owns category filtering, so
          these would just duplicate it on top of the hero photo. */}
      <div
        className="relative z-[2] flex lg:hidden flex-nowrap items-center gap-[1.7vw] sm:gap-[0.6rem] pt-6 px-5 pb-0 max-w-full"
        role="group"
        aria-label="Filter by category"
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`shrink-0 font-display font-medium rounded-cta-pill cursor-pointer whitespace-nowrap transition-transform duration-300 ease-out hover:scale-110 text-[3.3vw] py-[1.5vw] px-[2.6vw] sm:text-[0.8rem] sm:py-[0.4rem] sm:px-4 ${
              category === activeCategory
                ? 'bg-accent text-white border border-accent'
                : 'bg-white text-accent border border-accent'
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
