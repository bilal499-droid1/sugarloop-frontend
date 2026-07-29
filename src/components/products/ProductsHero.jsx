import desktopHeroBg from '../../assets/zz.png'
import mobileHeroBg from '../../assets/mv2.png'
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

        <ShopNav />

        <div className="relative z-[2] mt-10 px-5 lg:mt-[clamp(2rem,6vw,5rem)] lg:px-[clamp(2rem,5vw,5.5rem)]">
          {/* zz.png has MENU baked in, so past lg the live heading drops to
              screen-reader-only rather than printing the word twice. */}
          <h1 className="m-0 font-display font-black uppercase text-white tracking-[-0.03em] leading-[1] text-center text-[2.25rem] [-webkit-text-stroke:1px_#fff] lg:sr-only">
            MENU
          </h1>
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
