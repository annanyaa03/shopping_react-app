import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import CountdownDrop from '../components/CountdownDrop'
import { fetchProducts } from '../api/shopify'
import '../styles/Home.css'

const CATEGORIES = [
  { label: 'Tops', sub: 'Blouses, Tanks & Knits', image: 'https://images.pexels.com/photos/19203835/pexels-photo-19203835.jpeg', tag: 'tops' },
  { label: 'Bottoms', sub: 'Trousers, Jeans & Skirts', image: 'https://images.pexels.com/photos/18786724/pexels-photo-18786724.jpeg', tag: 'bottoms' },
  { label: 'Dresses', sub: 'Midi, Maxi & Mini', image: 'https://images.pexels.com/photos/12466602/pexels-photo-12466602.jpeg', tag: 'dresses' },
  { label: 'Outerwear', sub: 'Coats, Blazers & Jackets', image: 'https://images.pexels.com/photos/19169191/pexels-photo-19169191.jpeg', tag: 'outerwear' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts().then(products => {
      setFeatured(products.slice(0, 4))
      setLoading(false)
    })
  }, [])

  return (
    <main>
      <Hero />

      <CountdownDrop />

      {/* Categories */}
      <section className="categories container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Shop by Category
        </motion.h2>
        <div className="categories__bento">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.tag}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`bento-item bento-item--${cat.tag}`}
            >
              <Link
                to={`/shop?category=${cat.tag}`}
                className="bento-tile"
              >
                <motion.div 
                  className="bento-tile__img" 
                  style={{ backgroundImage: `url(${cat.image})` }}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="bento-tile__overlay">
                  <div className="bento-tile__content">
                    <span className="bento-tile__label">{cat.label}</span>
                    <span className="bento-tile__sub">{cat.sub}</span>
                  </div>
                  <div className="bento-tile__cta">
                    <span>Shop Collection</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured container">
        <div className="section-header">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Featured Drops
          </motion.h2>
          <Link to="/shop" className="section-link section-link--bold">View all →</Link>
        </div>

        {loading ? (
          <div className="product-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        ) : (
          <div className="product-grid">
            {featured.filter(p => !p.rating || p.rating >= 4.0).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="banner">
        <motion.div
          className="banner__inner container"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="banner__text">
            <p className="banner__eyebrow">Limited Time</p>
            <h2 className="banner__heading">Summer Sale<br />Up to 40% Off</h2>
            <p className="banner__callout">Dresses from $29 · Outerwear from $59</p>
            <Link to="/sale" className="banner__cta">Shop the Sale →</Link>
          </div>
          <div className="banner__imgs">
            <img src="https://images.unsplash.com/photo-1523350165414-082d792c90a1?w=800&q=80" alt="Summer collection" />
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" alt="Editorial look" />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer container">
        <div className="footer__inner">
          <div className="footer__top">
            <div className="footer__signup">
              <h3>Join the Drip List</h3>
              <p>Early access to drops and exclusive news.</p>
              <form className="footer__form">
                <input type="email" placeholder="Email address" required />
                <button type="submit">→</button>
              </form>
            </div>

            <div className="footer__nav">
              <div className="footer__brand">
                <div className="footer__logo">DRIP<span>.</span></div>
                <p className="footer__tagline">Bold pieces for bold people.</p>
              </div>
              <div className="footer__links">
                <div className="footer__nav-col">
                  <h4>Support</h4>
                  <a href="#">Size Guide</a>
                  <a href="#">Returns</a>
                  <a href="#">Contact</a>
                </div>
                <div className="footer__nav-col">
                  <h4>Company</h4>
                  <a href="#">Sustainability</a>
                  <a href="#">Careers</a>
                  <a href="#">Press</a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer__bottom">
            <div className="footer__socials">
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
              <a href="#" aria-label="Pinterest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12c.5 2.5 1.5 3.5 3 3.5s2.5-1 2.5-3-1.5-3.5-3-3.5-2.5 1-2.5 3z"/></svg>
              </a>
            </div>
            <div className="footer__trust">
              <div className="footer__badge">♻ Sustainability Badge</div>
              <div className="footer__payments">
                <span className="payment-icon">VISA</span>
                <span className="payment-icon">MC</span>
                <span className="payment-icon">PayPal</span>
              </div>
            </div>
            <p className="footer__copy">© 2025 DRIP. Built with Shopify Storefront API.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
