import { useState } from 'react'
import ShopNav from '../components/products/ShopNav'
import Footer from '../components/Footer'
import { isApiConfigured, submitEnquiry } from '../lib/api'
import giftBoxDesktop from '../assets/DC.webp'
import giftBoxMobile from '../assets/Rectangle 1131.webp'

/** `required` mirrors the server: a name and two ways to reach you, nothing more. */
const FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'phone', label: 'Phone', type: 'tel', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'company', label: 'Company', type: 'text' },
  { key: 'subject', label: 'Subject', type: 'text' },
]

const EMPTY = { name: '', phone: '', email: '', company: '', subject: '', message: '' }

const CONTACT_EMAIL = 'sugarlooppk@gmail.com'

export default function CorporateGiftingPage() {
  const [form, setForm] = useState(EMPTY)
  const [reference, setReference] = useState(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (field) => (e) => {
    const { value } = e.target
    setForm((current) => ({ ...current, [field]: value }))
    // Editing a field clears the complaint about it, so a corrected value stops looking
    // rejected the moment it is fixed.
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const { [field]: _cleared, ...rest } = current
        return rest
      })
    }
  }

  /**
   * Posts the enquiry to the API, which stores it and emails the shop.
   *
   * This used to build a `mailto:` link and hand the visitor a pre-filled draft they
   * still had to send themselves — which silently did nothing on any device without a
   * configured mail client, and there are a lot of those. A lead the shop never hears
   * about is the one failure mode this page cannot have.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!isApiConfigured) {
      setError(
        `We can't submit the form right now. Please email us at ${CONTACT_EMAIL} and we'll pick it up from there.`
      )
      return
    }

    setSending(true)
    try {
      const { enquiry } = await submitEnquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })

      setReference(enquiry.reference)
      setForm(EMPTY)
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
        setError(
          `Something went wrong sending that. Please try again, or email us at ${CONTACT_EMAIL}.`
        )
      }
    } finally {
      setSending(false)
    }
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
            width, always match the image's own width.
            Desktop renders at 80% (w-4/5, cap 70rem -> 56rem). Scaling the
            <picture> rather than the <img> is what keeps those percentage
            margins in step: shrinking the image alone would leave them sized
            against a parent that had not moved, and the bands would reappear. */}
        <div className="order-first w-full aspect-[393/241] mb-2 lg:order-1 lg:flex-1 lg:min-w-0 lg:aspect-auto lg:h-auto lg:mb-0">
          <picture className="block w-full h-full lg:h-auto lg:w-4/5 lg:max-w-[56rem] lg:ml-auto">
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

          {reference ? (
            <div className="font-display text-accent">
              <p className="m-0 font-medium">
                Thanks — we've got it, and we'll be in touch shortly.
              </p>
              <p className="m-0 mt-2 text-[0.8rem] text-[#6d6d6d]">
                Your reference is <span className="font-bold text-accent">{reference}</span>.
                Quote it if you call us on {CONTACT_EMAIL}.
              </p>
              <button
                type="button"
                onClick={() => setReference(null)}
                className="mt-4 bg-transparent border-none p-0 font-display text-[0.85rem] text-accent underline cursor-pointer"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit} noValidate>
              {error && (
                <p
                  role="alert"
                  className="m-0 px-4 py-3 rounded-[3px] bg-[#fdecea] font-display text-[0.8rem] text-[#c0392b]"
                >
                  {error}
                </p>
              )}

              {FIELDS.map(({ key, label, type, required }) => (
                <div key={key} className="flex flex-col gap-1">
                  <input
                    type={type}
                    placeholder={required ? `${label} *` : label}
                    aria-label={label}
                    value={form[key]}
                    onChange={handleChange(key)}
                    required={required}
                    className="w-full h-12 px-4 bg-[#f3f2f2] border border-[rgba(89,89,89,0.3)] rounded-[3px] font-display text-[0.9rem] text-black placeholder:text-[#9c9c9c]"
                  />
                  {fieldErrors[key] && (
                    <span className="font-display text-[0.7rem] text-[#c0392b]">
                      {fieldErrors[key]}
                    </span>
                  )}
                </div>
              ))}

              {/* Not on the original form, which captured a lead with nowhere to say what
                  the lead was for — leaving whoever called back to open with "you asked
                  about something?". Optional, so it never blocks a submission. */}
              <div className="flex flex-col gap-1">
                <textarea
                  placeholder="How many boxes, and when for?"
                  aria-label="Message"
                  value={form.message}
                  onChange={handleChange('message')}
                  rows={4}
                  maxLength={2000}
                  className="w-full py-3 px-4 bg-[#f3f2f2] border border-[rgba(89,89,89,0.3)] rounded-[3px] font-display text-[0.9rem] text-black placeholder:text-[#9c9c9c] resize-y"
                />
                {fieldErrors.message && (
                  <span className="font-display text-[0.7rem] text-[#c0392b]">
                    {fieldErrors.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="h-12 bg-accent text-white border-none rounded-[3px] font-display font-bold text-[1.1rem] cursor-pointer transition-transform duration-300 ease-out hover:scale-105 disabled:opacity-60 disabled:cursor-wait disabled:hover:scale-100 lg:self-start lg:px-10"
              >
                {sending ? 'Sending…' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
