import { Link, useSearchParams } from 'react-router-dom'
import ProductsHero from '../components/products/ProductsHero'
import ProductGrid from '../components/products/ProductGrid'
import BranchPicker from '../components/products/BranchPicker'
import Footer from '../components/Footer'
import { CATEGORIES } from '../components/products/productsData'
import { useCatalogue } from '../context/CatalogueContext'
import { useBranch } from '../context/BranchContext'
import { shortBranchName } from '../lib/branches'

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
  // Falls back to the FIRST tab, which is what a visitor arriving with no ?category=
  // sees. This tracks the array rather than naming Donuts, so reordering the tabs
  // moves the default with them instead of leaving it pointing at a moved category.
  const activeCategory = CATEGORIES.includes(requestedCategory)
    ? requestedCategory
    : CATEGORIES[0]

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
        <section
          aria-label="Stock availability"
          className="pt-6 px-5 lg:pt-10 lg:px-[clamp(2rem,5vw,5.5rem)]"
        >
          <div className="rounded-card-inner border border-border-light bg-bg-section px-5 py-4 lg:px-6 lg:py-5">
            <h2 className="m-0 mb-3 font-display font-bold text-base text-black lg:text-lg">
              Checking stock at
            </h2>

            <BranchPicker variant="pills" />

            {/* One line, always in the same place. The old copy swapped between two
                sentences of different lengths, so choosing a shop reflowed the row it
                sat in — and the selected-branch version ran to three clauses that
                nobody finishes reading. */}
            <p className="mt-3 mb-0 font-display text-xs leading-relaxed text-text-body lg:text-sm">
              {branch
                ? `Showing what you'd find collecting from ${shortBranchName(branch.name)}.`
                : 'Choose a shop to see what’s available there today.'}{' '}
              <span className="text-text-body/75">
                Delivery orders are matched to a branch by your address at checkout, so
                availability may differ.
              </span>
            </p>
          </div>
        </section>
      )}

      {/* Outside the branch panel on purpose: the box builder works with or without a
          branch chosen, so its entry point should not vanish when the branch list fails
          to load. When a branch IS chosen it still carries through — the builder reads
          the same selection. Its own section rather than a row in the panel, because the
          pills there are a single choose-one group and a link among them would read as a
          fifth shop. */}
      <section
        aria-label="Build your own box"
        className="pt-6 px-5 lg:pt-10 lg:px-[clamp(2rem,5vw,5.5rem)]"
      >
        <Link
          to="/build-your-box"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-cta-pill bg-accent text-white no-underline font-display font-bold text-sm transition-transform duration-300 ease-out hover:scale-105"
        >
          Build your own box
          <span aria-hidden="true">→</span>
        </Link>
      </section>

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
