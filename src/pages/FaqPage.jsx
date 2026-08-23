import { useState } from 'react'
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaStar, FaRegStar } from 'react-icons/fa'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import { isApiConfigured, submitEnquiry } from '../lib/api'
import { useBranch } from '../context/BranchContext'
import { FALLBACK_BRANCHES, branchMapUrl, shortBranchName } from '../lib/branches'
import testimonialCardBg from '../assets/card1.webp'
import avatar1 from '../assets/faq-avatar-1.webp'
import avatar2 from '../assets/faq-avatar-2.webp'
import avatar3 from '../assets/faq-avatar-3.webp'
import avatar4 from '../assets/faq-avatar-4.webp'
import avatar5 from '../assets/faq-avatar-5.webp'
import avatar6 from '../assets/faq-avatar-6.webp'
import avatar7 from '../assets/faq-avatar-7.webp'

const CONTACT_EMAIL = 'sugarlooppk@gmail.com'

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

/**
 * The branch list is fetched, not hardcoded.
 *
 * It used to be four literal entries all named "DHA Branch", pointing at DHA Phases 2,
 * 5, 6 and 8 — none of which is a shop. The real four are DHA 1, DHA 2, Bahria Phase 4
 * and NUST H-12, they live in the database with real addresses and coordinates, and the
 * map now pins the coordinates rather than asking Google to guess from an area name.
 *
 * `FALLBACK_BRANCHES` covers the no-API preview build. See lib/branches.js.
 */

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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [reference, setReference] = useState(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const { branches: apiBranches } = useBranch()

  // The API wins whenever it answers; the bundle is the floor for a preview build with
  // no backend. Either way these are real shops — the old list was not.
  const branches = apiBranches.length > 0 ? apiBranches : FALLBACK_BRANCHES

  const testimonial = TESTIMONIALS[activeTestimonial]
  // Clamped rather than indexed blindly: the list arrives a tick after first paint, and
  // a stale index from a longer list would leave this undefined mid-render.
  const branch = branches[Math.min(activeBranch, branches.length - 1)]

  const nextTestimonial = () => setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length)
  const prevTestimonial = () => setActiveTestimonial((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)

  /**
   * Sends the question to the API, which stores it and emails the shop.
   *
   * This used to set a flag and nothing else: the page said "we'll get back to you
   * shortly" and the question went nowhere at all — no request, no record, and no address
   * to reply to even if someone had wanted to. A promise the page could not keep was
   * worse than not asking, which is why the form now takes a name and an email: an answer
   * needs somewhere to go.
   *
   * Posted as `kind: 'question'`, which is what separates it from a corporate gifting
   * lead in the same inbox. The server makes the phone optional for this kind — demanding
   * a number before somebody may ask whether the donuts contain nuts would lose more
   * questions than it could ever help answer.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!isApiConfigured) {
      setError(`We can't send that right now. Please email us at ${CONTACT_EMAIL}.`)
      return
    }

    setSending(true)
    try {
      const { enquiry } = await submitEnquiry({
        kind: 'question',
        name: name.trim(),
        email: email.trim(),
        message: question.trim(),
      })

      setReference(enquiry.reference)
      setName('')
      setEmail('')
      setQuestion('')
    } catch (err) {
      // The API returns `[{ field, message }]` on a 422, so a rejected value lands under
      // the input that caused it rather than as one sentence for the whole form.
      if (Array.isArray(err?.details) && err.details.length > 0) {
        setFieldErrors(
          Object.fromEntries(err.details.map(({ field, message }) => [field, message]))
        )
      } else if (err?.code === 'TOO_MANY_REQUESTS') {
        setError("You've sent this a few times already — please give it a little while.")
      } else {
        setError(`Something went wrong sending that. Please try again, or email ${CONTACT_EMAIL}.`)
      }
    } finally {
      setSending(false)
    }
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

      {/* id="locations" is the footer's Our Locations target: this branch list is
          the site's locations content, so the link lands here rather than on the
          top of the FAQ. */}
      <section
        id="locations"
        className="py-[clamp(2.5rem,6vw,4rem)] px-5 bg-[#fafafa] text-center"
        aria-label="Find Sugarloop"
      >
        <h2 className="mb-8 mt-0 font-display font-bold text-[clamp(1.5rem,3vw,2.5rem)] text-[#383838]">
          Find Sugarloop
        </h2>

        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-12 max-w-[1300px] mx-auto text-left">
          <ul className="list-none m-0 p-0 lg:flex-[0_0_320px]">
            {branches.map((b, i) => (
              <li
                key={b.id}
                className="flex items-start justify-between gap-4 py-4 border-b border-border-light"
              >
                <span className="min-w-0">
                  <span className="block font-display font-bold text-[1.1rem] text-accent">
                    {shortBranchName(b.name)}
                  </span>
                  {/* The address is the point of a "Find Sugarloop" section, and the old
                      list had none — four identical names told a visitor nothing about
                      which shop was near them. */}
                  {b.address && (
                    <span className="block mt-1 font-display text-xs text-text-body">
                      {b.address}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className={`shrink-0 h-8 px-[0.9rem] border-2 border-accent rounded-[3px] font-display font-medium text-xs cursor-pointer ${
                    i === activeBranch ? 'bg-accent text-white' : 'bg-none text-accent'
                  }`}
                  onClick={() => setActiveBranch(i)}
                >
                  View on map
                </button>
              </li>
            ))}
          </ul>

          <div className="w-full aspect-[473/339] lg:flex-1 lg:aspect-[1126/807] rounded-[10px] overflow-hidden border border-border-light">
            <iframe
              key={branch.id}
              title={`Map — ${branch.name}`}
              src={branchMapUrl(branch)}
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
          {/* Name and email are what make the answer deliverable. The question used to
              stand alone, which meant nobody could reply to it even in principle. */}
          <div className="flex flex-col gap-3 mb-3 sm:flex-row">
            <div className="flex-1 text-left">
              <input
                type="text"
                className="w-full h-12 px-4 bg-[#f5f5f5] border border-[#dfdfdf] rounded-[14px] font-display text-[0.9rem] text-black placeholder:text-[#9e9e9e]"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {fieldErrors.name && (
                <p className="mt-1 mb-0 font-display text-[0.78rem] text-red-600">
                  {fieldErrors.name}
                </p>
              )}
            </div>
            <div className="flex-1 text-left">
              <input
                type="email"
                className="w-full h-12 px-4 bg-[#f5f5f5] border border-[#dfdfdf] rounded-[14px] font-display text-[0.9rem] text-black placeholder:text-[#9e9e9e]"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 mb-0 font-display text-[0.78rem] text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </div>

          <textarea
            className="w-full min-h-[7rem] lg:min-h-[10rem] max-h-[60vh] overflow-y-auto py-[1.1rem] px-[1.2rem] lg:pb-20 bg-[#f5f5f5] border border-[#dfdfdf] rounded-[14px] font-display text-[0.9rem] text-black resize-y placeholder:text-[#9e9e9e]"
            placeholder="Write your question"
            value={question}
            onChange={handleQuestionChange}
            required
          />
          {fieldErrors.message && (
            <p className="mt-1 mb-0 text-left font-display text-[0.78rem] text-red-600">
              {fieldErrors.message}
            </p>
          )}
          <button
            type="submit"
            disabled={sending}
            className="block w-full mt-4 lg:mt-0 h-[2.9rem] bg-accent text-white border-none rounded-xl font-display font-bold text-[1.1rem] cursor-pointer transition-transform duration-300 ease-out hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 lg:absolute lg:right-6 lg:bottom-6 lg:w-auto lg:px-10"
          >
            {sending ? 'Sending…' : 'Submit'}
          </button>
        </form>

        {/* The reference is the whole point of confirming: it is what the visitor can
            quote on the phone if the answer never arrives. */}
        {reference && (
          <p className="mt-4 mb-0 font-display font-medium text-accent">
            Thanks! We'll get back to you shortly — your reference is {reference}.
          </p>
        )}
        {error && <p className="mt-4 mb-0 font-display font-medium text-red-600">{error}</p>}
      </section>

      <Footer />
    </>
  )
}
