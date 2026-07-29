import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import logo from '../assets/sugarLoop 1.png'

const linkBaseClass =
  'no-underline font-display font-black text-[1.5rem] tracking-[0.01em] whitespace-nowrap transition-transform duration-300 ease-out hover:scale-110'

const VARIANTS = {
  dark: {
    panel: 'bg-[#1C1C1C]',
    link: 'text-white [-webkit-text-stroke:0.8px_#fff]',
    close: 'text-white',
  },
  light: {
    panel: 'bg-white',
    link: 'text-accent [-webkit-text-stroke:0.8px_#587ea2]',
    close: 'text-accent',
  },
}

export default function MobileNavMenu({ open, items, onClose, variant = 'dark' }) {
  const theme = VARIANTS[variant] ?? VARIANTS.dark
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!open) {
      setVisible(false)
      return
    }
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[100] bg-black/30 backdrop-blur-md transition-opacity duration-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 z-[101] w-[78%] max-w-[320px] ${theme.panel} backdrop-blur-xl shadow-2xl flex flex-col items-center gap-8 pt-6 px-6 transition-transform duration-500 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <img src={logo} alt="Sugarloop" className="h-8 w-auto" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`${theme.close} text-4xl leading-none bg-none border-none cursor-pointer p-0`}
          >
            &times;
          </button>
        </div>

        <ul className="list-none flex flex-col items-start gap-8 m-0 p-0 mt-4 w-full">
          {items.map((item) => (
            <li key={item.label}>
              {item.to ? (
                <Link to={item.to} className={`${linkBaseClass} ${theme.link}`} onClick={onClose}>
                  {item.label}
                </Link>
              ) : (
                <a href={item.href} className={`${linkBaseClass} ${theme.link}`} onClick={onClose}>
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>,
    document.body
  )
}
