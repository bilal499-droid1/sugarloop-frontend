import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaStar, FaRegStar } from 'react-icons/fa'
import ShopNav from '../components/products/ShopNav'
import ProductCard from '../components/products/ProductCard'
import Accordion from '../components/productDetail/Accordion'
import Footer from '../components/Footer'
import { PRODUCTS } from '../components/products/productsData'
import { useCart } from '../context/CartContext'
import './ProductDetailPage.css'

function Stars({ rating }) {
  return (
    <span className="product-detail__stars">
      {Array.from({ length: 5 }, (_, i) =>
        i < rating ? <FaStar key={i} /> : <FaRegStar key={i} />
      )}
    </span>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = PRODUCTS.find((p) => String(p.id) === id)
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()

  if (!product) {
    return (
      <>
        <ShopNav />
        <div className="product-detail__not-found">
          <p>We couldn't find that product.</p>
          <Link to="/products">Back to products</Link>
        </div>
        <Footer />
      </>
    )
  }

  const related = PRODUCTS.filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map((p) => ({ ...p, size: 'sm' }))

  const handleAddToCart = () => {
    addItem(product, qty)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <>
      <ShopNav />

      <section className="product-detail" aria-label="Product detail">
        <div className="product-detail__media">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-detail__info">
          <h1 className="product-detail__name">{product.name}</h1>

          <div className="product-detail__qty">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
              &minus;
            </button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
              +
            </button>
          </div>

          <button type="button" className="product-detail__add-btn" onClick={handleAddToCart}>
            {justAdded ? 'Added to cart ✓' : 'Add to cart'}
            <span className="product-detail__add-btn-dot" />
            Rs {product.price * qty}
          </button>

          <button type="button" className="product-detail__checkout-btn" onClick={handleAddToCart}>
            Proceed to checkout
          </button>

          <div className="product-detail__accordions">
            <Accordion title="Description">
              <p>{product.description}</p>
            </Accordion>
            <Accordion title="Special instructions">
              <p>Any allergies or special requests? Let us know and we'll do our best to accommodate.</p>
            </Accordion>
            <Accordion title="Reviews" defaultOpen>
              {product.reviews.map((review) => (
                <div className="product-detail__review" key={review.name}>
                  <p className="product-detail__review-name">{review.name}</p>
                  <Stars rating={review.rating} />
                  <p className="product-detail__review-text">{review.text}</p>
                </div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="product-detail__related" aria-label="People also buy">
        <h2>People also buy</h2>
        <div className="product-detail__related-grid">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}
