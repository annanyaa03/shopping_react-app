import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchProducts } from '../api/shopify'
import { useCart } from '../context/CartContext'
import '../styles/OutfitBuilder.css'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

export default function OutfitBuilder() {
    const [products, setProducts] = useState([])
    const [selected, setSelected] = useState([])
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [productsLoading, setProductsLoading] = useState(true)
    const { addItem } = useCart()

    useEffect(() => {
        if (!GEMINI_KEY || GEMINI_KEY === 'your_gemini_key_here') {
            console.warn("VITE_GEMINI_KEY is missing. Add it to .env or Vercel settings.")
        }

        fetchProducts().then(p => {
            setProducts(p.slice(0, 9))
            setProductsLoading(false)
        })
    }, [])

    const toggleSelect = (product) => {
        setSelected(prev =>
            prev.find(p => p.id === product.id)
                ? prev.filter(p => p.id !== product.id)
                : prev.length < 3 ? [...prev, product] : prev
        )
    }

    const generateOutfit = async () => {
        if (selected.length === 0) return
        setLoading(true)
        setResult(null)

        const productList = selected.map(p => `- ${p.title}: ${p.description}`).join('\n')

        const prompt = `You are a high-end fashion stylist. A customer has selected these clothing items:\n${productList}\n\nCreate a complete outfit guide. Respond ONLY with a valid JSON object in this exact format with no markdown:\n{"outfitName":"string","vibe":"string","stylingTips":["tip1","tip2","tip3"],"completeTheLook":["accessory1","accessory2","accessory3"],"occasionIdeas":["occasion1","occasion2","occasion3"],"confidence":"string"}`

        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            )
            const data = await res.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
            const clean = text.replace(/```json|```/g, '').trim()
            const parsed = JSON.parse(clean)
            setResult(parsed)
        } catch (err) {
            setResult({ error: true })
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="outfit-builder">
            <div className="outfit-builder__hero container">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    AI Outfit Builder
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Pick up to 3 pieces — our AI stylist will build the perfect outfit around them
                </motion.p>
            </div>

            <div className="container">
                {/* Product Selection Grid */}
                <div className="outfit-builder__label">
                    Select up to 3 items ({selected.length}/3 selected)
                </div>
                <div className="outfit-builder__grid">
                    {productsLoading
                        ? [...Array(6)].map((_, i) => <div key={i} className="outfit-skeleton" />)
                        : products.map((product, i) => {
                            const isSelected = selected.find(p => p.id === product.id)
                            const isDisabled = !isSelected && selected.length >= 3
                            return (
                                <motion.div
                                    key={product.id}
                                    className={`outfit-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                    onClick={() => !isDisabled && toggleSelect(product)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={!isDisabled ? { scale: 1.03 } : {}}
                                    whileTap={!isDisabled ? { scale: 0.97 } : {}}
                                >
                                    <div className="outfit-item__img">
                                        <img src={product.images.edges[0]?.node.url} alt={product.title} />
                                        {isSelected && (
                                            <motion.div
                                                className="outfit-item__check"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                ✓
                                            </motion.div>
                                        )}
                                    </div>
                                    <p className="outfit-item__title">{product.title}</p>
                                    <p className="outfit-item__price">
                                        ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                                    </p>
                                </motion.div>
                            )
                        })}
                </div>

                {/* Generate Button */}
                <div className="outfit-builder__action">
                    <motion.button
                        className="outfit-builder__generate"
                        onClick={generateOutfit}
                        disabled={selected.length === 0 || loading}
                        whileHover={selected.length > 0 ? { scale: 1.03 } : {}}
                        whileTap={selected.length > 0 ? { scale: 0.97 } : {}}
                    >
                        {loading ? '✨ Styling your outfit...' : '✨ Generate My Outfit'}
                    </motion.button>
                </div>

                {/* Loading State */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            className="outfit-loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="outfit-loading__spinner" />
                            <p>Our AI stylist is curating your look...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Result */}
                <AnimatePresence>
                    {result && !loading && (
                        <motion.div
                            className="outfit-result"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {result.error ? (
                                <p className="outfit-result__error">Something went wrong. Please try again.</p>
                            ) : (
                                <>
                                    <div className="outfit-result__header">
                                        <h2 className="outfit-result__name">{result.outfitName}</h2>
                                        <p className="outfit-result__vibe">✦ {result.vibe}</p>
                                        <p className="outfit-result__confidence">{result.confidence}</p>
                                    </div>

                                    <div className="outfit-result__grid">
                                        <div className="outfit-result__section">
                                            <h3>Styling Tips</h3>
                                            <ul>
                                                {result.stylingTips?.map((tip, i) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                    >
                                                        {tip}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="outfit-result__section">
                                            <h3>Complete the Look</h3>
                                            <ul>
                                                {result.completeTheLook?.map((item, i) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                    >
                                                        {item}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="outfit-result__section">
                                            <h3>Occasion Ideas</h3>
                                            <ul>
                                                {result.occasionIdeas?.map((occasion, i) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                    >
                                                        {occasion}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="outfit-result__cta">
                                        <p>Love this outfit?</p>
                                        <motion.button
                                            className="outfit-result__add-all"
                                            onClick={() => selected.forEach(p => addItem(p, p.variants.edges[0].node))}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            Add All to Bag →
                                        </motion.button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    )
}
