import { Link } from 'react-router-dom'
import { FaShoppingCart, FaTrash } from 'react-icons/fa'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'

function QtyStepper({ qty, onChange }) {
  return (
    <div className="flex items-center border border-border-light rounded-[4px] h-9 w-[6.5rem] shrink-0">
      <button
        type="button"
        className="flex-[0_0_2.2rem] h-full bg-[#f2f2f2] border-none text-[1rem] cursor-pointer"
        onClick={() => onChange(qty - 1)}
        aria-label="Decrease quantity"
      >
        &minus;
      </button>
      <span className="flex-1 text-center font-display font-medium text-sm">{qty}</span>
      <button
        type="button"
        className="flex-[0_0_2.2rem] h-full bg-[#f2f2f2] border-none text-[1rem] cursor-pointer"
        onClick={() => onChange(qty + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

function CartRow({ item, onSetQty, onRemove }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border-light last:border-b-0">
      <div className="w-16 h-16 shrink-0 rounded-[6px] overflow-hidden border border-border-light">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full block bg-[linear-gradient(135deg,#eef1f4_0%,#e3e8ec_100%)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="m-0 font-display font-bold text-sm text-black truncate">{item.name}</p>
        <p className="mt-1 mb-0 font-price text-xs text-text-body">Rs {item.price} each</p>
      </div>

      <QtyStepper qty={item.qty} onChange={(qty) => onSetQty(item.id, qty)} />

      <p className="w-16 shrink-0 text-right font-price font-bold text-sm text-accent">
        Rs {item.price * item.qty}
      </p>

      <button
        type="button"
        className="shrink-0 bg-none border-none text-[#b0b0b0] text-base cursor-pointer p-1 hover:text-accent"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name} from cart`}
      >
        <FaTrash />
      </button>
    </div>
  )
}

export default function CartPage() {
  const { items, setQty, removeItem, clear, subtotal, count } = useCart()

  return (
    <>
      <ShopNav />

      <section
        className="max-w-[860px] mx-auto pt-6 px-5 pb-16 lg:pt-12 lg:px-0"
        aria-label="Your cart"
      >
        <h1 className="mb-6 mt-0 font-display font-bold text-2xl text-accent lg:text-3xl">
          Your cart
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="text-4xl text-muted-text" aria-hidden="true">
              <FaShoppingCart />
            </span>
            <p className="m-0 font-display font-bold text-black">Your cart is empty</p>
            <Link
              to="/products"
              className="inline-block mt-2 h-11 px-6 leading-[2.75rem] bg-accent text-white no-underline rounded-lg font-display font-bold text-sm"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-[#ececec] px-4 lg:px-6">
              {items.map((item) => (
                <CartRow key={item.id} item={item} onSetQty={setQty} onRemove={removeItem} />
              ))}
            </div>

            <button
              type="button"
              className="mt-3 bg-none border-none text-xs text-text-body underline cursor-pointer p-0"
              onClick={clear}
            >
              Clear cart
            </button>

            <div className="mt-6 bg-white rounded-2xl border border-[#ececec] p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="m-0 font-display text-sm text-text-body">
                  Subtotal ({count} {count === 1 ? 'item' : 'items'})
                </p>
                <p className="m-0 font-price font-bold text-lg text-accent">Rs {subtotal}</p>
              </div>

              {/* There's no payment backend yet, so checkout is a phone order rather
                  than a fake "Pay now" button that would go nowhere. */}
              <p className="mt-4 mb-3 text-xs text-text-body">
                Ready to order? Give us a call and we'll take it from here.
              </p>
              <a
                href="tel:051111557799"
                className="block w-full text-center h-12 leading-[3rem] bg-accent text-white no-underline rounded-lg font-display font-bold text-sm"
              >
                Call 051-111-557-799 to order
              </a>
            </div>
          </>
        )}
      </section>

      <Footer />
    </>
  )
}
