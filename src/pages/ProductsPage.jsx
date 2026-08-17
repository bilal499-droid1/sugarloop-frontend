import { useSearchParams } from 'react-router-dom'
import ProductsHero from '../components/products/ProductsHero'
import ProductGrid from '../components/products/ProductGrid'
import BranchPicker from '../components/products/BranchPicker'
import Footer from '../components/Footer'
import { CATEGORIES } from '../components/products/productsData'
import { useCatalogue } from '../context/CatalogueContext'
import { useBranch } from '../context/BranchContext'

export default function ProductsPage() {
  // Live prices where the API answered, the bundled catalogue where it did not — see
  // CatalogueContext. CATEGORIES stays local because it fixes the TAB ORDER, which is
  // a layout decision for this page rather than something the API gets a vote on.
  const { products } = useCatalogue()
  const { branch, hasBranches } = useBranch()

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

  const visibleProducts = products.filter((p) => p.category === activeCategory)

  return (
    <>
      <ProductsHero
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      {/* Sold-out marking is only meaningful once a branch is named, so the control that
          switches it on sits with the menu it changes rather than buried in the nav.

          The delivery caveat is stated here rather than left implied: this shows one
          branch's stock, but a delivery order is assigned its branch by address at
          checkout, so what is sold out here may not be sold out for that customer. */}
      {hasBranches && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 px-5 lg:pt-10 lg:px-[clamp(2rem,5vw,5.5rem)]">
          <BranchPicker />
          <p className="m-0 font-display text-xs text-text-body">
            {branch
              ? `Showing stock at ${branch.name} — what you'd find collecting there. Delivery orders are matched to a branch by your address at checkout, so availability may differ.`
              : 'Pick a shop to see what’s in stock there today.'}
          </p>
        </div>
      )}

      <ProductGrid
        products={visibleProducts}
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      <Footer />
    </>
  )
}
