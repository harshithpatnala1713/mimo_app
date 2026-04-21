# MetalInv — Full Stack Setup Guide

## Project Structure
```
metalinv-fullstack/
├── backend/
│   ├── db/
│   │   ├── pool.js          ← MySQL connection pool
│   │   └── schema.sql       ← Run this once to create tables
│   ├── middleware/
│   │   └── auth.js          ← JWT verification middleware
│   ├── routes/
│   │   ├── auth.js          ← /api/auth (login, register, me)
│   │   ├── orders.js        ← /api/orders
│   │   ├── inventory.js     ← /api/inventory (metal-types + coils)
│   │   └── optimize.js      ← /api/optimize
│   ├── scripts/
│   │   └── seedPasswords.js ← Creates default login accounts
│   ├── server.js
│   ├── package.json
│   └── .env.example         ← Copy to .env and fill in your DB creds
└── frontend/
    ├── src/
    │   ├── App.jsx          ← All UI components
    │   ├── main.jsx
    │   └── services/
    │       └── api.js       ← Centralised API layer
    ├── vite.config.js
    └── package.json
```

---

## Step 1 — MySQL Database

```sql
-- In MySQL Workbench or terminal:
mysql -u root -p < backend/db/schema.sql
```

This creates the `metalinv` database and all tables.

---

## Step 2 — Backend

```bash
cd backend

# Copy and edit your environment file
cp .env.example .env
# Open .env and set: DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET

# Install dependencies
npm install

# Seed the default accounts (supplier + customer)
npm run seed

# Start the backend
npm run dev       # uses nodemon (auto-restart)
# OR
npm start         # plain node
```

Backend runs at: **http://localhost:5000**

---

## Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Default Login Credentials

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Supplier | supplier@metalinv.com    | supplier123  |
| Customer | customer@metalinv.com    | customer123  |

---

## Features by Role

### Supplier
- Dashboard with order KPIs
- Metal Type Master — full CRUD
- Coil Stock Master — full CRUD
- Incoming Requests — approve / reject customer orders
- Optimization — select orders → generate cutting plan with visual layout

### Customer
- Dashboard
- Create Request — submit metal cutting requests
- My Requests — track status of submitted orders

---

## Troubleshooting

**Blank screen / CORS error**
- Make sure backend is running on port 5000
- Check `backend/.env` has `FRONTEND_URL=http://localhost:5173`

**DB connection error**
- Verify DB credentials in `.env`
- Make sure MySQL is running and `metalinv` database exists (run schema.sql)

**"Invalid credentials" on login**
- Run `npm run seed` in the backend folder to create demo accounts
# mimo_app
