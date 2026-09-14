import ShopNav from './products/ShopNav'
import Footer from './Footer'

/**
 * Shared shell for the two policy pages. They are plain prose on a white page —
 * no brand furniture beyond the nav and footer, because someone reading these is
 * looking for an answer, not for the shop.
 *
 * `sections` entries carry an `id` so a heading can be deep-linked
 * (/terms#refunds), the same way the FAQ page links its locations block.
 */
export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <>
      <ShopNav />

      <article className="font-display text-text-body max-w-[780px] mx-auto px-[clamp(1.25rem,5vw,2rem)] py-[clamp(2.5rem,6vw,4.5rem)]">
        <h1 className="m-0 font-black text-black text-[clamp(2rem,5vw,3rem)] leading-tight">
          {title}
        </h1>
        <p className="mt-2 mb-0 text-[0.85rem] text-[#9a9a9a]">Last updated {updated}</p>

        <p className="mt-6 mb-0 text-[1rem] leading-relaxed">{intro}</p>

        {/* Numbered so the clauses can be cited by number over the phone or in an
            email thread, which is how a bulk-order dispute actually gets settled. */}
        <ol className="list-none m-0 mt-10 p-0 flex flex-col gap-9">
          {sections.map((section, index) => (
            <li key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="m-0 mb-3 font-bold text-black text-[1.15rem]">
                {index + 1}. {section.heading}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-0 mb-3 last:mb-0 text-[0.95rem] leading-relaxed">
                  {paragraph}
                </p>
              ))}

              {section.list && (
                <ul className="mt-3 mb-0 pl-5 flex flex-col gap-2 text-[0.95rem] leading-relaxed">
                  {section.list.map((item) => (
                    <li key={item.slice(0, 40)}>{item}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </article>

      <Footer />
    </>
  )
}
