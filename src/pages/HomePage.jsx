import Hero from '../components/home/Hero'
import About from '../components/home/About'
import Marquee from '../components/home/Marquee'
import DrinksStrip from '../components/home/DrinksStrip'
import MenuCarousel from '../components/home/MenuCarousel'
import FeaturedProducts from '../components/home/FeaturedProducts'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Marquee short />
      <About />
      <Marquee short />
      <DrinksStrip />
      <MenuCarousel />
      <Footer />
    </>
  )
}
