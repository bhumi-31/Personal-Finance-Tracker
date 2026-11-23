# 💰 FINTRACK — Personal Finance Tracker

> A production-grade, full-stack Personal Finance Management Platform and Analytics Engine engineered with React 18, Express.js, PostgreSQL, Redis caching, and interactive Recharts data visualization. Built with Role-Based Access Control (RBAC), multi-tier caching with event-driven invalidation, API rate-limiting, and an industrial Neo-Brutalist UI.

### 🔄 Core Financial Data Flow
$$\text{Transaction Inflow / Outflow} \longrightarrow \text{Category Allocation} \longrightarrow \text{PostgreSQL ACID Ledger} \longrightarrow \text{Redis Multi-Tier Cache} \longrightarrow \text{Real-Time Visual Analytics}$$

[![React 18](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-8.x-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![JWT](https://img.shields.io/badge/JWT-Stateless-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Swagger](https://img.shields.io/badge/OpenAPI-Swagger_3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://personal-finance-tracker-34fa.onrender.com/api-docs/)
[![Recharts](https://img.shields.io/badge/Recharts-2.10-22B5BF?style=for-the-badge)](https://recharts.org)

---

## 🚀 Live Deployment

| Resource | URL |
|:---|:---|
| **Live Application** | [https://personal-finance-tracker-flame-chi.vercel.app/](https://personal-finance-tracker-flame-chi.vercel.app/) |
| **Interactive Swagger API Docs** | [https://personal-finance-tracker-34fa.onrender.com/api-docs/](https://personal-finance-tracker-34fa.onrender.com/api-docs/) |
| **Backend API** | [https://personal-finance-tracker-34fa.onrender.com](https://personal-finance-tracker-34fa.onrender.com) |
| **GitHub Repository** | [https://github.com/bhumi-31/Personal-Finance-Tracker](https://github.com/bhumi-31/Personal-Finance-Tracker) |

### Cloud Infrastructure

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL
- **Cache:** Upstash Redis

### Production Environment Variables

Configure the following variables on Render:

```env
DATABASE_URL=your_neon_postgresql_connection_string
REDIS_URL=your_upstash_redis_connection_string
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
CLIENT_URL=https://personal-finance-tracker-flame-chi.vercel.app
```

Configure the following variable on Vercel:

```env
VITE_API_URL=https://personal-finance-tracker-34fa.onrender.com
```

Deploy the backend with:

```bash
npm install
npm run seed
npm start
```

For the frontend, use Vite as the framework preset with `frontend` as the root directory.

---

## 📸 Screenshots & UI Showcase

| Screen | Preview |
|:---|:---|
| **Auth Portal & Quick Role Switcher** | ![Auth Portal](docs/screenshots/login.png) |
| **Financial Computation Dashboard** | ![Financial Computation Dashboard](docs/screenshots/dashboard.png) |
| **Transactions Ledger Matrix** | ![Transactions Ledger Matrix](docs/screenshots/transactions.png) |
| **User Access & RBAC Matrix** | ![User Access & RBAC Matrix](docs/screenshots/users.png) |

---

### ✨ Key Technical Highlights

- **🔐 Strict Role-Based Access Control (RBAC)**:
  - Three distinct user roles (`admin`, `user`, `read-only`) enforced via backend JWT middleware (`authorize`) and conditional frontend UI rendering.
  - `admin`: Full system oversight, cross-user transaction access, and user role management.
  - `user`: Isolated personal CRUD capabilities over their own transactions and metrics.
  - `read-only`: View-only access with all write operations (`POST`, `PUT`, `DELETE`) blocked server-side and mutation buttons hidden on the UI.
- **⚡ Two-Tier Redis Caching with Event Invalidation**:
  - Analytics calculations cached for **15 minutes**; category taxonomies cached for **1 hour**.
  - Cache is invalidated on transaction mutation (`CREATE`, `UPDATE`, `DELETE`) across user-scoped and administrative keys.
  - Live Redis cache telemetry widget on the dashboard displaying hits, misses, and hit rate percentage.
- **🛡️ Security & Attack Hardening**:
  - **SQL Injection Prevention**: 100% parameterized queries using PostgreSQL `$1, $2` placeholders.
  - **XSS & Header Protection**: Helmet.js setting strict Content-Security-Policy, anti-clickjacking, and sniffing protections.
  - **Rate Limiting**: `express-rate-limit` endpoint buckets (Auth: 5 requests / 15m; Transactions: 100 / hr; Analytics: 50 / hr).
- **🎨 Neo-Brutalist Industrial UI**:
  - Dot-matrix canvas background, bold industrial yellow accents (`#FFB800`), chunky black borders (`2.5px solid #000`), and zero-blur hard drop shadows (`4px 4px 0px #000`). Zero casual emojis.

---

## 📐 System Architecture & Data Flow

```mermaid
flowchart TB
    subgraph Client["React 18 + Vite Frontend (Port 3000)"]
        UI["Neo-Brutalist Dashboard & Quick Role Switcher"]
        VIRT["Virtualized Transaction Table (react-window)"]
        CHARTS["Recharts Engine (Pie, Line, Bar)"]
        AUTH_CTX["AuthContext & ThemeContext"]
    end

    subgraph Backend["Express.js API Gateway (Port 5001)"]
        RL["Rate Limiters (Auth: 5/15m, Txn: 100/h, Analytics: 50/h)"]
        AUTH_MW["JWT Authentication & RBAC Middleware"]
        VAL["Express-Validator Input Sanitization"]
        CTRL_AUTH["Auth Controller"]
        CTRL_TXN["Transaction Controller"]
        CTRL_ANL["Analytics Controller"]
        CTRL_CAT["Category Controller"]
        CTRL_USR["User Controller"]
        CACHE_LAYER["Redis Caching Layer (15m Analytics / 1h Categories)"]
    end

    subgraph Cache["Redis In-Memory Data Store (Port 6379)"]
        R_ANL["analytics:*:* (15 min TTL)"]
        R_CAT["categories:all (1 hour TTL)"]
        R_TXN["txn:*:* (5 min TTL)"]
    end

    subgraph Database["PostgreSQL Database (Port 5432)"]
        TBL_USR[("users (UUID, Role)")]
        TBL_CAT[("categories (ID, Type, Icon)")]
        TBL_TXN[("transactions (UUID, FKs, ACID)")]
    end

    UI -->|Bearer JWT Requests| RL
    RL --> AUTH_MW
    AUTH_MW --> VAL
    VAL --> CTRL_AUTH & CTRL_TXN & CTRL_ANL & CTRL_CAT & CTRL_USR
    
    CTRL_ANL & CTRL_CAT & CTRL_TXN <-->|Check / Set Cache| CACHE_LAYER
    CACHE_LAYER <--> Cache
    
    CTRL_TXN -->|Invalidate Cache Keys| CACHE_LAYER
    CTRL_AUTH & CTRL_TXN & CTRL_ANL & CTRL_CAT & CTRL_USR <-->|Parameterized SQL| Database
```

---

## 🗄️ Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ transactions : "logs and owns"
    categories ||--o{ transactions : "classifies"

    users {
        uuid id PK "gen_random_uuid()"
        string email UK "NOT NULL"
        string password_hash "NOT NULL (bcrypt)"
        string name "NOT NULL"
        string role "DEFAULT 'user' CHECK ('admin','user','read-only')"
        timestamptz created_at "DEFAULT NOW()"
        timestamptz updated_at "DEFAULT NOW()"
    }

    categories {
        serial id PK "Auto Increment"
        string name UK "NOT NULL"
        string type "CHECK ('income', 'expense')"
        string icon "Monospace / Text Tag"
    }

    transactions {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "REFERENCES users(id) ON DELETE CASCADE"
        int category_id FK "REFERENCES categories(id) ON DELETE RESTRICT"
        string type "CHECK ('income', 'expense')"
        decimal amount "CHECK (amount > 0)"
        text description "Nullable memo"
        date date "NOT NULL"
        timestamptz created_at "DEFAULT NOW()"
        timestamptz updated_at "DEFAULT NOW()"
    }
```

---

## 💻 Tech Stack Specifications

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| **Frontend Framework** | React | `^18.2.0` | Declarative component hierarchy and hooks |
| **Build Tooling** | Vite | `^5.4.0` | Hot Module Replacement (HMR) & production bundling |
| **State & Context** | React Context API | React 18 | Global user authentication & industrial light/dark modes |
| **Virtualization** | `react-window` | `^1.8.10` | High-performance virtualized rendering for large lists |
| **Data Visualization**| Recharts | `^2.10.0` | SVG-based responsive Pie, Line, and Bar charts |
| **HTTP Client** | Axios | `^1.6.0` | Request/response interceptors for automatic JWT injection |
| **Backend Runtime** | Node.js | `>= 20.x` | Scalable JavaScript runtime |
| **Backend Framework** | Express.js | `^5.3.0` | MVC modular API router and controller architecture |
| **Relational Database**| PostgreSQL | `14+ / 16` | ACID relational storage, indexes, and UUID keys |
| **Caching Layer** | Redis / Node-Redis | `^4.7.0` | In-memory key-value caching with expiration and invalidation |
| **Security & Headers**| Helmet.js + CORS | `^8.3.0` | Defensive HTTP headers, frame protection, XSS guard |
| **Authentication** | JSON Web Tokens | `^9.0.2` | Stateless cryptographic token claims (`id`, `email`, `role`) |
| **Password Hashing** | Bcrypt.js | `^2.4.3` | Salt rounds = 12 cryptographic hashing |
| **API Documentation** | Swagger / OpenAPI | `^6.2.8` | Interactive API sandbox rendered via Swagger-UI |

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: `>= 18.x` (Recommended: Node 20+)
- **PostgreSQL**: `14+` running on port `5432`
- **Redis**: `6+` running on port `6379`
- **Git**

---

### Step 1: Clone Repository

```bash
git clone https://github.com/bhumi-31/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker
```

---

### Step 2: Database Initialization

Launch your PostgreSQL CLI (`psql`) or Postgres.app and create the database:

```sql
CREATE DATABASE finance_tracker;
```

---

### Step 3: Backend Setup & Environment Configuration

```bash
cd backend
cp .env.example .env
npm install
```

Configure `backend/.env`:
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_tracker
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

> **Note on Port 5001**: On macOS, port `5000` is reserved by the OS for AirPlay / AirTunes (`commplex-main`). The backend runs on port **`5001`** to avoid system interception.

---

### Step 4: Run Database Seed (Users & Transactions)

Execute the idempotent database schema and seed script:

```bash
npm run seed
```

*Output:*
```text
✅ Schema created successfully
✅ User created: admin@demo.com (admin)
✅ User created: user@demo.com (user)
✅ User created: readonly@demo.com (read-only)
✅ Created 45 sample transactions across all roles
🎉 Seed completed successfully!
```

Start the backend API server:
```bash
npm run dev
# Server running on http://localhost:5001
# Swagger Docs live on http://localhost:5001/api-docs
```

---

### Step 5: Frontend Setup & Launch

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

*Frontend will launch instantly on:* **`http://localhost:3000`**

---

## 🔐 Demo Credentials & RBAC Matrix

Use the one-click **Quick Role Selector** buttons on the Login Portal or enter credentials manually:

| Role | Email | Password | Permissions & Capabilities |
|:-----|:------|:---------|:---------------------------|
| **Admin** | `admin@financetracker.com` | `Admin@123` | Full privileges: cross-user ledger access, user role elevation, and CRUD. |
| **User** | `user@financetracker.com` | `User@123` | Personal CRUD operations: manage own transactions & view personal analytics. |
| **Read-Only**| `readonly@financetracker.com`| `Readonly@123` | View-only: analytics dashboards & ledger reading. Mutations blocked. |

Additional short-demo credentials are also seeded:

| Role | Email | Password |
|:-----|:------|:---------|
| **Admin** | `admin@demo.com` | `admin123` |
| **User** | `user@demo.com` | `user123` |
| **Read-Only** | `readonly@demo.com` | `readonly123` |

### Role Permissions Enforcement Table

| Action / Route | Endpoint | Admin | User | Read-Only |
|:---|:---|:---:|:---:|:---:|
| **View Analytics & Dashboards** | `GET /api/analytics/*` | ✅ | ✅ (Own) | ✅ (Own) |
| **View Transactions Ledger** | `GET /api/transactions` | ✅ (All) | ✅ (Own) | ✅ (Own) |
| **Create Transaction** | `POST /api/transactions` | ✅ | ✅ | ❌ *(403 Forbidden)* |
| **Update Transaction** | `PUT /api/transactions/:id` | ✅ | ✅ (Own) | ❌ *(403 Forbidden)* |
| **Delete Transaction** | `DELETE /api/transactions/:id` | ✅ | ✅ (Own) | ❌ *(403 Forbidden)* |
| **View User Registry** | `GET /api/users` | ✅ | ❌ *(403 Forbidden)* | ❌ *(403 Forbidden)* |
| **Elevate User Roles** | `PATCH /api/users/:id/role` | ✅ | ❌ *(403 Forbidden)* | ❌ *(403 Forbidden)* |

---

## ⚡ Caching & Performance Telemetry

### Redis Cache Architecture

1. **Analytics Summary & Trends (`GET /api/analytics/*`)**:
   - Cached per user session for **15 minutes** (`TTL = 900s`).
   - Cache Key Schema: `analytics:<userId>:<period>:<year>:<month>`.
2. **Category Master Lists (`GET /api/categories`)**:
   - Cached globally for **1 hour** (`TTL = 3600s`).
   - Cache Key Schema: `categories:all`.
3. **Transaction Lists (`GET /api/transactions`)**:
   - Cached per filter state for **5 minutes** (`TTL = 300s`).
4. **Automated Invalidation**:
   - Any transaction creation, modification, or deletion triggers cache invalidation via Redis pattern deletion (`del`), instantly refreshing live analytics.

### Live Telemetry Dashboard Widget

The frontend Dashboard incorporates a real-time **Cache Performance Bar** querying `GET /api/analytics/cache-stats`:
* **Hit Rate**: Real-time hit ratio `(hits / total_queries) * 100`.
* **Hits vs. Misses Counter**: Live inspection of cache effectiveness.
* **Connection Status**: Real-time heartbeat checking Redis port 6379.

---

## 📡 API Reference & Swagger Documentation

Interactive OpenAPI 3.0 documentation is served at:
- **Production:** [https://personal-finance-tracker-34fa.onrender.com/api-docs/](https://personal-finance-tracker-34fa.onrender.com/api-docs/)
- **Local development:** `http://localhost:5001/api-docs`

| Method | Route | Description | Auth | Rate Limit |
|:---|:---|:---|:---:|:---:|
| `POST` | `/api/auth/register` | Register new user account | Public | 5 req / 15m |
| `POST` | `/api/auth/login` | Authenticate credentials & issue JWT | Public | 5 req / 15m |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated user | Bearer JWT | — |
| `GET` | `/api/transactions` | List paginated & filtered transactions | Bearer JWT | 100 req / hr |
| `GET` | `/api/transactions/:id` | Query single transaction by UUID | Bearer JWT | 100 req / hr |
| `POST` | `/api/transactions` | Insert new income/expense record | ADMIN, USER | 100 req / hr |
| `PUT` | `/api/transactions/:id` | Update existing transaction record | ADMIN, USER | 100 req / hr |
| `DELETE`| `/api/transactions/:id`| Purge transaction record from ledger | ADMIN, USER | 100 req / hr |
| `GET` | `/api/categories` | Retrieve category master list (1h cache) | Bearer JWT | — |
| `GET` | `/api/analytics/summary` | Query financial totals (income, expense, balance) | Bearer JWT | 50 req / hr |
| `GET` | `/api/analytics/category-breakdown` | Expense breakdown by category for Pie Chart | Bearer JWT | 50 req / hr |
| `GET` | `/api/analytics/trends` | 12-month income vs. expense timeline data | Bearer JWT | 50 req / hr |
| `GET` | `/api/analytics/cache-stats` | Real-time Redis hit/miss telemetry statistics | Bearer JWT | — |
| `GET` | `/api/users` | List all registered users (Admin only) | ADMIN | — |
| `PATCH`| `/api/users/:id/role` | Elevate or modify user role (Admin only) | ADMIN | — |

---

## 🎯 Assignment Rubric Fulfillment

| Evaluation Parameter | Spec Expectation | Implementation Details |
|:---|:---|:---|
| **User Authentication & RBAC** | JWT authentication, role model, route protection | JWT token signing, `authorize` middleware, 3 demo roles, and frontend conditional rendering. |
| **Transaction Management** | Full CRUD, categorization, filters, read-only guard | Validated CRUD routes, foreign key constraints, debounced search, and date pickers. |
| **Dashboard & Analytics** | Overview metrics, 3 interactive charts, multi-role | Recharts Pie, Line, and Bar charts with live year/month filters. |
| **Caching Implementation** | Redis for analytics (15m) & categories (1h), invalidation | Redis 8 integration with automated eviction upon data mutation and live telemetry bar. |
| **Rate Limiting** | Strict window limiting per endpoint group | `express-rate-limit` enforcing limits on auth, transactions, and analytics. |
| **Security** | Attack prevention against XSS and SQL Injection | Helmet.js secure HTTP headers + parameterized PostgreSQL queries + input validators. |
| **React Architecture** | `useContext`, `useCallback`, `useMemo`, lazy loading | Split `AuthContext`/`ThemeContext`, memoized computations, and route code-splitting. |
| **Documentation & Repo** | GitHub repository, clean commit history, README | 10+ semantic commits, architecture diagrams, ERD, and OpenAPI Swagger documentation. |

---

## 👩‍💻 Author & Project Metadata

- **Author**: Bhumika Narula
- **University**: Lovely Professional University (LPU)
- **Email**: [bhumikanarula01@gmail.com](mailto:bhumikanarula01@gmail.com)
- **GitHub Repository**: [https://github.com/bhumi-31/Personal-Finance-Tracker](https://github.com/bhumi-31/Personal-Finance-Tracker)
- **Project**: Full-Stack Personal Finance Tracker & Operational Analytics Engine
