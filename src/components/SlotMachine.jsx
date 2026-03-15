import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchProducts } from '../api/shopify'
import { useCart } from '../context/CartContext'
import '../styles/SlotMachine.css'

export default function SlotMachine({ isOpen, onClose }) {
    const [products, setProducts] = useState([])
    const [spinning, setSpinning] = useState(false)
    const [results, setResults] = useState([])
    const { addItem } = useCart()

    useEffect(() => {
        fetchProducts().then(setProducts)
    }, [])

    const spin = () => {
        if (spinning || products.length === 0) return
        setSpinning(true)
        setResults([])

        setTimeout(() => {
            const res = [
                products[Math.floor(Math.random() * products.length)],
                products[Math.floor(Math.random() * products.length)],
                products[Math.floor(Math.random() * products.length)]
            ]
            setResults(res)
            setSpinning(false)
        }, 2000)
    }

    const addAllToCart = () => {
        results.forEach(p => {
            const variant = p.variants.edges[0].node
            addItem(p, variant)
        })
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="slot-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="slot-machine"
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 50 }}
                    >
                        <button className="slot-machine__close" onClick={onClose}>×</button>
                        <h2 className="slot-machine__title">Feeling Lucky? 🎰</h2>
                        <p className="slot-machine__subtitle">Spin to reveal your perfect outfit matches!</p>

                        <div className="slot-reels">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="slot-reel">
                                    <div className={`slot-reel__inner ${spinning ? 'spinning' : ''}`}>
                                        {spinning ? (
                                            <div className="reel-placeholder">✨</div>
                                        ) : results[i] ? (
                                            <motion.div
                                                className="reel-result"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <img src={results[i].images.edges[0].node.url} alt={results[i].title} />
                                                <p>{results[i].title}</p>
                                            </motion.div>
                                        ) : (
                                            <div className="reel-placeholder">?</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="slot-actions">
                            {!results.length ? (
                                <button
                                    className="slot-btn slot-btn--spin"
                                    onClick={spin}
                                    disabled={spinning}
                                >
                                    {spinning ? 'SPINNING...' : 'SPIN THE REELS'}
                                </button>
                            ) : (
                                <>
                                    <button className="slot-btn slot-btn--spin" onClick={spin}>SPIN AGAIN</button>
                                    <button className="slot-btn slot-btn--add" onClick={addAllToCart}>ADD ALL TO BAG</button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
