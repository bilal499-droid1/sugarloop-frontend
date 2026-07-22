export default function ProductCard({ product }) {
  return (
    <article className={`product-card product-card--${product.size}`}>
      <div className="product-card__media">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-card__image" />
        ) : (
          <div className="product-card__placeholder" aria-hidden="true" />
        )}
        <span className="product-card__badge">
          <span className="product-card__badge-currency">Rs</span>
          <span className="product-card__badge-price">{product.price}</span>
        </span>
      </div>
      <p className="product-card__name">{product.name}</p>
    </article>
  )
}
