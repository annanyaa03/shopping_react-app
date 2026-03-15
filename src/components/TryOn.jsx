import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/TryOn.css'

export default function TryOn({ product, productImg }) {
    const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState(null)

    const handleFile = (e) => {
        const f = e.target.files[0]
        if (f) {
            setFile(f)
            setPreview(URL.createObjectURL(f))
            setFeedback(null)
        }
    }

    const generateFeedback = async () => {
        if (!file) return
        setLoading(true)

        // Simulate Vision API Call
        setTimeout(() => {
            setFeedback(`"Omg, this ${product.title} is literally made for you! The silhouette perfectly complements your frame, and that color pop is giving main character energy. 10/10 would recommend for your next big moment!"`)
            setLoading(false)
        }, 2500)
    }

    return (
        <div className="try-on-module">
            <button className="try-on-btn" onClick={() => setIsOpen(true)}>
                <span>✨</span> Try It On (AI)
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="try-on-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="try-on-modal"
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                        >
                            <button className="try-on-close" onClick={() => setIsOpen(false)}>×</button>

                            <div className="try-on-header">
                                <h2>Virtual Try-On</h2>
                                <p>Upload a photo to see how you'd rock the {product.title}.</p>
                            </div>

                            <div className="try-on-content">
                                <div className="upload-zone">
                                    {preview ? (
                                        <div className="preview-wrap">
                                            <img src={preview} alt="Selfie" className="selfie-preview" />
                                            <button className="change-photo" onClick={() => setPreview(null)}>Change Photo</button>
                                        </div>
                                    ) : (
                                        <label className="upload-label">
                                            <input type="file" accept="image/*" onChange={handleFile} hidden />
                                            <div className="upload-icon">📸</div>
                                            <span>Upload your photo</span>
                                        </label>
                                    )}
                                </div>

                                <div className="try-on-actions">
                                    <button
                                        className="generate-advice-btn"
                                        disabled={!file || loading}
                                        onClick={generateFeedback}
                                    >
                                        {loading ? 'Analyzing your vibe...' : 'Get Stylist Opinion'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {feedback && (
                                        <motion.div
                                            className="stylist-bubble"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <div className="bubble-icon">✨</div>
                                            <p className="bubble-text">{feedback}</p>
                                            <span className="disclaimer">AI-powered styling suggestion — for fun only!</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {loading && (
                                    <div className="loading-skeleton-wrap">
                                        <div className="skeleton-bubble" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
