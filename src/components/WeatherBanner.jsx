import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './WeatherBanner.css'

const WEATHER_SUGGESTIONS = {
    hot: {
        label: '☀️ Hot & Sunny',
        message: "It's scorching outside —",
        suggestion: 'Shop Linen & Light Fabrics',
        filter: 'tops',
        color: '#FFD700',
        threshold: 30,
    },
    warm: {
        label: '🌤️ Warm Day',
        message: "Perfect weather for —",
        suggestion: 'Shop Dresses & Skirts',
        filter: 'dresses',
        color: '#FFB347',
        threshold: 20,
    },
    cool: {
        label: '🌥️ Cool Outside',
        message: "Layer up in style —",
        suggestion: 'Shop Blazers & Knits',
        filter: 'tops',
        color: '#74D7F7',
        threshold: 10,
    },
    cold: {
        label: '🧥 Cold Weather',
        message: "Bundle up beautifully —",
        suggestion: 'Shop Coats & Outerwear',
        filter: 'outerwear',
        color: '#B48EFF',
        threshold: 0,
    },
}

function getWeatherType(temp) {
    if (temp >= 30) return 'hot'
    if (temp >= 20) return 'warm'
    if (temp >= 10) return 'cool'
    return 'cold'
}

export default function WeatherBanner() {
    const [weather, setWeather] = useState(null)
    const [city, setCity] = useState('')
    const [loading, setLoading] = useState(true)
    const KEY = import.meta.env.VITE_OPENWEATHER_KEY

    useEffect(() => {
        if (!KEY || KEY === 'your_openweather_key_here') {
            console.warn("VITE_OPENWEATHER_KEY is missing. Add it to .env or Vercel settings.")
        }
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const res = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${KEY}`
                    )
                    const data = await res.json()
                    setWeather(data)
                    setCity(data.name)
                } catch {
                    setWeather(null)
                } finally {
                    setLoading(false)
                }
            },
            () => setLoading(false)
        )
    }, [])

    if (loading || !weather) return null

    const temp = Math.round(weather.main.temp)
    const type = getWeatherType(temp)
    const suggestion = WEATHER_SUGGESTIONS[type]

    return (
        <motion.div
            className="weather-banner"
            style={{ '--weather-color': suggestion.color }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="weather-banner__inner">
                <div className="weather-banner__left">
                    <span className="weather-banner__label">{suggestion.label}</span>
                    <span className="weather-banner__temp">{temp}°C in {city}</span>
                </div>
                <div className="weather-banner__center">
                    <p className="weather-banner__message">
                        {suggestion.message} <strong>{suggestion.suggestion}</strong>
                    </p>
                </div>

                <a href={`/shop?category=${suggestion.filter}`} className="weather-banner__cta">
                    Shop Now →
                </a>
            </div>
        </motion.div>
    )
}
