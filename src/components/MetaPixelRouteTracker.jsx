import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isTrackedPath, track } from '../lib/metaPixel'

// One PageView per route, because a single-page app only loads once. Keyed on the
// pathname, not the query string, for the same reason as ScrollToTop: switching a
// category tab on /products is not a new page.
export default function MetaPixelRouteTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (isTrackedPath(pathname)) track('PageView')
  }, [pathname])

  return null
}
