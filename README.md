# HARDTRAC: AN RFID AND BARCODE INTEGRATED INVENTORY AND SALES SYSTEM FOR MVS HARDWARE

Local capstone project (Laragon + React + Node/Express + MySQL).

## Tech Stack

- Frontend: React (Vite) + Bootstrap 5
- Backend: Node.js + Express (REST API) + JWT auth
- Database: MySQL (Laragon)

## Project Structure

```
frontend/   # React UI
backend/    # Express API
database/   # MySQL schema + seed data
```

## Requirements (Local)

- Laragon (MySQL + phpMyAdmin)
- Node.js (recommended 18+)

## 1) Database Setup (Laragon)

1. Start Laragon.
2. Open phpMyAdmin.
3. Create a database named `hardtrac_db`.
4. Import the schema and seed files:
   - `database/hardtrac_schema.sql`
   - `database/seed.sql`

Optional (recommended): use the backend seeder so the demo accounts are created automatically with bcrypt passwords:

```
cd backend
npm install
copy .env.example .env
npm run seed
```

If your database already exists, re-running `npm run seed` will recreate the tables with the updated roles, RFID fields, and void columns.

## Restore Backup Database

To load your previous database backup into the current `hardtrac_db` database, run:

```
cd backend
npm run restore-backup
```

This restores `database/hardtrac_db_backup.sql`, drops the current tables first, then reapplies the newer app columns and the demo accounts.

> Note: `backend/.env.example` uses Laragon defaults: MySQL user `root` with empty password.

## 2) Backend Setup (Express API)

```
cd backend
npm install
copy .env.example .env
npm run dev
```

If you see PowerShell error like “running scripts is disabled”, use `npm.cmd` instead of `npm` (or change your PowerShell execution policy):

```
npm.cmd install
```

API health check:

```
GET http://localhost:4000/api/health
```

## 3) Frontend Setup (React)

```
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

Vite is configured to proxy `/api/*` requests to `http://localhost:4000`, so the frontend can call the backend using `/api` without CORS issues.

## Vercel Deployment

This repo includes Vercel config in `vercel.json` and `frontend/vercel.json`.

Deploying the frontend from the repo root:

1. In Vercel, link the GitHub repo `Chuckieeeph/HARDTRAC-REACT-SYSTEM`.
2. Let Vercel use the root `vercel.json` config.
3. Set `VITE_API_URL` in the Vercel environment to your deployed backend API URL, for example `https://your-backend.example.com/api`.
4. Redeploy after the environment variable is saved.

The frontend uses `VITE_API_URL` when available and falls back to `/api` for local development.

## Default Demo Accounts

Created by `npm run seed` (backend):

- Admin/Owner
  - Username: `admin`
  - Password: `Admin123!`
- Cashier
  - Username: `cashier`
  - Password: `Cashier123!`
- Head Cashier
  - Username: `headcashier`
  - Password: `HeadCashier123!`

Demo RFID values:

- Admin: `0805615836`
- Cashier: `0807110236`
- Cashier 2: `0805666812`
- Head Cashier: `0807793948`

If you changed these users before, re-run `npm run seed` to reset the demo passwords and recreate the head-cashier account.

## Barcode + RFID Scanner Usage (Important)

Practical local web approach:

- Most USB barcode scanners and RFID readers behave like a **keyboard** (they type characters into the focused input).
- They usually send an **Enter** key at the end.
- In the POS page:
  - Click **Focus Scan** (or just click the scan input field)
  - Scan a barcode or RFID tag
  - The code is searched in the database and the matching product is added to cart
- No hardware required: you can manually type the code and press **Enter**.
- After clicking **Enter POS**, the cashier can use the sidebar to check inventory and low-stock screens.
- On the login page, you can switch between username/password and RFID scan mode.
- On the transactions page, voiding a sale now requires scanning the approving admin or head-cashier RFID.

Matching fields used by the POS scan:

- `products.barcode_value`
- `products.rfid_value`
- `products.sku`

## Role-Based Access Control (RBAC)

- Admin can access inventory management, users, reports, audit logs, and stock adjustments.
- Cashier can access POS and their own transactions only.
- Head cashier can access POS, transactions, inventory, and low-stock views, and can void completed sales.
- Backend enforces roles on protected endpoints (cashier cannot access admin APIs).

## Notes / Tips

- Unique validation is enforced by MySQL constraints for:
  - `users.username`
  - `users.rfid_value`
  - `products.sku`
  - `products.barcode_value`
  - `products.rfid_value`
- Inventory automatically decreases when a sale is completed.
- The backend prevents selling more than available stock (transaction-level checks).

## Theme & UI (MVS Light / HARDTRAC Dark)

Theme files (frontend):

- `frontend/src/styles/theme.css` (CSS variables + light/dark tokens)
- `frontend/src/styles/global.css` (global resets, focus rings, base utilities)
- `frontend/src/styles/layout.css` (sidebar/topbar/layout)
- `frontend/src/styles/components.css` (cards/buttons/tables/modals)
- `frontend/src/styles/animations.css` (subtle animations)
- `frontend/src/styles/responsive.css` (mobile sidebar + breakpoints)

Light/dark toggle:

- Toggle is in the topbar.
- Saved in `localStorage` key `hardtrac_theme`.
- Applied globally via `data-theme="light|dark"` on `<html>` (see `frontend/src/context/ThemeContext.jsx`).
