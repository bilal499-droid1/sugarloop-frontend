import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

const linkClass =
  'text-white no-underline font-bold text-[1.125rem] whitespace-nowrap transition-transform duration-300 ease-out hover:scale-110'

export default function MobileNavMenu({ open, items, onClose, positionClassName = 'top-16 right-5' }) {
  if (!open) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99]" onClick={onClose} />
      <ul
        className={`fixed z-[100] list-none flex flex-col items-end gap-4 w-fit m-0 bg-black/40 backdrop-blur-md rounded-2xl shadow-lg py-5 px-6 ${positionClassName}`}
      >
        {items.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <Link to={item.to} className={linkClass} onClick={onClose}>
                {item.label}
              </Link>
            ) : (
              <a href={item.href} className={linkClass} onClick={onClose}>
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </>,
    document.body
  )
}
