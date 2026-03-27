import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/CountdownDrop.css'

export default function CountdownDrop() {
    const [isVisible, setIsVisible] = useState(false)
    const [timeLeft, setTimeLeft] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0
    })
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + 7)

        const timer = setInterval(() => {
            const now = new Date().getTime()
            const difference = targetDate.getTime() - now

            if (difference < 0) {
                clearInterval(timer)
            } else {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="countdown-overlay">
                    <motion.section 
                        className="countdown-drop-modal"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <button className="drop-close" onClick={() => setIsVisible(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="countdown-content">
                            <span className="countdown-eyebrow">New SS25 Collection drops in…</span>
                            <motion.h2
                                className="countdown-title"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Something big <br />is coming.
                            </motion.h2>

                            <div className="countdown-timer">
                                {Object.entries(timeLeft).map(([unit, value], i) => (
                                    <div key={unit} className="timer-unit">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={value}
                                                initial={{ y: 5, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -5, opacity: 0 }}
                                                className="timer-value"
                                            >
                                                {String(value).padStart(2, '0')}
                                            </motion.span>
                                        </AnimatePresence>
                                        <span className="timer-label">{unit.toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>

                            {!submitted ? (
                                <form className="drop-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                                    <input type="email" placeholder="Email address" required className="drop-input" />
                                    <button type="submit" className="drop-submit">Get Early Access</button>
                                </form>
                            ) : (
                                <motion.div
                                    className="drop-success"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    ✓ You'll be the first to know.
                                </motion.div>
                            )}
                        </div>

                        <div className="countdown-visual">
                            <img
                                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
                                alt="Coming Soon"
                                className="visual-img"
                            />
                            <div className="visual-overlay" />
                        </div>
                    </motion.section>
                </div>
            )}
        </AnimatePresence>
    )
}
