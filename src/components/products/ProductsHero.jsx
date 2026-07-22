import './ProductsHero.css'
import heroBgDesktop from '../../assets/p1.png'
import heroBgMobile from '../../assets/p2.png'
import ShopNav from './ShopNav'

export default function ProductsHero({ categories, activeCategory, onSelectCategory }) {
  return (
    <section className="products-hero" aria-label="Products hero">
      <div className="products-hero__photo">
        <div className="products-hero__bg products-hero__bg--mobile" style={{ backgroundImage: `url(${heroBgMobile})` }} />
        <div className="products-hero__bg products-hero__bg--desktop" style={{ backgroundImage: `url(${heroBgDesktop})` }} />
        <div className="products-hero__overlay" />

        <ShopNav />

        <div className="products-hero__content">
          <h1 className="products-hero__heading">
            <span className="products-hero__heading-line">Have a look at our</span>
            <span className="products-hero__heading-accent">fresh products</span>
          </h1>
          <p className="products-hero__body">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
          </p>
        </div>
      </div>

      <div className="products-hero__pills" role="group" aria-label="Filter by category">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`products-hero__pill ${category === activeCategory ? 'products-hero__pill--active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  )
}
