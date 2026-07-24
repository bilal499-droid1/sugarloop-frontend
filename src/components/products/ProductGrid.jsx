import ProductCard from './ProductCard'

export default function ProductGrid({ products, categories, activeCategory, onSelectCategory }) {
  const mainProducts = products.filter((p) => p.size !== 'wide')
  const wideProducts = products.filter((p) => p.size === 'wide')

  return (
    <section
      className="flex gap-6 pt-8 px-5 pb-12 lg:gap-12 lg:pt-16 lg:px-[clamp(2rem,5vw,5.5rem)] lg:pb-20"
      aria-label="Product listing"
    >
      <aside
        className="hidden lg:block lg:w-[180px] lg:shrink-0 lg:border-r lg:border-border-light"
        aria-label="Filter by category"
      >
        <ul className="list-none m-0 p-0 flex flex-col gap-7">
          {categories.map((category) => {
            const isActive = category === activeCategory
            return (
              <li key={category}>
                <button
                  type="button"
                  className={`flex items-center gap-[0.6rem] bg-none border-none cursor-pointer p-0 font-display font-medium text-xl origin-left transition-transform duration-300 ease-out hover:scale-110 ${
                    isActive ? 'text-black' : 'text-muted-text'
                  }`}
                  onClick={() => onSelectCategory(category)}
                >
                  <span
                    className={`w-[15px] h-[14px] rounded-[2px] shrink-0 ${
                      isActive ? 'bg-accent' : 'bg-muted-text'
                    }`}
                  />
                  {category}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-2 gap-[0.85rem] lg:grid-cols-4 lg:grid-flow-row-dense lg:gap-5">
          {mainProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {wideProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-[0.85rem] mt-[0.85rem] lg:grid-cols-3 lg:gap-5 lg:mt-5">
            {wideProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
