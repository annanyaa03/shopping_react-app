import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/CountdownDrop.css'

export default function CountdownDrop() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0
    })
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        // Hardcoded date 7 days from now
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
        <section className="countdown-drop container">
            <div className="countdown-banner">
                <div className="countdown-content">
                    <motion.h2
                        className="countdown-title"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                    >
                        Something big is coming.
                    </motion.h2>

                    <div className="countdown-timer">
                        {Object.entries(timeLeft).map(([unit, value]) => (
                            <div key={unit} className="timer-unit">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={value}
                                        initial={{ rotateX: -90, opacity: 0 }}
                                        animate={{ rotateX: 0, opacity: 1 }}
                                        exit={{ rotateX: 90, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
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
                            <input type="email" placeholder="Enter your email" required className="drop-input" />
                            <button type="submit" className="drop-submit">Get early access</button>
                        </form>
                    ) : (
                        <motion.div
                            className="drop-success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            ✓ You're on the list. Keep an eye on your inbox.
                        </motion.div>
                    )}
                </div>

                <div className="countdown-teaser">
                    <img
                        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=40"
                        alt="Teaser"
                        className="teaser-img"
                    />
                    <div className="teaser-overlay" />
                </div>
            </div>
        </section>
    )
}
