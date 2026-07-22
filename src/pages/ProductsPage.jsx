import { useState } from 'react'
import ProductsHero from '../components/products/ProductsHero'
import ProductGrid from '../components/products/ProductGrid'
import MobileTabBar from '../components/products/MobileTabBar'
import Footer from '../components/Footer'
import { CATEGORIES, PRODUCTS } from '../components/products/productsData'

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[1])

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
