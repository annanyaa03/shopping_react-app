import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import CarbonBadge from './CarbonBadge'
import { getFallbackImage } from '../api/shopify'
import '../styles/ProductCard.css'

const TAG_COLORS = {
  new: { background: 'transparent', color: '#2A2420', border: '1.5px solid #2A2420' },
  bestseller: { background: '#C9B99A', color: '#2A2420', border: '1.5px solid #C9B99A' },
  limited: { background: '#2A2420', color: '#FDFCFB', border: '1.5px solid #2A2420' },
  sale: { background: '#8B7355', color: '#FDFCFB', border: '1.5px solid #8B7355' },
}

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart()
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)

  const fallbackImg = getFallbackImage(product.id, product.tags?.[0])
  const image = product.images?.edges?.[0]?.node?.url || fallbackImg
  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || 0)
  const currency = product.priceRange?.minVariantPrice?.currencyCode || 'USD'
  const firstVariant = product.variants?.edges?.[0]?.node
  const tag = product.tags?.[1] || product.tags?.[0]

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (firstVariant) {
      addItem(product, firstVariant)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link to={`/product/${product.handle}`} className="product-card__image-wrap">
        <motion.img
          src={image}
          alt={product.title}
          className="product-card__image"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onError={(e) => { e.target.src = fallbackImg }}
        />
        {product.rating && (
          <div className="product-card__rating-badge" style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'var(--background)', color: 'var(--text)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}>
            ★ {product.rating}
          </div>
        )}
        {tag && (
          <span
            className="product-card__tag"
            style={{
              background: TAG_COLORS[tag]?.background || 'transparent',
              color: TAG_COLORS[tag]?.color || '#2A2420',
              border: TAG_COLORS[tag]?.border || '1.5px solid #2A2420',
            }}
          >
            {tag.toUpperCase()}
          </span>
        )}
        {product.rating && (
          <div className="product-card__rating">
            ★ {product.rating}
          </div>
        )}
        {product.stock < 10 && (
          <div className="product-card__stock">
            Only {product.stock} left!
          </div>
        )}
        {product.carbonKg && (
          <div className="product-card__carbon">
            <CarbonBadge value={product.carbonKg} />
          </div>
        )}
        <motion.button
          className={`product-card__quick-add ${added ? 'added' : ''}`}
          onClick={handleAdd}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          whileTap={{ scale: 0.95 }}
        >
          {added ? '✓ Added!' : 'Quick Add'}
        </motion.button>
      </Link>
      <div className="product-card__info">
        <Link to={`/product/${product.handle}`}>
          <h3 className="product-card__title">{product.title}</h3>
        </Link>
        <div className="product-card__price-wrap">
          {product.compareAtPrice && (
            <span className="product-card__compare-at">
              ${parseFloat(product.compareAtPrice).toFixed(2)}
            </span>
          )}
          <p className="product-card__price">
            {currency === 'USD' ? '$' : currency}{price.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
