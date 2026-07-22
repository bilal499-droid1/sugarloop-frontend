import { useState } from 'react'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import giftBoxDesktop from '../assets/Rectangle 1134.png'
import giftBoxMobile from '../assets/Rectangle 1131.png'
import './CorporateGiftingPage.css'

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

      <section className="corporate-gifting" aria-label="Corporate gifting">
        <div className="corporate-gifting__media">
          <picture>
            <source media="(min-width: 1024px)" srcSet={giftBoxDesktop} />
            <img src={giftBoxMobile} alt="Sugarloop corporate gift box" />
          </picture>
        </div>

        <div className="corporate-gifting__content">
          <h1 className="corporate-gifting__heading">Corporate Gifting</h1>
          <p className="corporate-gifting__subtext">
            From celebrating major company milestones to showing everyday<br />appreciation
          </p>

          {submitted ? (
            <p className="corporate-gifting__success">Thanks! We'll be in touch shortly.</p>
          ) : (
            <form className="corporate-gifting__form" onSubmit={handleSubmit}>
              {FIELDS.map((field) => (
                <input
                  key={field}
                  type={field === 'Email' ? 'email' : 'text'}
                  placeholder={field}
                  value={form[field]}
                  onChange={handleChange(field)}
                  className="corporate-gifting__input"
                />
              ))}
              <button type="submit" className="corporate-gifting__submit">
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
