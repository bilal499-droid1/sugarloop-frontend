import { useSearchParams } from 'react-router-dom'
import ProductsHero from '../components/products/ProductsHero'
import ProductGrid from '../components/products/ProductGrid'
import MobileTabBar from '../components/products/MobileTabBar'
import Footer from '../components/Footer'
import { CATEGORIES, PRODUCTS } from '../components/products/productsData'

export default function ProductsPage() {
  // The ?category= param is the single source of truth, so links from the home page
  // (hero buttons, menu cards) land on the right tab even if this page is already mounted.
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCategory = searchParams.get('category')
  const activeCategory = CATEGORIES.includes(requestedCategory)
    ? requestedCategory
    : CATEGORIES[1]

  const setActiveCategory = (category) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('category', category)
        return next
      },
      { replace: true }
    )

  const visibleProducts = PRODUCTS.filter((p) => p.category === activeCategory)

  return (
    <>
      <ProductsHero
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      <ProductGrid
        products={visibleProducts}
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      <Footer />
      <MobileTabBar />
    </>
  )
}
