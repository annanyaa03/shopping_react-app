import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import { fetchProducts } from '../api/shopify'
import '../styles/Shop.css'

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Tops', value: 'tops' },
  { label: 'Bottoms', value: 'bottoms' },
  { label: 'Dresses', value: 'dresses' },
  { label: 'Outerwear', value: 'outerwear' },
]

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'New Arrivals', value: 'new' },
]

export default function Shop({ defaultFilter = 'all' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('featured')
  const activeFilter = searchParams.get('category') || defaultFilter

  useEffect(() => {
    fetchProducts().then(products => {
      setProducts(products)
      setLoading(false)
    })
  }, [])

  const setFilter = (val) => {
    if (val === 'all') searchParams.delete('category')
    else searchParams.set('category', val)
    setSearchParams(searchParams)
  }

  const filtered = products.filter(p => {
    if (activeFilter === 'all') return true
    return p.tags.includes(activeFilter)
  })

  const sorted = [...filtered].sort((a, b) => {
    const pa = parseFloat(a.priceRange.minVariantPrice.amount)
    const pb = parseFloat(b.priceRange.minVariantPrice.amount)
    if (sort === 'price-asc') return pa - pb
    if (sort === 'price-desc') return pb - pa
    if (sort === 'new') return a.tags.includes('new') ? -1 : 1
    return 0
  })

  return (
    <main className="shop-page">
      <div className="shop-hero container">
        <motion.h1
          className="shop-hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {activeFilter === 'all' ? 'All Products' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
        </motion.h1>
        <motion.p
          className="shop-hero__count"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {sorted.length} items
        </motion.p>
      </div>

      <div className="shop-controls container">
        {/* Filter chips */}
        <div className="shop-filters">
          {FILTERS.map(f => (
            <motion.button
              key={f.value}
              className={`filter-chip ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Sort */}
        <select
          className="shop-sort"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="container">
        {loading ? (
          <div className="product-grid-shop">
            {[...Array(8)].map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="shop-empty">
            <p>No products found for this category yet.</p>
          </div>
        ) : (
          <motion.div className="product-grid-shop" layout>
            <AnimatePresence mode="popLayout">
              {sorted.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  )
}
