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
          DRIP<span>.</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar__links">
          {[
            { path: '/shop', label: 'Shop' },
            { path: '/outfit-builder', label: 'AI Builder' },
            { path: '/new', label: 'New In' },
            { path: '/sale', label: 'Sale' }
          ].map(({ path, label }, i) => (
            <li key={path}>
              <Link to={path} className={`navbar__link ${location.pathname === path ? 'active' : ''}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          <motion.button
            className="navbar__surprise"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSlotOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Discover
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
            {[['/shop', 'Shop'], ['/outfit-builder', 'AI Builder'], ['/new', 'New In'], ['/sale', 'Sale']].map(([path, label]) => (
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
