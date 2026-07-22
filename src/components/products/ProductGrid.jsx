import './ProductGrid.css'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, categories, activeCategory, onSelectCategory }) {
  const mainProducts = products.filter((p) => p.size !== 'wide')
  const wideProducts = products.filter((p) => p.size === 'wide')

  return (
    <section className="product-grid-section" aria-label="Product listing">
      <aside className="product-grid-section__sidebar" aria-label="Filter by category">
        <ul>
          {categories.map((category) => (
            <li key={category}>
              <button
                type="button"
                className={category === activeCategory ? 'is-active' : ''}
                onClick={() => onSelectCategory(category)}
              >
                <span className="product-grid-section__sidebar-swatch" />
                {category}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="product-grid-section__main">
        <div className="product-grid">
          {mainProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {wideProducts.length > 0 && (
          <div className="product-grid__wide-row">
            {wideProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
