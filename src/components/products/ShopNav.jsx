import { Link } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import './ShopNav.css'
import logo from '../../assets/sugarLoop 1.png'
import { useCart } from '../../context/CartContext'

export default function ShopNav() {
  const { count } = useCart()

  return (
    <nav className="shop-nav">
      <Link to="/" className="shop-nav__logo">
        <img src={logo} alt="Sugarloop" />
      </Link>

      <ul className="shop-nav__links">
        <li><Link to="/products">Products</Link></li>
        <li><a href="#faq">FAQ</a></li>
        <li><a href="/#about">About us</a></li>
      </ul>

      <div className="shop-nav__cart" aria-label={`Cart, ${count} items`}>
        <FaShoppingCart />
        {count > 0 && <span className="shop-nav__cart-badge">{count}</span>}
      </div>

      <button className="shop-nav__menu-btn" type="button" aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
    </nav>
  )
}
