import { Link } from 'react-router-dom'
import { FaShoppingCart, FaTrash } from 'react-icons/fa'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'

function QtyStepper({ qty, onChange, className = '' }) {
  return (
    <div
      className={`flex items-center border border-border-light rounded-[4px] h-9 w-[6.5rem] shrink-0 ${className}`}
    >
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

/**
 * One line of the cart.
 *
 * Wraps onto two lines below `sm`, and it has to. Every element except the name is
 * `shrink-0`, so on a 375px phone the five of them plus their gaps need 320px inside a
 * 303px card — the row overflowed, and because the line total was a fixed `w-16` box
 * with `text-right`, text longer than 64px spilled out of its own left edge and straight
 * through the stepper next to it. "Rs 12996" is eight characters; four digits is an
 * ordinary cart.
 *
 * So the stepper and the total drop to a line of their own on a phone, and the total is
 * sized by its content rather than pinned to a width that a real number outgrows.
 *
 * `sm:contents` dissolves that grouping wrapper above the breakpoint, so the two land
 * back in the row as direct flex children rather than being rendered twice. The explicit
 * `order` classes are what let one DOM produce both arrangements — without them the
 * ungrouped children default to `order: 0` and jump ahead of everything on desktop.
 */
function CartRow({ item, onSetQty, onRemove }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3 py-4 border-b border-border-light last:border-b-0 sm:flex-nowrap sm:gap-4">
      <div className="order-1 w-14 h-14 shrink-0 rounded-[6px] overflow-hidden border border-border-light sm:w-16 sm:h-16">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full block bg-[linear-gradient(135deg,#eef1f4_0%,#e3e8ec_100%)]" />
        )}
      </div>

      <div className="order-2 flex-1 min-w-0">
        <p className="m-0 font-display font-bold text-sm text-black truncate">{item.name}</p>
        <p className="mt-1 mb-0 font-price text-xs text-text-body">Rs {item.price} each</p>
      </div>

      <button
        type="button"
        className="order-3 shrink-0 bg-none border-none text-[#b0b0b0] text-base cursor-pointer p-1 hover:text-accent sm:order-5"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name} from cart`}
      >
        <FaTrash />
      </button>

      <div className="order-4 flex w-full items-center gap-3 sm:contents">
        <QtyStepper
          qty={item.qty}
          onChange={(qty) => onSetQty(item.id, qty)}
          className="sm:order-3"
        />
        {/* `ml-auto` pins it to the right of its own line on a phone; on desktop the
            wrapper is gone, so it sits inline and the margin has to go with it. */}
        <p className="order-4 ml-auto shrink-0 whitespace-nowrap text-right font-price font-bold text-sm text-accent sm:ml-0 sm:min-w-[4.5rem]">
          Rs {item.price * item.qty}
        </p>
      </div>
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

              {/* Deliberately not showing a delivery fee or a grand total here: this
                  page has no idea whether the order is delivery or pickup, whether the
                  shop is open, or whether anything is sold out. Those are the server's
                  answers and they arrive on the checkout page. Quoting a total here that
                  the next page contradicts is worse than quoting none. */}
              <p className="mt-4 mb-3 text-xs text-text-body">
                Delivery and your total are worked out at checkout.
              </p>
              <Link
                to="/checkout"
                className="block w-full text-center h-12 leading-[3rem] bg-accent text-white no-underline rounded-lg font-display font-bold text-sm"
              >
                Proceed to checkout
              </Link>

              <p className="mt-3 mb-0 text-[0.7rem] text-text-body text-center">
                Prefer to order by phone?{' '}
                <a href="tel:051111557799" className="text-accent font-bold">
                  051-111-557-799
                </a>
              </p>
            </div>
          </>
        )}
      </section>

      <Footer />
    </>
  )
}
