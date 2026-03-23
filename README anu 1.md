# 🛍️ Fashion Shop — Shopping React App

A modern, full-stack fashion e-commerce web app built with **React + Vite** and an **Express.js backend**. Features real product data, user authentication, a cart system, and some seriously cool UI touches like a weather-based outfit suggester and a slot machine discount reveal.

---

## ✨ Features

- 🔐 **User Auth** — Register & login with JWT + bcrypt password hashing
- 🛒 **Shopping Cart** — Add, remove, and manage items with a slide-out cart drawer
- 🧥 **Outfit Builder** — Mix and match outfits visually
- 🌦️ **Weather Banner** — Suggests clothing based on real-time local weather
- ⏳ **Countdown Drop** — Limited-time product drop timer
- 🎰 **Slot Machine** — Spin to reveal discount codes
- 🌿 **Carbon Badge** — Eco/sustainability indicator on products
- 👗 **Virtual Try-On** — Try-on feature for products
- 🔄 **Animated Page Transitions** — Smooth transitions with Framer Motion
- 📦 **Product API Integration** — Powered by FakeStore API + Shopify GraphQL

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Animations | Framer Motion |
| Backend | Express.js (Node) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| APIs | FakeStore API, Shopify Storefront GraphQL |
| Styling | Plain CSS (per-component stylesheets) |
| Deployment | Vercel |

---

## 📁 Project Structure

```
shopping_react-app/
├── backend/
│   ├── server.js        # Express server — auth endpoints
│   └── users.json       # Local user database (JSON file)
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── fakestoreapi.js   # FakeStore API helper functions
│   │   └── shopify.js        # Shopify GraphQL integration
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── CartDrawer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Hero.jsx
│   │   ├── WeatherBanner.jsx  # Weather-based outfit suggestions
│   │   ├── CountdownDrop.jsx  # Limited drop timer
│   │   ├── SlotMachine.jsx    # Discount reveal feature
│   │   ├── TryOn.jsx          # Virtual try-on
│   │   └── CarbonBadge.jsx    # Eco badge
│   ├── context/
│   │   ├── AuthContext.jsx    # Global auth state
│   │   └── CartContext.jsx    # Global cart state
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductPage.jsx
│   │   ├── OutfitBuilder.jsx
│   │   ├── Login.jsx
│   │   └── Profile.jsx
│   └── styles/              # Per-component CSS files
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/annanyaa03/shopping_react-app.git
cd shopping_react-app

# Install dependencies
npm install
```

### Running the App

**Frontend only:**
```bash
npm run dev
```

**Frontend + Backend together:**
```bash
npm run dev:full
```

The frontend runs at `http://localhost:5173`  
The backend runs at `http://localhost:5000`

### Build for Production
```bash
npm run build
```

---

## 🔌 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login and receive JWT token |

---

## ⚠️ Notes

- `curl.log` in the root directory should be added to `.gitignore` — it's a local debug file and shouldn't be committed
- `SECRET_KEY` in `server.js` should be moved to a `.env` file before deploying to production
- `users.json` acts as a local database — not suitable for production (use MongoDB or PostgreSQL instead)

---

## 🌐 Deployment

This project is configured for **Vercel** deployment via `vercel.json`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)

---

## 👩‍💻 Author

**Annanya** — [@annanyaa03](https://github.com/annanyaa03)

---

## 📄 License

This project is for educational purposes.
