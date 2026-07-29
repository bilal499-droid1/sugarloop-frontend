import Hero from '../components/home/Hero'
import About from '../components/home/About'
import Marquee from '../components/home/Marquee'
import DrinksStrip from '../components/home/DrinksStrip'
import MenuCarousel from '../components/home/MenuCarousel'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <Hero />
      <MenuCarousel title="Featured Products" linkToCategory={false} />
      <Marquee short />
      <About />
      <Marquee />
      <DrinksStrip />
      <MenuCarousel />
      <Footer />
    </>
  )
}
