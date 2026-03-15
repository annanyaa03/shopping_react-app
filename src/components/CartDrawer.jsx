import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { createCheckout } from '../api/shopify'
import '../styles/CartDrawer.css'

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, isOpen, setIsOpen } = useCart()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) return
    setLoading(true)
    const url = await createCheckout(items)
    if (url) {
      window.location.href = url
    } else {
      alert('Checkout is currently unavailable. Please try again later.')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          >
            <div className="cart-drawer__header">
              <h2 className="cart-drawer__title">Your Bag ({items.length})</h2>
              <button className="cart-drawer__close" onClick={() => setIsOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="cart-drawer__empty">
                <span className="cart-drawer__empty-icon">🛍️</span>
                <p>Your bag is empty</p>
                <button className="cart-drawer__continue" onClick={() => setIsOpen(false)}>
                  Keep Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-drawer__items">
                  {items.map(item => (
                    <motion.div
                      key={item.variantId}
                      className="cart-item"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                    >
                      <div className="cart-item__img">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="cart-item__info">
                        <p className="cart-item__title">{item.title}</p>
                        <p className="cart-item__variant">{item.variantTitle}</p>
                        <div className="cart-item__controls">
                          <div className="cart-item__qty">
                            <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                          </div>
                          <button className="cart-item__remove" onClick={() => removeItem(item.variantId)}>
                            Remove
                          </button>
                        </div>
                        <p className="cart-item__price">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="cart-drawer__footer">
                  <div className="cart-drawer__total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="cart-drawer__tax">Shipping & taxes calculated at checkout</p>
                  <motion.button
                    className={`cart-drawer__checkout ${loading ? 'loading' : ''}`}
                    onClick={handleCheckout}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Preparing Bag...' : 'Checkout →'}
                  </motion.button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
