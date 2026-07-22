import { FaInstagram, FaLinkedin } from 'react-icons/fa'
import './Footer.css'
import logo from '../assets/sugarLoop 1.png'

export default function Footer() {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="footer__inner">
        <img src={logo} alt="Sugarloop" className="footer__logo" />
        <p className="footer__copy">&copy; {new Date().getFullYear()} Sugarloop. All rights reserved.</p>
        <div className="footer__icons" aria-label="Social links">
          <a href="#" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="#" aria-label="LinkedIn">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  )
}
