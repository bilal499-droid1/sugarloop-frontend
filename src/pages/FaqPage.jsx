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
    <div className="bg-[#f5f5f5] border border-[#dfdfdf] rounded-[10px] lg:rounded-[19px] px-[1.1rem]">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.9rem] lg:gap-x-12 lg:gap-y-5 max-w-[1400px] mx-auto">
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
                className={`rounded-full overflow-hidden border-none p-0 cursor-pointer shrink-0 outline-offset-[3px] w-14 h-14 lg:absolute ${AVATAR_LAYOUT[i]} ${
                  i === activeTestimonial ? 'outline-[3px] outline-accent' : ''
                }`}
                onClick={() => setActiveTestimonial(i)}
                aria-label={`Show testimonial from ${t.name}`}
              >
                <img src={t.avatar} alt="" className="w-full h-full object-cover block" />
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

        <form className="relative max-w-[1113px] mx-auto" onSubmit={handleSubmit}>
          <textarea
            className="w-full min-h-[220px] lg:min-h-[420px] py-[1.1rem] px-[1.2rem] lg:pb-20 bg-[#f5f5f5] border border-[#dfdfdf] rounded-[14px] font-display text-[0.9rem] text-black resize-y placeholder:text-[#9e9e9e]"
            placeholder="Write your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <button
            type="submit"
            className="block w-full mt-4 lg:mt-0 h-[2.9rem] bg-accent text-white border-none rounded-xl font-display font-bold text-[1.1rem] cursor-pointer lg:absolute lg:right-6 lg:bottom-6 lg:w-auto lg:px-10"
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
