import { useState } from 'react'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import giftBoxDesktop from '../assets/DC.png'
import giftBoxMobile from '../assets/Rectangle 1131.png'

const FIELDS = ['Name', 'Phone', 'Email', 'Company', 'Subject']

export default function CorporateGiftingPage() {
  const [form, setForm] = useState({ Name: '', Phone: '', Email: '', Company: '', Subject: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((current) => ({ ...current, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <ShopNav />

      <section
        className="flex flex-col pt-6 px-5 pb-12 bg-[#f8f8f8] lg:flex-row lg:items-center lg:gap-3 lg:pt-8 lg:pr-0 lg:pb-12 lg:pl-[clamp(2rem,5vw,5.5rem)]"
        aria-label="Corporate gifting"
      >
        {/* Mobile (Rectangle 1131.png, 393x648): boxes only paint rows 144-384, so
            the slot is cut to that band and object-position pins it - cover scales
            by width, making the 35.4% offset hold at any phone size.
            Desktop (DC.png): no fixed slot height and no object-fit, so the file
            renders whole at its natural 1639/1960 ratio - nothing clipped. Size is
            driven by width instead, which is what makes the boxes read large; the
            70rem cap stops it running away on ultrawide screens.
            The negative margins cancel the file's own empty bands (573 rows above
            the boxes, 434 below) so they stop pushing the layout apart: as a share
            of the rendered width that is 573/1639*1960/1639 = 34.96% and
            434/1639*1960/1639 = 26.48%. The image still paints in full, it just
            overflows into space it was wasting - and ShopNav carries z-[2], so the
            transparent overlap never sits above the nav. The cap lives on the
            <picture> so margin percentages, which resolve against the parent's
            width, always match the image's own width. */}
        <div className="order-first w-full aspect-[393/241] mb-2 lg:order-1 lg:flex-1 lg:min-w-0 lg:aspect-auto lg:h-auto lg:mb-0">
          <picture className="block w-full h-full lg:h-auto lg:max-w-[70rem] lg:ml-auto">
            <source media="(min-width: 1024px)" srcSet={giftBoxDesktop} />
            <img
              src={giftBoxMobile}
              alt="Sugarloop corporate gift box"
              className="w-full h-full object-cover [object-position:50%_35.4%] lg:h-auto lg:mt-[-34.96%] lg:mb-[-26.48%]"
            />
          </picture>
        </div>

        <div className="flex flex-col items-center text-center lg:flex-[0_0_340px] lg:items-start lg:text-left lg:max-w-[340px] lg:pr-2">
          <h1 className="m-0 font-display font-bold text-[1.9rem] text-accent tracking-[-0.02em] lg:text-[2.5rem] lg:leading-[1.05] lg:whitespace-nowrap">
            Corporate Gifting
          </h1>
          {/* The <br /> is a desktop-only line break: on mobile the copy already
              wraps inside the narrow column, and forcing it leaves "appreciation"
              stranded on its own line. */}
          <p className="mt-1 mb-4 max-w-[22rem] text-[0.8rem] leading-[1.45] text-[#6d6d6d] lg:mt-2 lg:mb-7 lg:text-base lg:leading-[1.7] lg:whitespace-nowrap">
            From celebrating major company milestones to showing everyday{' '}
            <br className="hidden lg:inline" />
            appreciation
          </p>

          {submitted ? (
            <p className="font-display font-medium text-accent-dark">Thanks! We'll be in touch shortly.</p>
          ) : (
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
              {FIELDS.map((field) => (
                <input
                  key={field}
                  type={field === 'Email' ? 'email' : 'text'}
                  placeholder={field}
                  value={form[field]}
                  onChange={handleChange(field)}
                  className="w-full h-12 px-4 bg-[#f3f2f2] border border-[rgba(89,89,89,0.3)] rounded-[3px] font-display text-[0.9rem] text-black placeholder:text-[#9c9c9c]"
                />
              ))}
              <button
                type="submit"
                className="h-12 bg-accent text-white border-none rounded-[3px] font-display font-bold text-[1.1rem] cursor-pointer transition-transform duration-300 ease-out hover:scale-105 lg:self-start lg:px-10"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
