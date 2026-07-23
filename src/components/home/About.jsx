import './About.css'
import aboutImage from '../../assets/about.jpg'

const STATS = [
  { value: '2000+', label: 'Happy Customers' },
  { value: '100%', label: 'Quality assured' },
  { value: '10+', label: 'Branches' },
]

export default function About() {
  return (
    <section className="about" aria-label="About us">
      <div className="about__row">
        <div className="about__content">
          <h2 className="about__heading">ABOUT US</h2>

          <p className="about__body">
            Sugarloop was built around a simple focus: consistency, quality, and donuts done
            right. We believe great donuts come from getting the details right. From dough
            that&rsquo;s soft and light, to fillings that complement rather than overpower, and
            sweetness that feels just enough. Every donut is made fresh, every day simply because
            that&rsquo;s how it should be.
          </p>

          <dl className="about__stats">
            {STATS.map((stat) => (
              <div className="about__stat" key={stat.label}>
                <dt className="about__stat-value">{stat.value}</dt>
                <dd className="about__stat-label">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="about__image-wrap">
          <img src={aboutImage} alt="Sugarloop storefront" className="about__image" />
        </div>
      </div>
    </section>
  )
}
