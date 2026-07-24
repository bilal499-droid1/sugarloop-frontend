import { FaInstagram, FaLinkedin } from 'react-icons/fa'
import logo from '../assets/sugarLoop 1.png'

export default function Footer() {
  return (
    <footer
      className="bg-white border-t border-faq-border py-[clamp(1.5rem,4vw,2.5rem)] px-[clamp(1.5rem,5vw,4rem)]"
      aria-label="Footer"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <img src={logo} alt="Sugarloop" className="h-7 opacity-80" />
        <p className="m-0 text-[0.8rem] text-[#9a9a9a]">
          &copy; {new Date().getFullYear()} Sugarloop. All rights reserved.
        </p>
        <div className="flex items-center gap-4" aria-label="Social links">
          <a href="#" aria-label="Instagram" className="text-[#9a9a9a] no-underline text-[1.2rem] flex">
            <FaInstagram />
          </a>
          <a href="#" aria-label="LinkedIn" className="text-[#9a9a9a] no-underline text-[1.2rem] flex">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  )
}
