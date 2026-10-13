<<<<<<< HEAD
# Diu City Bank

Bank management system with a React frontend, Node.js REST API, and MySQL.

## Stack

- Frontend: React (Vite)
- Backend: Node.js + Express REST
- Database: MySQL

## Setup

1. Install [MySQL](https://dev.mysql.com/downloads/installer/) and make sure it is running.
2. Copy `backend/.env.example` to `backend/.env` and set `DB_USER` / `DB_PASSWORD`.
3. Install and seed:

```bash
cd backend
npm install
npm run seed
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

4. Open http://localhost:5173

**Demo login:** `admin@diucitybank.com` / `Admin@123`

## REST API

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Staff login |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/customers` | List / register customers |
| PUT | `/api/customers/:id` | Update customer |
| GET/POST | `/api/accounts` | List / open accounts |
| GET | `/api/accounts/:id` | Account details |
| POST | `/api/accounts/:id/deposit` | Deposit |
| POST | `/api/accounts/:id/withdraw` | Withdraw |
| GET | `/api/accounts/:id/transactions` | Account statement |
| GET | `/api/transactions` | Recent transactions |
| POST | `/api/transactions/transfer` | Fund transfer |
| GET | `/api/dashboard/stats` | Dashboard totals |
=======
# Diu-City-Bank
A digital banking application for Diu City Bank, designed to provide a secure, user-friendly, and efficient banking experience with modern features for managing banking services.
>>>>>>> 6da60298e376aed590e4ae65249570369bd69d7b
