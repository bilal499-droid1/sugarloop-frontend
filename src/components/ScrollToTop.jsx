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

    // Two things have to be true before the scroll can land. The target has to be
    // in the DOM - a link like /#about can arrive before the home page has painted
    // its sections - and the page has to be scrollable, because PageLoader pins
    // body overflow to hidden while its overlay is up and a scrollIntoView inside
    // that window is silently dropped. That second one only bites on a cross-page
    // hash (/faq#locations), where the pathname change restarts the loader; a
    // same-page hash never re-triggers it.
    //
    // Polled on a timer rather than requestAnimationFrame: rAF stops entirely on a
    // hidden tab, so a hash opened in a background tab would never scroll at all.
    // The deadline covers PageLoader's own 6s ceiling so even a slow route lands.
    let timer
    const deadline = Date.now() + 7000

    const find = () => {
      const target = document.querySelector(hash)
      if (target && document.body.style.overflow !== 'hidden') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (Date.now() < deadline) timer = setTimeout(find, 50)
    }

    timer = setTimeout(find, 0)

    return () => clearTimeout(timer)
  }, [pathname, hash])

  return null
}
