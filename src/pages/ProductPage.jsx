import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { fetchProductByHandle, getFallbackImage } from '../api/shopify'
import CarbonBadge from '../components/CarbonBadge'
import TryOn from '../components/TryOn'
import '../styles/ProductPage.css'

export default function ProductPage() {
  const { handle } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchProductByHandle(handle).then(p => {
      setProduct(p)
      setSelectedVariant(p?.variants.edges[0]?.node || null)
      setLoading(false)
    })
  }, [handle])

  const handleAdd = () => {
    if (product && selectedVariant) {
      addItem(product, selectedVariant)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  if (loading) return (
    <div className="product-page product-page--loading">
      <div className="product-page__skeleton-img" />
      <div className="product-page__skeleton-content">
        <div className="skeleton-line" style={{ width: '60%', height: 40 }} />
        <div className="skeleton-line" style={{ width: '30%', height: 28 }} />
        <div className="skeleton-line" style={{ width: '100%', height: 16 }} />
        <div className="skeleton-line" style={{ width: '90%', height: 16 }} />
      </div>
    </div>
  )

  if (!product) return (
    <div className="product-page container" style={{ paddingTop: 140, textAlign: 'center' }}>
      <h2>Product not found</h2>
      <Link to="/shop" style={{ textDecoration: 'underline', marginTop: 16, display: 'inline-block' }}>← Back to Shop</Link>
    </div>
  )

  const fallbackImg = getFallbackImage(product.id, product.tags?.[0])
  const image = product.images?.edges?.[0]?.node?.url || fallbackImg
  const price = parseFloat(selectedVariant?.price?.amount || product.priceRange?.minVariantPrice?.amount || 0)
  const tag = product.tags?.[1] || product.tags?.[0]

  return (
    <main className="product-page">
      {/* Breadcrumb */}
      <div className="product-page__breadcrumb container">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <span>{product.title}</span>
      </div>

      <div className="product-page__inner container">
        {/* Image */}
        <motion.div
          className="product-page__image-wrap"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={image}
            alt={product.title}
            className="product-page__image"
            onError={(e) => { e.target.src = fallbackImg }}
          />
          {tag && <span className="product-page__tag">{tag.toUpperCase()}</span>}
        </motion.div>

        {/* Info */}
        <motion.div
          className="product-page__info"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="product-page__meta">
            <div className="product-page__stars">
              ★★★★☆ <span>{product.rating} (128 reviews)</span>
            </div>
          </div>

          {product.brand && <div className="product-page__brand">{product.brand}</div>}
          <h1 className="product-page__title">{product.title}</h1>
          <div className="product-page__price-row">
            {product.compareAtPrice && (
              <span className="product-page__compare-at">${parseFloat(product.compareAtPrice).toFixed(2)}</span>
            )}
            <p className="product-page__price">${price.toFixed(2)}</p>
          </div>
          <p className="product-page__desc">{product.description}</p>

          {/* Variant Selector */}
          <div className="product-page__variants">
            <p className="product-page__label">
              Select Size / Color: <strong>{selectedVariant?.title}</strong>
            </p>
            <div className="product-page__variant-grid">
              {product.variants.edges.map(({ node }) => (
                <motion.button
                  key={node.id}
                  className={`variant-btn ${selectedVariant?.id === node.id ? 'active' : ''}`}
                  onClick={() => setSelectedVariant(node)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {node.title}
                </motion.button>
              ))}
            </div>
          </div>

          <TryOn product={product} productImg={image} />

          {/* Stock Warning */}
          {product.stock < 10 && (
            <div className="product-page__stock-warning">
              <span className="pulse-dot"></span>
              Only {product.stock} left in stock — order soon
            </div>
          )}

          {/* Add to Cart */}
          <motion.button
            className={`product-page__add ${added ? 'added' : ''}`}
            onClick={handleAdd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {added ? '✓ Added to Bag!' : 'Add to Bag'}
          </motion.button>

          {/* Outfit Soundtrack */}
          {product.spotifyPlaylistId && (
            <motion.div
              className="product-soundtrack"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="soundtrack-title">🎵 Wear this to...</h3>
              <div className="soundtrack-embed">
                <iframe
                  style={{ borderRadius: '12px' }}
                  src={`https://open.spotify.com/embed/playlist/${product.spotifyPlaylistId}?utm_source=generator`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allowFullScreen=""
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}

          {product.carbonKg && (
            <CarbonBadge value={product.carbonKg} expanded={true} />
          )}

          {/* Features */}
          <div className="product-page__features">
            {['Free shipping over $150', 'Free returns within 30 days', 'Sustainably made'].map(f => (
              <div key={f} className="product-page__feature">
                <span className="product-page__feature-icon">✓</span>
                {f}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
