import ProductCard from '../products/ProductCard'
import { PRODUCTS } from '../products/productsData'

// One pick per category, by catalogue id: Chocolate Croissant, Mango, Mocha
// Frappe, Sizzling Fajita. Everything shown is read from PRODUCTS rather than
// duplicated, so a rename, a new photo or a price change flows through here on its
// own; filtered so pulling an item from the catalogue drops it here instead of
// crashing.
const FEATURED_IDS = [18, 10, 39, 25]

export default function FeaturedProducts({ title = 'Featured Products' }) {
  // Forced to 'sm' so a catalogue item flagged as the large tile doesn't span two
  // columns and break this row of four.
  const items = FEATURED_IDS.map((id) => PRODUCTS.find((product) => product.id === id))
    .filter(Boolean)
    .map((product) => ({ ...product, size: 'sm' }))

  return (
    <section
      className="py-[clamp(2.5rem,6vw,4rem)] px-[clamp(1.5rem,5vw,4rem)] bg-white text-center"
      aria-label={title}
    >
      <h2 className="font-display font-bold text-[clamp(1.25rem,2vw,1.5rem)] tracking-[0.02em] m-0 mb-[clamp(1.5rem,4vw,2.5rem)]">
        {title}
      </h2>

      {/* Same tile shape and grid as the products listing; the tiles link to that
          listing rather than to each product's own page. */}
      <div className="grid grid-cols-2 gap-[0.85rem] max-w-[1100px] mx-auto lg:grid-cols-4 lg:gap-5">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} to="/products" showAddToCart />
        ))}
      </div>
    </section>
  )
}
