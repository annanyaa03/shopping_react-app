import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'
import '../styles/Profile.css'

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Format date safely
  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : 'Recently'

  return (
    <main className="profile-page">
      <motion.div 
        className="profile-container container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">@{user?.username}</h1>
            <p className="profile-joined">Member since {joinedDate}</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Account Details</h2>
            <div className="profile-card">
              <div className="profile-detail">
                <span className="detail-label">Username</span>
                <span className="detail-value">{user?.username}</span>
              </div>
              <div className="profile-detail">
                <span className="detail-label">Tier</span>
                <span className="detail-value tier-badge">Silver Member</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Order History</h2>
            <div className="profile-card empty-state">
              <p>You haven't placed any orders yet.</p>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/shop')}
              >
                Start Shopping
              </button>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </motion.div>
    </main>
  )
}
