import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// Desktop-only hamburger + dropdown, meant to sit beside the Home/Menu/Contact
// pill nav and surface the rest of the site (Products, Build a Box, etc.)
// without crowding the hero pill. Closes on outside click, Escape, or link pick.
export default function DesktopMenuDropdown({ items }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="More pages"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex flex-col justify-center gap-[5px] w-9 h-9 bg-overlay-nav rounded-full border-none cursor-pointer p-0 transition-transform duration-300 ease-out hover:scale-110"
      >
        <span className="block h-[2px] w-4 mx-auto bg-white rounded-[1px]" />
        <span className="block h-[2px] w-4 mx-auto bg-white rounded-[1px]" />
        <span className="block h-[2px] w-4 mx-auto bg-white rounded-[1px]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-[10] min-w-[13rem] bg-white rounded-[1rem] shadow-[0_12px_32px_rgba(0,0,0,0.25)] py-2 flex flex-col"
        >
          {items.map((item) => {
            const className =
              'px-5 py-[0.65rem] font-display font-bold text-[0.95rem] text-accent no-underline whitespace-nowrap transition-colors duration-200 hover:bg-bg-section'
            return item.to ? (
              <Link
                key={item.label}
                to={item.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={className}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={className}
              >
                {item.label}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
