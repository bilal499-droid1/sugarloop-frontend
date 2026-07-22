import './Marquee.css'

// Infinite scrolling ticker: "SUGARLOOP ✦ SUGARLOOP ✦ ..."
// Duplicated content + CSS animation gives a seamless loop.
export default function Marquee() {
  const items = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div className="marquee__group" key={copy}>
            {items.map((i) => (
              <span className="marquee__item" key={`${copy}-${i}`}>
                SUGARLOOP <span className="marquee__dot">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
