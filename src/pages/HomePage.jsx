import Hero from '../components/Hero'
import About from '../components/About'
import Marquee from '../components/Marquee'
import DrinksStrip from '../components/DrinksStrip'
import MenuCarousel from '../components/MenuCarousel'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Marquee />
      <DrinksStrip />
      <MenuCarousel />
      <Footer />
    </>
  )
}
