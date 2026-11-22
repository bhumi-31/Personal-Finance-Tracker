# 💰 Personal Finance Tracker

A full-stack personal finance management application with analytics, role-based access control, caching, and interactive charts.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Recharts, react-window, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Auth** | JWT (JSON Web Tokens) |
| **Docs** | Swagger / OpenAPI 3.0 |

---

## 📁 Project Structure

```
Personal-Finance-Tracker/
├── backend/
│   ├── src/
│   │   ├── config/        # DB and Redis connection
│   │   ├── db/            # Schema SQL + seed script
│   │   ├── middleware/    # auth, rateLimiter, validate, errorHandler
│   │   ├── routes/        # auth, transactions, analytics, categories, users
│   │   ├── app.js
│   │   ├── server.js
│   │   └── swagger.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Charts, Layout, Transaction, common
│   │   ├── contexts/      # AuthContext, ThemeContext
│   │   ├── pages/         # Dashboard, Transactions, Login, Register, Users
│   │   ├── services/      # api, authService, transactionService, etc.
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

---

## ⚙️ Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Redis 6+

---

## 🛠️ Local Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd Personal-Finance-Tracker
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL and Redis credentials
npm install
```

**`.env` values to configure:**

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_tracker

REDIS_URL=redis://localhost:6379

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 3. Create the database and seed demo data

```bash
# Create the database in psql
psql -U postgres -c "CREATE DATABASE finance_tracker;"

# Run seed (creates schema + demo users + 30 sample transactions)
npm run seed
```

### 4. Start the backend

```bash
npm run dev       # development (nodemon)
# or
npm start         # production
```

Backend runs on **http://localhost:5000**  
Swagger API Docs: **http://localhost:5000/api-docs**

### 5. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@demo.com | admin123 |
| **User** | user@demo.com | user123 |
| **Read-only** | readonly@demo.com | readonly123 |

**Role capabilities:**

| Feature | Admin | User | Read-only |
|---|---|---|---|
| View Dashboard & Analytics | ✅ | ✅ | ✅ |
| View Transactions | ✅ | ✅ | ✅ |
| Add / Edit / Delete Transactions | ✅ | ✅ | ❌ |
| View all users' transactions | ✅ | ❌ | ❌ |
| User Management page | ✅ | ❌ | ❌ |
| Change other users' roles | ✅ | ❌ | ❌ |

---

## 📡 API Reference

Full interactive docs available at `/api-docs` (Swagger UI).

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |

### Transactions
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/transactions` | All roles |
| GET | `/api/transactions/:id` | All roles |
| POST | `/api/transactions` | admin, user |
| PUT | `/api/transactions/:id` | admin, user |
| DELETE | `/api/transactions/:id` | admin, user |

**Query params for GET list:** `page`, `limit`, `type`, `category_id`, `start_date`, `end_date`, `search`

### Analytics
| Method | Endpoint | Access | Cache |
|---|---|---|---|
| GET | `/api/analytics/summary` | All roles | 15 min |
| GET | `/api/analytics/category-breakdown` | All roles | 15 min |
| GET | `/api/analytics/trends` | All roles | 15 min |
| GET | `/api/analytics/cache-stats` | All roles | — |

### Categories
| Method | Endpoint | Access | Cache |
|---|---|---|---|
| GET | `/api/categories` | All roles | 1 hour |

### Users *(Admin only)*
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users` | admin |
| PATCH | `/api/users/:id/role` | admin |

---

## ⚡ Performance Features

### Caching (Redis)
- **Analytics** data: cached for **15 minutes**
- **Category list**: cached for **1 hour**
- **Transaction lists**: cached for **5 minutes** (per user/filter combo)
- Cache is **invalidated** on every create/update/delete

### Rate Limiting
| Endpoint group | Limit |
|---|---|
| Auth (`/api/auth/*`) | 5 requests / 15 minutes |
| Transactions (`/api/transactions/*`) | 100 requests / hour |
| Analytics (`/api/analytics/*`) | 50 requests / hour |

### Frontend
- **Route-based code splitting** via `React.lazy()` + `React.Suspense`
- **Virtual scrolling** for transaction lists (`react-window`)
- **Debounced search** input (400 ms)
- **`useMemo`** for expensive calculations (totals, chart data transforms)
- **`useCallback`** for all event handlers and fetch functions

---

## 🔒 Security

- **Helmet.js** — sets secure HTTP headers (XSS protection, CSP, etc.)
- **Parameterized SQL queries** — prevents SQL injection
- **bcryptjs** (cost factor 12) — password hashing
- **JWT** — stateless authentication; role embedded in claims
- **Input validation** — `express-validator` on all write endpoints
- **RBAC middleware** — `authorize(...roles)` factory enforces permissions per route

---

## 📊 Charts

Three chart types on the Dashboard (Recharts):
1. **Pie chart** — expense distribution by category
2. **Line chart** — monthly income vs expense trend (last 12 months)
3. **Bar chart** — income vs expenses comparison per month

---

## 🧪 Development Scripts

### Backend
```bash
npm run dev    # start with nodemon
npm run seed   # reset DB + insert demo data
npm start      # production start
```

### Frontend
```bash
npm run dev      # Vite dev server
npm run build    # production build
npm run preview  # preview production build
```

