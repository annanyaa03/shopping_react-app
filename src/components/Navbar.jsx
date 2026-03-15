import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import SlotMachine from './SlotMachine'
import '../styles/Navbar.css'

export default function Navbar() {
  const { count, setIsOpen } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [slotOpen, setSlotOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-text">DRIP</span>
          <span className="navbar__logo-dot" />
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar__links">
          {['/', '/shop', '/outfit-builder', '/new', '/sale'].map((path, i) => {
            const labels = ['Home', 'Shop', 'AI Builder', 'New In', 'Sale']
            return (
              <li key={path}>
                <Link to={path} className={`navbar__link ${location.pathname === path ? 'active' : ''}`}>
                  {labels[i]}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          <motion.button
            className="navbar__surprise"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSlotOpen(true)}
          >
            SURPRISE ME 🛍️
          </motion.button>

          <button className="navbar__cart" onClick={() => setIsOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && (
              <motion.span
                className="navbar__cart-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={count}
              >
                {count}
              </motion.span>
            )}
          </button>

          <motion.button
            className="navbar__profile"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </motion.button>

          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={menuOpen ? 'open' : ''} />
          </button>
        </div>
      </div>

      <SlotMachine isOpen={slotOpen} onClose={() => setSlotOpen(false)} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {[['/', 'Home'], ['/shop', 'Shop'], ['/outfit-builder', 'AI Builder'], ['/new', 'New In'], ['/sale', 'Sale']].map(([path, label]) => (
              <Link key={path} to={path} className="navbar__mobile-link">{label}</Link>
            ))}
            {isAuthenticated ? (
              <button onClick={logout} className="navbar__mobile-link logout-btn">Logout</button>
            ) : (
              <Link to="/profile" className="navbar__mobile-link">My Profile</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
