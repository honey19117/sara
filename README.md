# ✧ AURA Luxe — Haute Living & Precision Tech E-Commerce Platform ✧

A complete, production-grade luxury e-commerce web platform built from scratch with an **Express.js REST API**, **SQLite Database**, **Real Razorpay Payment Gateway**, **Admin Control Console**, and a **React + Tailwind CSS** frontend.

---

## 🌟 Key Features

### 💎 Luxury Aesthetics & Design System
- **Dark Obsidian Palette (`#0B0F17`) & Champagne Gold Accents (`#D4AF37`)**: Typography using *Cinzel*, *Plus Jakarta Sans*, and *Playfair Display*.
- **Smooth Micro-interactions**: Hover zooms, badge tags, interactive rating stars, sliding luxury bag drawer, and purchase confetti.
- **Comprehensive State Management**: Skeleton loaders, animated empty states with CTAs, live toast notification stream, and modal dialogs.

### 🛍️ Storefront & Complete Page Set
- **Home**: Curated hero slider, category showcase, featured masterpieces, live flash deal countdown, connoisseur testimonials, and brand ethos.
- **Shop / Catalog**: Multi-faceted filter sidebar (categories, price slider, minimum rating, in-stock toggle), live instant search, multiple sorting options, grid/list switcher, and pagination.
- **Product Details**: Interactive multi-image gallery with thumbnail switcher, variant/size/color selectors, live stock indicator, quantity picker, SKU, accordion specs, and customer reviews.
- **Shopping Bag & Cart**: Real-time stock validation, quantity adjusters, promotional coupons (`WELCOME10`, `LUXE20`, `FLAT1500`, `AURAFIRST`), free shipping progress bar, and breakdown summary.
- **Private Wishlist**: Add/remove curations with 1-click "Move All to Bag".
- **Checkout**: Guest & authenticated checkout, saved address book, Indian 6-digit PIN code auto-fill, shipping options (Standard Ground vs 48-Hr Priority Air), GST tax breakdown, and **Real Razorpay Checkout integration**.
- **Order Tracking**: Visual 7-step progression stepper (`PENDING` → `CONFIRMED` → `PROCESSING` → `PACKED` → `SHIPPED` → `OUT FOR DELIVERY` → `DELIVERED`), waybill AWB number, carrier name, and live timestamps.
- **Client Dossier & Orders**: Profile editor, saved addresses CRUD, order history with instant cancellation and return/refund requests, and printable tax invoices.
- **Information & Legal**: About Atelier, Contact Concierge with interactive form, FAQ accordion, Shipping & Delivery Policy, Returns Policy, Privacy Policy, Terms & Conditions, and 404 Not Found.

### 🔒 Real Razorpay Payment Gateway
- **Backend Order Creation**: Server-side pricing recalculation, coupon validation, tax and shipping fee calculation.
- **Encrypted Checkout JS SDK**: Official Razorpay modal popup with luxury custom theme (`#D4AF37`).
- **Cryptographic Signature Verification**: Server-side HMAC-SHA256 signature verification (`crypto.createHmac('sha256', secret)`).
- **Atomic Stock Update**: Inventory automatically decrements only upon verified payment confirmation.
- **Failure & Retry Handling**: Graceful logging and retry workflows.

### 🛡️ Admin Control Console (`/admin`)
- **Executive Analytics**: Realized revenue metrics, total orders, active customer counts, low stock alerts, top-selling products, and recent orders.
- **Product Management**: Full CRUD with images, variants (sizes, colors, SKUs), price, compare price, and stock levels.
- **Order Management**: Transition orders across the 7 statuses, assign carrier names & tracking numbers, review cancellations, and approve return/refund requests.
- **Coupon Management**: Create percentage or fixed discount promo codes, usage limits, minimum order amounts, and active toggles.
- **Review Moderation**: Approve or delete customer feedback.
- **Store Settings**: Configure free shipping threshold, standard/express rates, and Razorpay `TEST`/`LIVE` mode.

---

## 🏗️ Architecture

```
aura-ecommerce/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/common/  # Navbar, Footer, ProductCard, CartDrawer, Modal, Spinner
│   │   ├── context/            # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── pages/              # Home, Shop, ProductDetail, Cart, Checkout, Admin, etc.
│   │   ├── services/           # api.js, razorpay.js
│   │   ├── utils/              # formatters.js (₹ INR currency, dates, order badges)
│   │   ├── App.jsx             # React Router routing
│   │   ├── main.jsx
│   │   └── index.css           # Luxury dark design tokens
│   ├── index.html              # Razorpay checkout script & typography fonts
│   └── vite.config.js          # API proxy to backend
│
├── server/                     # Backend (Node.js + Express REST API)
│   ├── src/
│   │   ├── config/             # db.js (SQLite), razorpay.js (SDK & HMAC verification)
│   │   ├── controllers/        # auth, product, cart, coupon, shipping, payment, order, admin
│   │   ├── db/                 # schema.sql, seed.js (23+ luxury products, demo data)
│   │   ├── middleware/         # auth.js (JWT & role checks), errorHandler.js
│   │   ├── routes/             # auth, product, category, cart, coupon, shipping, payment, order, admin
│   │   └── index.js            # Express server entry point & static serving
│   ├── .env                    # Environment variables
│   └── .env.example
│
├── .gitignore
├── README.md
└── package.json
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation & Database Seeding

Clone and install dependencies:
```bash
cd aura-ecommerce/server
npm install
npm run seed     # Initializes SQLite schema and seeds 23+ luxury products

cd ../client
npm install
```

### 3. Running in Development

**Terminal 1 (Backend Server on `http://localhost:5000`):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client on `http://localhost:5173`):**
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Executive Admin** | `admin@auraluxe.com` | `admin123` | Full Admin Console (`/admin`), Analytics, Product CRUD, Order Status Updates |
| **Private Customer** | `customer@auraluxe.com` | `customer123` | Saved Address Book, Order History, Checkout, Wishlist |

---

## 💳 Razorpay Gateway Configuration

In `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=aura_super_secure_jwt_secret_key_2026_luxury_ecommerce
JWT_EXPIRES_IN=7d

# Razorpay Sandbox Test Credentials
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=s9g2e4k9F1v3P7q8W2x5Z1y0
RAZORPAY_CURRENCY=INR
```

### Switching to LIVE Mode:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys).
2. Generate Live API Keys (`Key ID` and `Key Secret`).
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in production environment variables.
4. Set `NODE_ENV=production`.

---

## 🚀 Production Deployment

### Single-Server Full-Stack Deployment (Render / Railway / VPS)

The Express backend automatically serves the compiled static frontend in production if `client/dist` exists.

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```
2. Start the production server:
   ```bash
   cd ../server
   npm start
   ```
The unified app will run on port `5000` (or `process.env.PORT`) with full API routes on `/api/*` and SPA frontend routing on `/*`.

---

## 📄 License
MIT License. Handcrafted by AURA Luxe Engineering.
