import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// The router keeps the previous scroll offset across route changes, so clicking a
// menu card near the bottom of the home page would otherwise land you part-way down
// /products. Ignores the query string on purpose: switching category tabs updates
// ?category= on the same path and must not yank the page back to the top. A hash
// is honoured instead of the reset, so /#about lands on that section.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    // A link like /#about can arrive before the home page has painted its
    // sections, so the target often isn't in the DOM on this first pass. Retry
    // across a few frames rather than giving up and leaving the user at the top.
    let attempts = 0
    let frame = requestAnimationFrame(function find() {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (attempts++ < 90) {
        frame = requestAnimationFrame(find)
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}
