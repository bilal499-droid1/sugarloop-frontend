import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// The router keeps the previous scroll offset across route changes, so clicking a
// menu card near the bottom of the home page would otherwise land you part-way down
// /products. Keyed on pathname only: switching category tabs updates ?category= on
// the same path and must not yank the page back to the top.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
