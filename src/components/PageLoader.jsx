import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import donutVideo from '../assets/donut-video.MP4'

// Floor keeps the overlay from flashing on cached routes; ceiling guarantees the
// page is never held hostage by one stalled asset (several heroes are 4-9MB).
const MIN_VISIBLE_MS = 500
const MAX_WAIT_MS = 6000

// Only wait for what the user is about to see. The products grid alone is ~40
// photos / tens of MB, and blocking on all of it held the overlay up past 5s.
const VIEWPORT_SCREENS = 1.5

function isWorthWaitingFor(el) {
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return false
  return rect.top < window.innerHeight * VIEWPORT_SCREENS && rect.bottom > 0
}

// <img> tags plus CSS background-image urls - the hero art is a background, so
// waiting only on <img> would drop the loader while the hero is still blank.
function collectImageSources() {
  const sources = new Set()

  document.querySelectorAll('img').forEach((img) => {
    const src = img.currentSrc || img.src
    if (src && isWorthWaitingFor(img)) sources.add(src)
  })

  document.querySelectorAll('*').forEach((el) => {
    const backgroundImage = getComputedStyle(el).backgroundImage
    if (!backgroundImage || backgroundImage === 'none') return
    if (!isWorthWaitingFor(el)) return
    for (const match of backgroundImage.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
      if (match[2] && !match[2].startsWith('data:')) sources.add(match[2])
    }
  })

  return [...sources]
}

function preload(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = resolve
    img.onerror = resolve // a broken asset shouldn't stall the whole page
    img.src = src
    if (img.complete) resolve()
  })
}

export default function PageLoader({ children }) {
  const { pathname } = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let ceiling
    const startedAt = Date.now()

    setLoading(true)

    const finish = () => {
      if (cancelled) return
      const remaining = MIN_VISIBLE_MS - (Date.now() - startedAt)
      if (remaining > 0) {
        setTimeout(() => !cancelled && setLoading(false), remaining)
      } else {
        setLoading(false)
      }
    }

    ceiling = setTimeout(finish, MAX_WAIT_MS)

    // Two frames so the incoming route has actually painted before we look at
    // what it needs - otherwise we'd measure the previous page's assets.
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Promise.all([
          document.fonts ? document.fonts.ready : Promise.resolve(),
          ...collectImageSources().map(preload),
        ]).then(() => {
          clearTimeout(ceiling)
          finish()
        })
      })
    })

    return () => {
      cancelled = true
      clearTimeout(ceiling)
      cancelAnimationFrame(frame)
    }
  }, [pathname])

  // Children stay mounted underneath so their assets are actually fetching while
  // the overlay is up; the overlay just hides the half-painted result.
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-6 transition-opacity duration-500 ${
          loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!loading}
role="status"
        aria-live="polite"
        aria-label={loading ? 'Loading page' : undefined}
      >
        {/* muted + playsInline are what allow autoplay on mobile Safari and Chrome */}
        <video
          src={donutVideo}
          className="h-32 w-32 rounded-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="w-40 h-[3px] rounded-full bg-border-light overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-accent animate-loader-sweep" />
        </div>
      </div>

      {children}
    </>
  )
}
