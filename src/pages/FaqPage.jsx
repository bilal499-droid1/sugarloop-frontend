import { useState } from 'react'
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaStar, FaRegStar } from 'react-icons/fa'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import testimonialCardBg from '../assets/card1.png'
import avatar1 from '../assets/faq-avatar-1.jpg'
import avatar2 from '../assets/faq-avatar-2.jpg'
import avatar3 from '../assets/faq-avatar-3.jpg'
import avatar4 from '../assets/faq-avatar-4.jpg'
import avatar5 from '../assets/faq-avatar-5.jpg'
import avatar6 from '../assets/faq-avatar-6.jpg'
import avatar7 from '../assets/faq-avatar-7.jpg'
import './FaqPage.css'

const FAQS = [
  {
    q: 'Is there a delivery charge?',
    a: 'Delivery is free on orders over Rs 1500 within city limits. Below that, a flat Rs 150 delivery charge applies.',
  },
  {
    q: 'Who is the CEO of Sugarloop?',
    a: 'Saif is the CEO of Sugarloop, leading the brand since it was founded.',
  },
  {
    q: 'Is there a discount on Sugarloop?',
    a: 'We run seasonal discounts and a loyalty rewards program throughout the year — follow our Instagram for the latest offers.',
  },
  {
    q: 'Where is Sugarloop located?',
    a: "We have multiple branches across DHA — check the “Find Sugarloop” section below for the closest one to you.",
  },
  {
    q: 'Is Sugarloop a fitness brand?',
    a: 'No, Sugarloop is a bakery and dessert brand — though we do love a post-workout treat.',
  },
  {
    q: "What are Sugarloop's opening hours?",
    a: "We're open daily from 9am to 11pm, including public holidays.",
  },
]

const TESTIMONIALS = [
  { avatar: avatar1, name: 'Hamza T.', rating: 5, quote: 'Lorem ipsum dolor sit amet consectetur. Congue eget est porttitor pulvinar mattis. Morbi volutpat praesent tellus.' },
  { avatar: avatar2, name: 'Areeba S.', rating: 4, quote: 'Lorem ipsum dolor sit amet consectetur. Congue eget est porttitor pulvinar mattis. Morbi volutpat praesent tellus.' },
  { avatar: avatar3, name: 'Danish M.', rating: 5, quote: 'Lorem ipsum dolor sit amet consectetur. Congue eget est porttitor pulvinar mattis. Morbi volutpat praesent tellus.' },
  { avatar: avatar4, name: 'Zain A.', rating: 4, quote: 'Lorem ipsum dolor sit amet consectetur. Congue eget est porttitor pulvinar mattis. Morbi volutpat praesent tellus.' },
  { avatar: avatar5, name: 'Sana K.', rating: 5, quote: 'Lorem ipsum dolor sit amet consectetur. Congue eget est porttitor pulvinar mattis. Morbi volutpat praesent tellus.' },
  { avatar: avatar6, name: 'Mahnoor I.', rating: 5, quote: 'Lorem ipsum dolor sit amet consectetur. Congue eget est porttitor pulvinar mattis. Morbi volutpat praesent tellus.' },
  { avatar: avatar7, name: 'Fatima Z.', rating: 4, quote: 'Lorem ipsum dolor sit amet consectetur. Congue eget est porttitor pulvinar mattis. Morbi volutpat praesent tellus.' },
]

const BRANCHES = [
  { name: 'DHA Branch', query: 'DHA Phase 2' },
  { name: 'DHA Branch', query: 'DHA Phase 5' },
  { name: 'DHA Branch', query: 'DHA Phase 6' },
  { name: 'DHA Branch', query: 'DHA Phase 8' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`faq-accordion__item ${open ? 'faq-accordion__item--open' : ''}`}>
      <button
        type="button"
        className="faq-accordion__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <FaChevronDown className="faq-accordion__chevron" />
      </button>
      {open && <p className="faq-accordion__answer">{a}</p>}
    </div>
  )
}

function Stars({ rating }) {
  return (
    <span className="faq-testimonials__stars">
      {Array.from({ length: 5 }, (_, i) => (i < rating ? <FaStar key={i} /> : <FaRegStar key={i} />))}
    </span>
  )
}

export default function FaqPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [activeBranch, setActiveBranch] = useState(0)
  const [question, setQuestion] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const testimonial = TESTIMONIALS[activeTestimonial]
  const branch = BRANCHES[activeBranch]

  const nextTestimonial = () => setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length)
  const prevTestimonial = () => setActiveTestimonial((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <ShopNav />

      <section className="faq-hero" aria-label="FAQ">
        <h1 className="faq-hero__title">FAQ</h1>
        <p className="faq-hero__subtext">
          Do you have any questions about donuts or croissants? Perhaps you'll find your answers here
        </p>
      </section>

      <section className="faq-accordion" aria-label="Frequently asked questions">
        <div className="faq-accordion__grid">
          {FAQS.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
      </section>

      <section className="faq-testimonials" aria-label="Happy customers">
        <h2 className="faq-testimonials__heading">Happy Customers</h2>

        <div className="faq-testimonials__stage">
          <div className="faq-testimonials__avatars">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                className={`faq-testimonials__avatar ${i === activeTestimonial ? 'faq-testimonials__avatar--active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
                aria-label={`Show testimonial from ${t.name}`}
              >
                <img src={t.avatar} alt="" />
              </button>
            ))}
          </div>

          <div className="faq-testimonials__card" style={{ backgroundImage: `url(${testimonialCardBg})` }}>
            <p className="faq-testimonials__quote">{testimonial.quote}</p>
            <Stars rating={testimonial.rating} />
            <p className="faq-testimonials__name">{testimonial.name}</p>
          </div>
        </div>

        <div className="faq-testimonials__nav">
          <button type="button" onClick={prevTestimonial} aria-label="Previous testimonial">
            <FaChevronLeft />
          </button>
          <button type="button" onClick={nextTestimonial} aria-label="Next testimonial">
            <FaChevronRight />
          </button>
        </div>
      </section>

      <section className="faq-locations" aria-label="Find Sugarloop">
        <h2 className="faq-locations__heading">Find Sugarloop</h2>

        <div className="faq-locations__content">
          <ul className="faq-locations__list">
            {BRANCHES.map((b, i) => (
              <li key={i} className={`faq-locations__item ${i === activeBranch ? 'faq-locations__item--active' : ''}`}>
                <p className="faq-locations__name">{b.name}</p>
                <button type="button" className="faq-locations__btn" onClick={() => setActiveBranch(i)}>
                  View details
                </button>
              </li>
            ))}
          </ul>

          <div className="faq-locations__map">
            <iframe
              key={branch.query}
              title={`Map — ${branch.name}, ${branch.query}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(branch.query)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="faq-contact" aria-label="Ask a question">
        <h2 className="faq-contact__heading">Got a Question? Ask away</h2>

        <form className="faq-contact__form" onSubmit={handleSubmit}>
          <textarea
            className="faq-contact__textarea"
            placeholder="Write your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <button type="submit" className="faq-contact__submit">
            Submit
          </button>
        </form>
        {submitted && <p className="faq-contact__success">Thanks! We'll get back to you shortly.</p>}
      </section>

      <Footer />
    </>
  )
}
