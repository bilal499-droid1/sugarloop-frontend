import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const isLg = product.size === 'lg'

  return (
    <Link
      to={`/products/${product.id}`}
      className={`flex flex-col no-underline text-inherit ${isLg ? 'lg:col-span-2 lg:row-span-2' : ''}`}
    >
      <div
        className={`relative border border-border-light rounded-[6px] overflow-hidden ${
          isLg ? 'aspect-[677/668]' : 'aspect-square'
        }`}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full bg-[linear-gradient(135deg,#eef1f4_0%,#e3e8ec_100%)]"
            aria-hidden="true"
          />
        )}
        <span
          className={`absolute top-2 right-2 w-[2.3rem] h-[2.3rem] rounded-full bg-accent text-white flex items-center justify-center gap-px shadow-[0_2px_6px_rgba(0,0,0,0.2)] ${
            isLg ? 'lg:w-14 lg:h-14 lg:top-4 lg:right-4' : ''
          }`}
        >
          <span className={`font-price italic font-semibold text-[0.5rem] ${isLg ? 'lg:text-xs' : ''}`}>
            Rs
          </span>
          <span className={`font-price font-bold text-[0.85rem] ${isLg ? 'lg:text-[1.375rem]' : ''}`}>
            {product.price}
          </span>
        </span>
      </div>
      <p
        className={`mt-2 mb-0 font-display font-bold text-[0.75rem] text-center text-black ${
          isLg ? 'lg:text-[1.375rem] lg:mt-[0.85rem]' : 'lg:text-base lg:mt-3'
        }`}
      >
        {product.name}
      </p>
    </Link>
  )
}
