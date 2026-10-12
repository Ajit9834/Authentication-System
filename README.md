# Authentication System — React + Express + PostgreSQL (JSX, no TypeScript)

Complete **Login and Sign-Up Authentication System**. Plain JavaScript + JSX only —
no TypeScript, no Next.js structure in the app code itself.

```
authentication-system/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── authService.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   └── package.json
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── User.js
│   ├── controllers/
│   │   └── authController.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── README.md
```

> **Stack note:** the original tutorial uses MongoDB/Mongoose. This repo runs on
> **PostgreSQL** (`users` table) so it works with the provided database. The HTTP
> contract is identical (`POST /api/auth/signup`, `POST /api/auth/login`,
> `POST /api/auth/logout`, `GET /api/auth/me`), so you can swap `models/User.js`
> for a Mongoose model without touching controllers, routes or the frontend.

## 1. What each folder does

**Frontend (`frontend/`)** — Vite + React + React Router + Axios
- `pages/` — Login, Sign-Up, Dashboard pages
- `components/` — reusable UI (`Navbar`, `ProtectedRoute` route guard)
- `services/` — `authService.js` connects React to the backend APIs (`withCredentials: true` so cookies flow)
- `context/` — `AuthContext.jsx` holds the auth state (user, login, signup, logout, refresh)
- `App.jsx` — `BrowserRouter` + `Routes`; `/dashboard` is wrapped in `ProtectedRoute`
- `main.jsx` — `createRoot` + `AuthProvider` + `index.css`

**Backend (`backend/`)** — Node + Express + `pg` + `bcryptjs` + `jsonwebtoken`
- `config/db.js` — `pg` Pool + `ensureUsersTable()` (creates `users` if missing)
- `models/User.js` — SQL helpers: `findByEmail`, `findById`, `createUser`, `toPublic`
- `controllers/authController.js` — `signup`, `login`, `logout`, `me` (bcrypt hash, JWT in HttpOnly cookie)
- `routes/authRoutes.js` — `POST /signup`, `POST /login`, `POST /logout`, `GET /me`
- `middleware/authMiddleware.js` — `protect`: verifies JWT from `req.cookies.token`, loads user
- `server.js` — CORS with credentials, `cookie-parser`, mounts `/api/auth`, starts Express

## 2. How it works

### Sign-Up flow
```
User enters name, email, password
              → React Sign-Up page
              → POST /api/auth/signup
              → Express backend
              → validate input → check existing email
              → bcrypt.hash(password, 12)
              → INSERT INTO users
              → jwt.sign({ sub: id }) → Set-Cookie: token (HttpOnly)
              → 201 { user }
```

### Login flow
```
User enters email + password
              → React Login page
              → POST /api/auth/login
              → find user → bcrypt.compare
              → verify → jwt.sign → Set-Cookie: token
              → 200 { user } → open protected Dashboard
```

JWT lives in an **HttpOnly, SameSite=Lax cookie** (`Secure` in production).
Browser JS can never read it. `GET /api/auth/me` + `protect` is the real security
boundary; `ProtectedRoute.jsx` is only for UX.

## 3. Run it (classic two-terminal way)

Terminal 1 — backend:
```bash
cd authentication-system/backend
cp .env .env.local  # or edit .env directly
npm install
npm run dev         # nodemon server.js → http://localhost:5000
```

Terminal 2 — frontend:
```bash
cd authentication-system/frontend
npm install
npm run dev         # vite → http://localhost:5173
```

Open `http://localhost:5173`, go to `/signup`, create an account, test `/login`
and `/dashboard`.

## 4. Environment

`backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

`frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real secrets. `withCredentials: true` (frontend) + `cors({ origin: CLIENT_URL, credentials: true })` (backend) is what lets the cookie travel cross-origin.

## 5. Test matrix

| Test | Expected |
| ---- | -------- |
| Register valid details | 201, cookie set, → dashboard |
| Register existing email | 409 duplicate-account error |
| Login correct credentials | 200 + cookie |
| Login wrong password | 401 Invalid email or password |
| Open dashboard, no session | Redirect to /login |
| Refresh dashboard after login | Re-checked via GET /api/auth/me |
| Logout | Cookie cleared, back to login |

## 6. Production checklist

Rate limiting, stricter email/password validation, CSRF protection for cookies,
HTTPS + `Secure` cookies, strong `JWT_SECRET` outside source, email verification
/ password reset if needed, generic login errors, DB backups + access controls.
If frontend and backend are cross-site in production, cookie + CSRF settings need
extra care.

## 7. Preview runner note

In this sandbox the preview is served by a thin Next.js adapter at the repo root
(`src/app/**`, `src/components/**`, `middleware.js`) which reuses
`frontend/src/context/AuthContext.jsx` + `frontend/src/services/authService.js`
and talks to the **same** `users` table and **same** cookie/API contract. All
product code you edit lives under `authentication-system/` in `.js` / `.jsx`.
