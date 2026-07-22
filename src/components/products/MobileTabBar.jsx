import { FaHome, FaSearch, FaRegHeart, FaRegUser } from 'react-icons/fa'
import './MobileTabBar.css'

export default function MobileTabBar() {
  return (
    <nav className="mobile-tab-bar" aria-label="Mobile navigation">
      <button type="button" className="mobile-tab-bar__item mobile-tab-bar__item--active" aria-label="Home">
        <FaHome />
      </button>
      <button type="button" className="mobile-tab-bar__item" aria-label="Search">
        <FaSearch />
      </button>
      <button type="button" className="mobile-tab-bar__item" aria-label="Wishlist">
        <FaRegHeart />
      </button>
      <button type="button" className="mobile-tab-bar__item" aria-label="Profile">
        <FaRegUser />
      </button>
    </nav>
  )
}
