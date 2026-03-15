import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import CountdownDrop from '../components/CountdownDrop'
import { fetchProducts } from '../api/shopify'
import '../styles/Home.css'

const CATEGORIES = [
  { label: 'Tops', sub: 'Blouses, Tanks & Knits', color: '#E8DDD0', tag: 'tops' },
  { label: 'Bottoms', sub: 'Trousers, Jeans & Skirts', color: '#DDD0C0', tag: 'bottoms' },
  { label: 'Dresses', sub: 'Midi, Maxi & Mini', color: '#D4C4B0', tag: 'dresses' },
  { label: 'Outerwear', sub: 'Coats, Blazers & Jackets', color: '#C9B99A', tag: 'outerwear' },
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
        <div className="categories__grid">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={`/shop?category=${cat.tag}`}
                className="category-card"
                style={{ '--cat-color': cat.color }}
              >
                <div className="category-card__content">
                  <span className="category-card__label">{cat.label}</span>
                  <span className="category-card__sub">{cat.sub}</span>
                </div>
                <span className="category-card__arrow">→</span>
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
          <Link to="/shop" className="section-link">View all →</Link>
        </div>

        {loading ? (
          <div className="product-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        ) : (
          <div className="product-grid">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
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
            <Link to="/sale" className="banner__cta">Shop the Sale →</Link>
          </div>
          <div className="banner__imgs">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" alt="Sale fashion" />
            <img src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&q=80" alt="Sale fashion" />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer container">
        <div className="footer__logo">DRIP<span>.</span></div>
        <p className="footer__tagline">Bold pieces for bold people.</p>
        <div className="footer__links">
          <a href="#">Instagram</a>
          <a href="#">TikTok</a>
          <a href="#">Pinterest</a>
          <a href="#">Sustainability</a>
          <a href="#">Careers</a>
        </div>
        <p className="footer__copy">© 2025 DRIP. All rights reserved. Built with Shopify Storefront API.</p>
      </footer>
    </main>
  )
}
