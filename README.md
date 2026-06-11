# Bizz1 Digital — Business Hub (MERN Stack)

Full-stack MERN application for BizzOne Digital's internal business operations panel.

## Features
- **Login / Register** — JWT-based authentication, data isolated per user
- **Overview** — Dashboard with KPIs from all modules
- **Unit Economics** — Website pricing P&L, Meta Ads funnel, commission tracker
- **Rate Card** — Service pricing, markup, packages, capacity health
- **Payroll** — Employee roster, monthly salary tracking, compliance management
- **P&L Model** — Monthly revenue/cost tracking, CAC, LTV, retainer management
- **AI Advisor** — Claude-powered business advisor (reads live data)
- **Settings** — Exchange rates, work schedule config
- **MongoDB persistence** — All data auto-saves to database (replaces localStorage)

## Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
- **Frontend:** React 18, Vite
- **Database:** MongoDB

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bizz1hub
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=30d
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod
```

### 4. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

### 5. First Use

1. Click **"Create One"** to register a new account
2. Enter name, email, password (min 6 chars)
3. You'll be logged into the full Business Hub
4. All data auto-saves to MongoDB as you make changes

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, get JWT |
| GET | `/api/auth/me` | Get current user (auth required) |

### Data (all require JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | Load all business data |
| PUT | `/api/data` | Save all business data |
| PATCH | `/api/data/:section` | Save one section (cfg/ue/op/pay/biz) |
| DELETE | `/api/data` | Reset all data to defaults |

---

## Project Structure

```
bizz1-hub/
├── backend/
│   ├── server.js          # Express entry point
│   ├── config/db.js       # MongoDB connection
│   ├── middleware/auth.js  # JWT authentication
│   ├── models/
│   │   ├── User.js        # User model (bcrypt hashed passwords)
│   │   └── BusinessData.js # All business data per user
│   ├── routes/
│   │   ├── auth.js        # Register / Login / Profile
│   │   └── data.js        # CRUD for business data
│   ├── .env               # Environment config
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js     # Vite config with API proxy
│   ├── src/
│   │   ├── main.jsx       # React entry
│   │   ├── App.jsx        # Auth state + routing
│   │   ├── api.js         # API utility functions
│   │   ├── styles.css     # All panel styles
│   │   └── components/
│   │       ├── Login.jsx     # Login / Register form
│   │       └── Dashboard.jsx # Full business hub panel
│   └── package.json
└── README.md
```

## Data Model

All business data is stored in a single MongoDB document per user:

| Section | Description |
|---------|-------------|
| `cfg` | Exchange rates (USD/CAD, PKR/USD), work hours |
| `ue` | Unit economics — pricing, team, commissions, ad funnel |
| `op` | Rate card — services, markup, packages, role capacities |
| `pay` | Payroll — employees, monthly entries, compliance, roles/depts |
| `biz` | P&L model — revenue streams, costs, retainer clients, monthly snapshots |

---

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

The `dist/` folder can be served by Express or any static host.

### Serve from Express (single server)
Add to `backend/server.js` before the health check:
```javascript
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

### Environment Variables for Production
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bizz1hub
JWT_SECRET=generate_a_strong_random_string_here
JWT_EXPIRE=30d
NODE_ENV=production
```

---

## Security Notes
- Passwords are hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 30 days (configurable)
- Rate limiting on auth endpoints (20 requests / 15 min)
- General rate limiting (200 requests / 15 min)
- CORS restricted to localhost in development
- All data endpoints require valid JWT
