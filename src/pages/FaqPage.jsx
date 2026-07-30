import { useState } from 'react'
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaStar, FaRegStar } from 'react-icons/fa'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import testimonialCardBg from '../assets/card1.webp'
import avatar1 from '../assets/faq-avatar-1.webp'
import avatar2 from '../assets/faq-avatar-2.webp'
import avatar3 from '../assets/faq-avatar-3.webp'
import avatar4 from '../assets/faq-avatar-4.webp'
import avatar5 from '../assets/faq-avatar-5.webp'
import avatar6 from '../assets/faq-avatar-6.webp'
import avatar7 from '../assets/faq-avatar-7.webp'

// Full literal class strings (not built via interpolation) so Tailwind's
// static scanner can detect them — arbitrary values built from interpolated
// variables at runtime are invisible to the JIT compiler.
const AVATAR_LAYOUT = [
  'lg:top-[5%] lg:left-[16%] lg:w-[clamp(60px,7vw,125px)] lg:h-[clamp(60px,7vw,125px)]',
  'mt-6 lg:mt-0 lg:top-[62%] lg:left-[15%] lg:w-[clamp(58px,6.7vw,120px)] lg:h-[clamp(58px,6.7vw,120px)]',
  'lg:top-[34%] lg:left-[31%] lg:w-[clamp(70px,8vw,146px)] lg:h-[clamp(70px,8vw,146px)]',
  'mt-[-0.75rem] lg:mt-0 lg:top-[64%] lg:left-[51%] lg:w-[clamp(46px,5.3vw,96px)] lg:h-[clamp(46px,5.3vw,96px)]',
  'lg:top-[32%] lg:left-[63%] lg:w-[clamp(30px,3.5vw,63px)] lg:h-[clamp(30px,3.5vw,63px)]',
  'mt-4 lg:mt-0 lg:top-[11%] lg:left-[81%] lg:w-[clamp(44px,5vw,92px)] lg:h-[clamp(44px,5vw,92px)]',
  'lg:top-[61%] lg:left-[81%] lg:w-[clamp(73px,8.4vw,152px)] lg:h-[clamp(73px,8.4vw,152px)]',
]

const FAQS = [
  {
    q: 'Where are Sugarloop branches located?',
    a: 'Sugarloop has multiple branches across Rawalpindi and Islamabad. You can find your nearest outlet through our Locations page.',
  },
  {
    q: "What are Sugarloop's opening hours?",
    a: 'Our opening hours may vary by location. Please check the individual branch listing for the most up-to-date timings.',
  },
  {
    q: 'Do you offer delivery?',
    a: 'Yes! Sugarloop offers delivery through our available delivery channels. Delivery availability may vary by location.',
  },
  {
    q: 'Which areas do you deliver to?',
    a: 'Delivery coverage depends on the branch and your location. Enter your address through FoodPanda to check availability.',
  },
  {
    q: 'Can I schedule an order for a specific time?',
    a: 'Yes, scheduled orders may be placed in advance, subject to availability.',
  },
  {
    q: 'Do you take bulk orders?',
    a: 'Yes! We accept bulk orders for birthdays, weddings, corporate events, parties, and other occasions. Send your queries at sugarlooppk@gmail.com',
  },
  {
    q: 'Who can I contact for corporate partnerships?',
    a: 'For corporate, brand, location, and partnership inquiries, please send an email at sugarlooppk@gmail.com',
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
    <div className="bg-[#f5f5f5] border border-[#dfdfdf] rounded-[10px] lg:rounded-[19px] px-[1.1rem] transition-transform duration-300 ease-out hover:scale-[1.02]">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 bg-none border-none cursor-pointer py-[1.1rem] font-display font-medium text-[0.9rem] lg:text-[1.1rem] text-[#616161] text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <FaChevronDown
          className={`shrink-0 text-[0.85rem] text-[#616161] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <p className="m-0 pb-[1.1rem] text-[0.85rem] leading-[1.7] text-text-body">{a}</p>}
    </div>
  )
}

function Stars({ rating }) {
  return (
    <span className="flex gap-[2px] text-[#f2b90c] text-[0.75rem]">
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

  // The box starts short and grows to fit what's typed: reset to auto first so it
  // can shrink again on delete, then match the content. max-h caps the growth and
  // hands over to scrolling.
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <>
      <ShopNav />

      <section
        className="text-center pt-[clamp(1.5rem,5vw,3rem)] px-5 pb-[clamp(2rem,5vw,3.5rem)] bg-[#fafafa]"
        aria-label="FAQ"
      >
        <h1 className="m-0 font-display font-bold text-[clamp(3rem,9vw,9.375rem)] tracking-[-0.02em] text-accent">
          FAQ
        </h1>
        <p className="mt-2 mx-auto mb-0 max-w-[34rem] text-[clamp(0.8rem,1.5vw,0.95rem)] leading-[1.6] text-[#868686]">
          Do you have any questions about donuts or croissants? Perhaps you'll find your answers here
        </p>
      </section>

      <section
        className="pt-[clamp(1.5rem,4vw,3rem)] px-5 pb-[clamp(2rem,5vw,3.5rem)] bg-[#fafafa] border-t border-faq-border"
        aria-label="Frequently asked questions"
      >
        {/* items-start: grid items stretch to the row height by default, so opening
            one card would drag its neighbour taller with it. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-[0.9rem] lg:gap-x-12 lg:gap-y-5 max-w-[1400px] mx-auto">
          {FAQS.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
      </section>

      <section
        className="pt-[clamp(2rem,5vw,3.5rem)] px-5 pb-[clamp(2.5rem,6vw,4rem)] bg-[#eef0f2] text-center"
        aria-label="Happy customers"
      >
        <h2 className="mb-8 mt-0 font-display font-bold text-[clamp(1.5rem,3vw,3.125rem)] text-[#383838]">
          Happy Customers
        </h2>

        <div className="relative max-w-[1200px] mx-auto lg:aspect-[1920/780]">
          <div className="flex flex-wrap items-center justify-center gap-[1.1rem] lg:absolute lg:inset-0 lg:block">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                className={`group rounded-full overflow-hidden border-none p-0 cursor-pointer shrink-0 outline-offset-[3px] w-14 h-14 lg:absolute ${AVATAR_LAYOUT[i]} ${
                  i === activeTestimonial ? 'outline-[3px] outline-accent' : ''
                }`}
                onClick={() => setActiveTestimonial(i)}
                aria-label={`Show testimonial from ${t.name}`}
              >
                <img
                  src={t.avatar}
                  alt=""
                  className="w-full h-full object-cover block transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </button>
            ))}
          </div>

          <div
            className="mt-7 mx-auto max-w-[360px] py-5 px-[1.4rem] bg-white bg-cover bg-center border border-black/30 rounded-2xl text-left lg:absolute lg:top-[7%] lg:left-[36%] lg:w-[21%] lg:min-w-[340px] lg:max-w-[420px] lg:m-0"
            style={{ backgroundImage: `url(${testimonialCardBg})` }}
          >
            <p className="mb-3 mt-0 text-[0.8rem] leading-[1.7] text-[#575757]">{testimonial.quote}</p>
            <Stars rating={testimonial.rating} />
            <p className="mt-[0.4rem] mb-0 font-medium text-[0.9rem] text-black/74">{testimonial.name}</p>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-8 lg:mt-12">
          <button
            type="button"
            className="flex items-center justify-center w-[2.6rem] h-[2.6rem] rounded-full border-none cursor-pointer bg-[rgba(88,126,162,0.29)] text-accent text-[0.9rem]"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-[2.6rem] h-[2.6rem] rounded-full border-none cursor-pointer bg-[rgba(88,126,162,0.29)] text-accent text-[0.9rem]"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <FaChevronRight />
          </button>
        </div>
      </section>

      <section
        className="py-[clamp(2.5rem,6vw,4rem)] px-5 bg-[#fafafa] text-center"
        aria-label="Find Sugarloop"
      >
        <h2 className="mb-8 mt-0 font-display font-bold text-[clamp(1.5rem,3vw,2.5rem)] text-[#383838]">
          Find Sugarloop
        </h2>

        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-12 max-w-[1300px] mx-auto text-left">
          <ul className="list-none m-0 p-0 lg:flex-[0_0_320px]">
            {BRANCHES.map((b, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 py-4 border-b border-border-light"
              >
                <p className="m-0 font-display font-bold text-[1.1rem] text-accent">{b.name}</p>
                <button
                  type="button"
                  className={`shrink-0 h-8 px-[0.9rem] border-2 border-accent rounded-[3px] font-display font-medium text-xs cursor-pointer ${
                    i === activeBranch ? 'bg-accent text-white' : 'bg-none text-accent'
                  }`}
                  onClick={() => setActiveBranch(i)}
                >
                  View details
                </button>
              </li>
            ))}
          </ul>

          <div className="w-full aspect-[473/339] lg:flex-1 lg:aspect-[1126/807] rounded-[10px] overflow-hidden border border-border-light">
            <iframe
              key={branch.query}
              title={`Map — ${branch.name}, ${branch.query}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(branch.query)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </section>

      <section
        className="pt-[clamp(2rem,6vw,4rem)] px-5 pb-[clamp(3rem,7vw,5rem)] bg-[#fafafa] text-center"
        aria-label="Ask a question"
      >
        <h2 className="mb-6 mt-0 font-display font-bold text-[clamp(1.25rem,3vw,2.5rem)] text-[#383838]">
          Got a Question? Ask away
        </h2>

        {/* 1113px * 0.7 - kept centred by mx-auto, so it narrows evenly from both sides. */}
        <form className="relative max-w-[779px] mx-auto" onSubmit={handleSubmit}>
          <textarea
            className="w-full min-h-[7rem] lg:min-h-[10rem] max-h-[60vh] overflow-y-auto py-[1.1rem] px-[1.2rem] lg:pb-20 bg-[#f5f5f5] border border-[#dfdfdf] rounded-[14px] font-display text-[0.9rem] text-black resize-y placeholder:text-[#9e9e9e]"
            placeholder="Write your question"
            value={question}
            onChange={handleQuestionChange}
            required
          />
          <button
            type="submit"
            className="block w-full mt-4 lg:mt-0 h-[2.9rem] bg-accent text-white border-none rounded-xl font-display font-bold text-[1.1rem] cursor-pointer transition-transform duration-300 ease-out hover:scale-105 lg:absolute lg:right-6 lg:bottom-6 lg:w-auto lg:px-10"
          >
            Submit
          </button>
        </form>
        {submitted && (
          <p className="mt-4 mb-0 font-display font-medium text-accent-dark">
            Thanks! We'll get back to you shortly.
          </p>
        )}
      </section>

      <Footer />
    </>
  )
}
