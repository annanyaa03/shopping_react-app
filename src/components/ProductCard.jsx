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
        
        {/* Rating & Review Count */}
        {product.rating && (
          <div className="product-card__rating">
            <span className="star">★</span> {product.rating} <span className="reviews">({product.reviews || 0})</span>
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

        {/* Quick Add + Icon on Hover */}
        <motion.button
          className={`product-card__quick-add-btn ${added ? 'added' : ''}`}
          onClick={handleAdd}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {added ? '✓' : '+'}
        </motion.button>
      </Link>

      <div className="product-card__info">
        <div className="product-card__meta">
          <Link to={`/product/${product.handle}`}>
            <h3 className="product-card__title">{product.title}</h3>
          </Link>
          <div className="product-card__price">
            {currency === 'USD' ? '$' : currency}{price.toFixed(2)}
          </div>
        </div>

        {/* Color Swatches */}
        <div className="product-card__swatches">
          {product.variants?.edges?.slice(0, 4).map((variant, i) => (
            <div 
              key={i} 
              className="swatch-dot" 
              style={{ backgroundColor: variant.node.selectedOptions?.find(o => o.name === 'Color')?.value || '#ccc' }}
              title={variant.node.selectedOptions?.find(o => o.name === 'Color')?.value}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
