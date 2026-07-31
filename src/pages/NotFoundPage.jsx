import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'

export default function NotFoundPage() {
  // A static host can only answer 200 for these paths - the rewrite that stops
  // deep links 404ing hands every unmatched URL to the router. This tells
  // crawlers not to index the result, which the status code no longer can.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  return (
    <>
      <ShopNav />

      <div className="py-20 lg:py-28 px-5 text-center font-display">
        <p className="m-0 font-bold text-accent text-6xl lg:text-8xl leading-none">404</p>
        <h1 className="mt-4 mb-0 font-bold text-xl lg:text-2xl text-black">
          We couldn't find that page
        </h1>
        <p className="mt-3 mb-8 text-sm lg:text-base text-[#9a9a9a]">
          The link may be out of date, or the address mistyped.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-accent text-white no-underline font-bold text-sm"
          >
            Back to home
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 rounded-lg border border-[#e0e0e0] text-[#666] no-underline font-bold text-sm"
          >
            Browse products
          </Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
