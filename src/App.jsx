import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductPage from './pages/ProductPage'
import OutfitBuilder from './pages/OutfitBuilder'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { AuthProvider } from './context/AuthContext'
import { clearProductCache } from './api/shopify'
import './styles/App.css'

// Bust old cache to ensure uniqueness filters apply to fresh data
clearProductCache()

function NewIn() {
  return <Shop defaultFilter="new" />
}

function Sale() {
  return <Shop defaultFilter="sale" />
}

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/new" element={<NewIn />} />
          <Route path="/sale" element={<Sale />} />
          <Route path="/outfit-builder" element={<OutfitBuilder />} />
          <Route path="/product/:handle" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
