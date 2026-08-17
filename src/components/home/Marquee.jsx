// Infinite scrolling ticker: "SUGARLOOP ✦ SUGARLOOP ✦ ..."
// Duplicated content + CSS animation gives a seamless loop.


export default function Marquee() {
  const items = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="bg-[#1c2b3a] overflow-hidden py-[1.8rem]" aria-hidden="true">
      <div className="flex w-max animate-marquee-scroll">
        {[0, 1].map((copy) => (
          <div className="flex shrink-0" key={copy}>
            {items.map((i) => (
              <span
                className="inline-flex items-center gap-6 px-6 text-white font-display font-bold text-[0.9rem] tracking-[0.05em] whitespace-nowrap"
                key={`${copy}-${i}`}
              >
                SUGARLOOP <span className="text-accent">✦</span>
                
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
