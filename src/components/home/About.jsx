import aboutImage from '../../assets/about.webp'

const STATS = [
  { value: '2000+', label: 'Happy Customers' },
  { value: '100%', label: 'Quality assured' },
  { value: '10+', label: 'Branches' },
]

export default function About() {
  return (
    <section
      className="bg-bg-section flex flex-col gap-[clamp(1.5rem,4vw,2.5rem)] py-[clamp(2.5rem,6vw,5rem)] px-[clamp(1.5rem,5vw,6rem)]"
      aria-label="About us"
    >
      <div className="grid grid-cols-[1.3fr_1fr] max-[900px]:grid-cols-1 gap-[clamp(2rem,5vw,4rem)] items-start">
        <div className="flex flex-col gap-[clamp(1.25rem,3vw,2rem)]">
          <h2 className="font-display font-bold text-[clamp(2.5rem,5vw,4.5rem)] m-0 tracking-[-0.02em] text-accent">
            ABOUT US
          </h2>

          <p className="text-text-body leading-[1.7] max-w-[42ch] m-0">
            Sugarloop was built around a simple focus: consistency, quality, and donuts done
            right. We believe great donuts come from getting the details right. From dough
            that&rsquo;s soft and light, to fillings that complement rather than overpower, and
            sweetness that feels just enough. Every donut is made fresh, every day simply because
            that&rsquo;s how it should be.
          </p>

          <dl className="flex max-[900px]:flex-wrap gap-[clamp(1.5rem,4vw,3.5rem)] m-0">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display font-bold text-stat leading-stat text-accent m-0">
                  {stat.value}
                </dt>
                <dd className="m-0 text-[0.9rem] text-accent">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl overflow-hidden aspect-[4/3]">
          <img src={aboutImage} alt="Sugarloop storefront" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  )
}
