import { useState } from 'react'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import giftBoxDesktop from '../assets/Rectangle 1134.png'
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
        className="flex flex-col pt-6 px-5 pb-12 bg-[#f8f8f8] lg:flex-row lg:items-center lg:gap-3 lg:pt-16 lg:pr-0 lg:pb-20 lg:pl-[clamp(2rem,5vw,5.5rem)]"
        aria-label="Corporate gifting"
      >
        <div className="order-first w-full aspect-[393/648] mb-6 lg:order-1 lg:aspect-[1920/1043] lg:flex-1 lg:min-w-0 lg:mb-0">
          <picture>
            <source media="(min-width: 1024px)" srcSet={giftBoxDesktop} />
            <img src={giftBoxMobile} alt="Sugarloop corporate gift box" className="w-full h-full object-cover" />
          </picture>
        </div>

        <div className="flex flex-col items-center text-center lg:flex-[0_0_340px] lg:items-start lg:text-left lg:max-w-[340px] lg:pr-2">
          <h1 className="m-0 font-display font-bold text-[1.9rem] text-accent tracking-[-0.02em] lg:text-[2.5rem] lg:leading-[1.05] lg:whitespace-nowrap">
            Corporate Gifting
          </h1>
          <p className="mt-2 mb-7 max-w-[22rem] text-[0.8rem] leading-[1.7] text-[#6d6d6d] lg:text-base lg:whitespace-nowrap">
            From celebrating major company milestones to showing everyday<br />appreciation
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
                className="h-12 bg-accent text-white border-none rounded-[3px] font-display font-bold text-[1.1rem] cursor-pointer lg:self-start lg:px-10"
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
