import { FaHome, FaSearch, FaRegHeart, FaRegUser } from 'react-icons/fa'

const itemClass = 'bg-none border-none text-white/55 text-[1.1rem] cursor-pointer flex items-center justify-center p-[0.4rem]'

export default function MobileTabBar() {
  return (
    <nav
      className="sticky bottom-0 z-[5] flex items-center justify-around bg-[#2a2a2a] py-[0.9rem] lg:hidden"
      aria-label="Mobile navigation"
    >
      <button type="button" className={`${itemClass} text-accent`} aria-label="Home">
        <FaHome />
      </button>
      <button type="button" className={itemClass} aria-label="Search">
        <FaSearch />
      </button>
      <button type="button" className={itemClass} aria-label="Wishlist">
        <FaRegHeart />
      </button>
      <button type="button" className={itemClass} aria-label="Profile">
        <FaRegUser />
      </button>
    </nav>
  )
}
