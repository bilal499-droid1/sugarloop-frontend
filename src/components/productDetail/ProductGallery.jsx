import { useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const isNonSquare = (img) =>
  !!img && !!img.naturalWidth && !!img.naturalHeight &&
  Math.abs(img.naturalWidth / img.naturalHeight - 1) > 0.02

// Horizontal scroll-snap gallery for the product detail page. Swipe on touch,
// arrows / thumbnails on desktop. Falls back to a single tile when a product
// has one photo, and to the neutral placeholder when it has none.
export default function ProductGallery({ images = [], name }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  // Which photos are non-square, so they can be shown whole instead of sliced to
  // fill the square frame. Held in state rather than toggled on the node: this
  // component re-renders on every scroll, and React would restore the JSX
  // className each time, undoing any class added directly to the element.
  const [wholeShots, setWholeShots] = useState({})

  // Measured from both a ref and onLoad: React attaches onLoad after mount, so a
  // photo the browser already had cached never fires it - the ref covers those.
  const measure = (img, i) => {
    if (!isNonSquare(img)) return
    setWholeShots((current) => (current[i] ? current : { ...current, [i]: true }))
  }

  // Keep the active dot/thumbnail in sync with wherever the user scrolled to.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let frame = 0
    const handleScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const slide = track.clientWidth || 1
        setIndex(Math.round(track.scrollLeft / slide))
      })
    }

    track.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('scroll', handleScroll)
    }
  }, [images.length])

  const scrollTo = (next) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(images.length - 1, next))
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
    setIndex(clamped)
  }

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square border border-border-light rounded-[6px] bg-[linear-gradient(135deg,#eef1f4_0%,#e3e8ec_100%)] lg:flex-[0_0_42%] lg:max-w-[550px]" />
    )
  }

  const hasMultiple = images.length > 1

  return (
    <div className="w-full lg:flex-[0_0_42%] lg:max-w-[550px]">
      <div className="relative group">
        <div
          ref={trackRef}
          className="flex w-full aspect-square border border-border-light rounded-[6px] overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${name} photos`}
        >
          {/* Non-square photos are shown whole rather than sliced to fill the square
              frame, matching how ProductCard treats them in the grid. */}
          {images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${name} — photo ${i + 1} of ${images.length}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable="false"
              ref={(el) => measure(el, i)}
              onLoad={(event) => measure(event.currentTarget, i)}
              className={`w-full h-full flex-none snap-center ${
                wholeShots[i] ? 'object-contain bg-[#eceef3]' : 'object-cover'
              }`}
            />
          ))}
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => scrollTo(index - 1)}
              disabled={index === 0}
              aria-label="Previous photo"
              className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/85 text-black text-[0.7rem] shadow-[0_2px_6px_rgba(0,0,0,0.2)] cursor-pointer border-none opacity-0 transition-opacity duration-200 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-default"
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => scrollTo(index + 1)}
              disabled={index === images.length - 1}
              aria-label="Next photo"
              className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/85 text-black text-[0.7rem] shadow-[0_2px_6px_rgba(0,0,0,0.2)] cursor-pointer border-none opacity-0 transition-opacity duration-200 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-default"
            >
              <FaChevronRight />
            </button>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-[6px] lg:hidden">
              {images.map((src, i) => (
                <span
                  key={src}
                  className={`w-[6px] h-[6px] rounded-full transition-colors duration-200 ${
                    i === index ? 'bg-white' : 'bg-white/45'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="mt-3 hidden lg:flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`w-16 h-16 flex-none rounded-[4px] overflow-hidden cursor-pointer bg-transparent p-0 border transition-colors duration-200 ${
                i === index ? 'border-accent-dark' : 'border-border-light'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
