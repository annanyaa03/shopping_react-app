import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import '../styles/Checkout.css'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  })

  const [errors, setErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    console.log('Checkout useEffect triggered, items length:', items.length)
    if (items.length === 0) {
      alert('Your cart is empty! Please add items to your cart before checking out.')
      navigate('/shop')
    }
  }, [items, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Name validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'

    // Address validation
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'

    // Payment validation
    if (!formData.cardNumber.replace(/\s/g, '')) newErrors.cardNumber = 'Card number is required'
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required'
    if (!formData.cvv) newErrors.cvv = 'CVV is required'
    if (!formData.nameOnCard.trim()) newErrors.nameOnCard = 'Name on card is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }))
    if (errors.cardNumber) {
      setErrors(prev => ({
        ...prev,
        cardNumber: ''
      }))
    }
  }

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value)
    setFormData(prev => ({
      ...prev,
      expiryDate: formatted
    }))
    if (errors.expiryDate) {
      setErrors(prev => ({
        ...prev,
        expiryDate: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      clearCart()
      navigate('/checkout/success')
    } catch (error) {
      console.error('Payment failed:', error)
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="checkout">
      <div className="checkout__container">
        {/* Header */}
        <motion.div
          className="checkout__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/shop" className="checkout__back">
            ← Back to Shop
          </Link>
          <h1 className="checkout__title">Checkout</h1>
        </motion.div>

        <div className="checkout__content">
          {/* Main Form */}
          <motion.form
            className="checkout__form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Contact Information */}
            <div className="checkout__section">
              <h2 className="checkout__section-title">Contact Information</h2>
              <div className="checkout__field">
                <label htmlFor="email" className="checkout__label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`checkout__input ${errors.email ? 'checkout__input--error' : ''}`}
                  placeholder="your@email.com"
                />
                {errors.email && <span className="checkout__error">{errors.email}</span>}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="checkout__section">
              <h2 className="checkout__section-title">Shipping Address</h2>
              <div className="checkout__field-group">
                <div className="checkout__field">
                  <label htmlFor="firstName" className="checkout__label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`checkout__input ${errors.firstName ? 'checkout__input--error' : ''}`}
                    placeholder="John"
                  />
                  {errors.firstName && <span className="checkout__error">{errors.firstName}</span>}
                </div>
                <div className="checkout__field">
                  <label htmlFor="lastName" className="checkout__label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`checkout__input ${errors.lastName ? 'checkout__input--error' : ''}`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <span className="checkout__error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="checkout__field">
                <label htmlFor="address" className="checkout__label">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`checkout__input ${errors.address ? 'checkout__input--error' : ''}`}
                  placeholder="123 Main Street"
                />
                {errors.address && <span className="checkout__error">{errors.address}</span>}
              </div>

              <div className="checkout__field-group">
                <div className="checkout__field">
                  <label htmlFor="city" className="checkout__label">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`checkout__input ${errors.city ? 'checkout__input--error' : ''}`}
                    placeholder="New York"
                  />
                  {errors.city && <span className="checkout__error">{errors.city}</span>}
                </div>
                <div className="checkout__field">
                  <label htmlFor="state" className="checkout__label">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`checkout__input ${errors.state ? 'checkout__input--error' : ''}`}
                    placeholder="NY"
                  />
                  {errors.state && <span className="checkout__error">{errors.state}</span>}
                </div>
                <div className="checkout__field">
                  <label htmlFor="zipCode" className="checkout__label">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`checkout__input ${errors.zipCode ? 'checkout__input--error' : ''}`}
                    placeholder="10001"
                  />
                  {errors.zipCode && <span className="checkout__error">{errors.zipCode}</span>}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="checkout__section">
              <h2 className="checkout__section-title">Payment Information</h2>

              <div className="checkout__field">
                <label htmlFor="nameOnCard" className="checkout__label">Name on Card</label>
                <input
                  type="text"
                  id="nameOnCard"
                  name="nameOnCard"
                  value={formData.nameOnCard}
                  onChange={handleInputChange}
                  className={`checkout__input ${errors.nameOnCard ? 'checkout__input--error' : ''}`}
                  placeholder="John Doe"
                />
                {errors.nameOnCard && <span className="checkout__error">{errors.nameOnCard}</span>}
              </div>

              <div className="checkout__field">
                <label htmlFor="cardNumber" className="checkout__label">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  className={`checkout__input ${errors.cardNumber ? 'checkout__input--error' : ''}`}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
                {errors.cardNumber && <span className="checkout__error">{errors.cardNumber}</span>}
              </div>

              <div className="checkout__field-group">
                <div className="checkout__field">
                  <label htmlFor="expiryDate" className="checkout__label">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleExpiryChange}
                    className={`checkout__input ${errors.expiryDate ? 'checkout__input--error' : ''}`}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                  {errors.expiryDate && <span className="checkout__error">{errors.expiryDate}</span>}
                </div>
                <div className="checkout__field">
                  <label htmlFor="cvv" className="checkout__label">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className={`checkout__input ${errors.cvv ? 'checkout__input--error' : ''}`}
                    placeholder="123"
                    maxLength="4"
                  />
                  {errors.cvv && <span className="checkout__error">{errors.cvv}</span>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="checkout__submit"
              disabled={isProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
                <div className="checkout__loading">
                  <div className="checkout__spinner"></div>
                  Processing...
                </div>
              ) : (
                `Complete Order • $${total.toFixed(2)}`
              )}
            </motion.button>
          </motion.form>

          {/* Order Summary */}
          <motion.div
            className="checkout__summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="checkout__summary-title">Order Summary</h2>

            <div className="checkout__items">
              {items.map((item) => (
                <div key={item.id} className="checkout__item">
                  <div className="checkout__item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="checkout__item-details">
                    <h3 className="checkout__item-title">{item.title}</h3>
                    <p className="checkout__item-price">${item.price.toFixed(2)}</p>
                    <p className="checkout__item-quantity">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout__totals">
              <div className="checkout__total-row">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="checkout__total-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="checkout__total-row">
                <span>Tax</span>
                <span>${(total * 0.08).toFixed(2)}</span>
              </div>
              <div className="checkout__total-row checkout__total-row--final">
                <span>Total</span>
                <span>${(total + total * 0.08).toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout__security">
              <div className="checkout__security-icon">🔒</div>
              <span>Secure checkout with SSL encryption</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}