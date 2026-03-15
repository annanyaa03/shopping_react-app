import { motion } from 'framer-motion'
import '../styles/CarbonBadge.css'

export default function CarbonBadge({ value, expanded = false }) {
    const getColor = (v) => {
        if (v < 5) return '#10b981' // Green
        if (v < 10) return '#f59e0b' // Yellow
        return '#ef4444' // Red
    }

    const color = getColor(value)

    if (!expanded) {
        return (
            <div className="carbon-badge" style={{ '--carbon-color': color }}>
                <span className="carbon-badge__icon">🌿</span>
                <span className="carbon-badge__value">{value}kg CO₂e</span>
            </div>
        )
    }

    return (
        <div className="carbon-expanded">
            <div className="carbon-expanded__header">
                <span className="carbon-expanded__icon" style={{ background: color }}>🌿</span>
                <div>
                    <h4 className="carbon-expanded__title">Sustainability Impact</h4>
                    <p className="carbon-expanded__subtitle">{value}kg CO₂e estimated footprint</p>
                </div>
            </div>

            <div className="carbon-chart">
                <div className="carbon-chart__labels">
                    <span>Your Item</span>
                    <span>{value}kg</span>
                </div>
                <div className="carbon-chart__bar-wrap">
                    <motion.div
                        className="carbon-chart__bar"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(value / 15) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>

                <div className="carbon-chart__labels carbon-chart__labels--avg">
                    <span>Industry Avg</span>
                    <span>12kg</span>
                </div>
                <div className="carbon-chart__bar-wrap carbon-chart__bar-wrap--avg">
                    <div className="carbon-chart__bar carbon-chart__bar--avg" style={{ width: '${(12 / 15) * 100}%' }} />
                </div>
            </div>

            <p className="carbon-expanded__footer">
                Higher carbon products typically involve more complex supply chains or non-organic materials.
                Aiming for {`<`} 5kg is our sustainability goal.
            </p>
        </div>
    )
}
