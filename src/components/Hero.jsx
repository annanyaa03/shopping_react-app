import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import '../styles/Hero.css'

const MARQUEE_ITEMS = ['NEW ARRIVALS', '☆', 'FREE SHIPPING OVER $150', '★', 'SUSTAINABLE FASHION', '☆', 'SHOP NOW', '★']


const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80"
];

export default function Hero() {
  const [images, setImages] = useState(FALLBACK_IMAGES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;
        if (!UNSPLASH_KEY || UNSPLASH_KEY === 'your_unsplash_access_key_here') throw new Error("Missing Key");

        const res = await fetch(`https://api.unsplash.com/photos/random?query=clean+girl+fashion+editorial+minimal&count=3&orientation=portrait&client_id=${UNSPLASH_KEY}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length >= 3) {
          setImages(data.map(img => img.urls.regular));
        }
      } catch (err) {
        console.warn("Failed to fetch fresh Unsplash images for Hero. Using fallbacks.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <section className="hero">
      {/* Background blobs */}
      <div className="hero__blob hero__blob--lime" />
      <div className="hero__blob hero__blob--coral" />
      <div className="hero__blob hero__blob--sky" />

      <div className="hero__content container">
        <motion.div
          className="hero__text"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero__eyebrow">
            <span className="hero__dot" />
            Spring / Summer 2025
          </div>
          <h1 className="hero__heading">
            Dress like<br />
            you <span className="hero__accent">mean it</span><span className="hero__period">.</span>
          </h1>
          <p className="hero__sub">
            Bold pieces for bold people. Sustainably made, relentlessly stylish.
          </p>
          <div className="hero__ctas">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/shop" className="hero__cta hero__cta--primary">Shop Now →</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/new" className="hero__cta hero__cta--secondary">New In</Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="hero__image-grid"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero__img hero__img--large">
            <AnimatePresence mode="wait">
              <motion.img
                key={images[0]}
                src={images[0]}
                alt="Fashion hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 1 }}
              />
            </AnimatePresence>
            <div className="hero__img-tag">TRENDING</div>
          </div>
          <div className="hero__img-stack">
            <div className="hero__img hero__img--small">
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[1]}
                  src={images[1]}
                  alt="Fashion"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoading ? 0 : 1 }}
                  transition={{ duration: 1, delay: 0.1 }}
                />
              </AnimatePresence>
            </div>
            <div className="hero__img hero__img--small hero__img--offset">
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[2]}
                  src={images[2]}
                  alt="Fashion"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoading ? 0 : 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="hero__marquee">
        <div className="hero__marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="hero__marquee-item">{item}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
