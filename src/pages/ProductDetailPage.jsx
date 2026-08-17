import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ShopNav from '../components/products/ShopNav'
import ProductCard from '../components/products/ProductCard'
import Accordion from '../components/productDetail/Accordion'
import ProductGallery from '../components/productDetail/ProductGallery'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useCatalogue } from '../context/CatalogueContext'
import { useBranch } from '../context/BranchContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  // Products keep their legacy numeric id through the merge, so every /products/:id
  // URL that already exists still resolves once the API is the source.
  const { products, findById } = useCatalogue()
  const { branch } = useBranch()
  const product = findById(id)
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()

  if (!product) {
    return (
      <>
        <ShopNav />
        <div className="py-16 px-5 text-center font-display">
          <p>We couldn't find that product.</p>
          <Link to="/products">Back to products</Link>
        </div>
        <Footer />
      </>
    )
  }

  const related = products.filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map((p) => ({ ...p, size: 'sm' }))

  // Absent means no branch was named, so availability is unknown — only an explicit
  // false is a sold-out product. See BranchContext.
  const soldOut = product.inStock === false

  const handleAddToCart = () => {
    addItem(product, qty)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  const handleCheckout = () => {
    addItem(product, qty)
    navigate('/cart')
  }

  return (
    <>
      <ShopNav />

      <section
        className="flex flex-col gap-6 pt-6 px-5 pb-8 lg:flex-row lg:gap-16 lg:pt-12 lg:px-[clamp(2rem,5vw,5.5rem)] lg:pb-16"
        aria-label="Product detail"
      >
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div className="flex flex-col lg:flex-1 lg:max-w-[520px]">
          <h1 className="mb-4 mt-0 font-display font-bold text-2xl text-black uppercase lg:text-[2rem]">
            {product.name}
          </h1>

          <div className="flex items-center border border-border-light mb-3">
            <button
              type="button"
              className="flex-[0_0_3rem] h-12 bg-[#f2f2f2] border-none text-[1.1rem] cursor-pointer"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <span className="flex-1 text-center font-display font-medium">{qty}</span>
            <button
              type="button"
              className="flex-[0_0_3rem] h-12 bg-[#f2f2f2] border-none text-[1.1rem] cursor-pointer"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {soldOut ? (
            /* Both buttons replaced rather than disabled: the server refuses a sold-out
               item at quote time, so letting it into the cart only moves the bad news to
               checkout. Naming the branch matters — it is sold out HERE, and switching
               branch may well fix it. */
            <div className="w-full mb-3 px-4 py-3 rounded-[4px] bg-[#f4f4f4] border border-border-light lg:max-w-[420px]">
              <p className="m-0 font-display font-bold text-[0.95rem] text-[#c0392b]">
                Sold out{branch ? ` at ${branch.name}` : ''}
              </p>
              {/* The second line matters more than the first: this is only sold out at
                  the shop being previewed. A delivery order is matched to a branch by
                  address, so this customer may well be served by one that has it — and
                  a flat "sold out" would talk them out of an order we could fill. */}
              <p className="m-0 mt-1 font-display text-xs text-text-body">
                That’s stock at this shop. Try another above — and if you’re ordering
                delivery, your branch is set by your address, so this may still reach you.
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="w-full h-12 border-none rounded-[4px] font-display font-bold text-[0.95rem] cursor-pointer flex items-center justify-center gap-2 mb-3 bg-accent text-white lg:max-w-[420px]"
                onClick={handleAddToCart}
              >
                {justAdded ? 'Added to cart ✓' : 'Add to cart'}
                <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                Rs {product.price * qty}
              </button>

              <button
                type="button"
                className="w-full h-12 border-none rounded-[4px] font-display font-bold text-[0.95rem] cursor-pointer flex items-center justify-center gap-2 mb-3 bg-[#2a2a2a] text-white lg:max-w-[420px]"
                onClick={handleCheckout}
              >
                Proceed to checkout
              </button>
            </>
          )}

          <div className="mt-4">
            <Accordion title="Description">
              <p>{product.description}</p>
            </Accordion>
            <Accordion title="Special instructions">
              <p>Any allergies or special requests? Let us know and we'll do our best to accommodate.</p>
            </Accordion>
          </div>
        </div>
      </section>

      <section
        className="pt-4 px-5 pb-12 lg:pt-8 lg:px-[clamp(2rem,5vw,5.5rem)] lg:pb-20"
        aria-label="People also buy"
      >
        <h2 className="font-display font-bold text-xl mb-5 mt-0">People also buy</h2>
        <div className="grid grid-cols-2 gap-[0.85rem] lg:grid-cols-4 lg:gap-6">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}
