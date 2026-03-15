import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((product, variant) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === variant.id)
      if (existing) {
        return prev.map(i => i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, {
        id: product.id,
        variantId: variant.id,
        title: product.title,
        variantTitle: variant.title,
        price: variant.price.amount,
        currency: variant.price.currencyCode,
        image: product.images.edges[0]?.node.url,
        quantity: 1,
      }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((variantId) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId))
  }, [])

  const updateQuantity = useCallback((variantId, qty) => {
    if (qty < 1) return removeItem(variantId)
    setItems(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity: qty } : i))
  }, [removeItem])

  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
