# CoWork Space — Desk & Room Booking System

A full-stack co-working space booking system where members book desks/meeting rooms, and admins manage inventory, approve/reject bookings, and prevent double-booking conflicts.

## 🚀 Live Demo

| Service | URL |
|---|---|
| Frontend | _Add your Vercel URL here_ |
| Backend API | _Add your Render URL here_ |
| Swagger Docs | `<backend-url>/api/docs` |

---

## ✨ Features

### Visitor
- Browse all spaces (desks, meeting rooms) with capacity, type, amenities
- Search by name/type, filter by capacity and date availability
- View space details with hourly availability calendar
- Pagination on space listing

### Member
- Register / Login with JWT (access token + refresh token rotation)
- Book a space for a specific date + time slot
- Overlap prevention — concurrency-safe booking (no double-booking)
- View own bookings with status (pending / approved / rejected / cancelled)
- Cancel pending or approved future bookings

### Admin
- Add / Edit / Delete spaces
- Block maintenance windows (auto-rejects conflicting bookings)
- View all bookings filterable by status, date, space
- Approve or reject pending bookings
- Auto-reject overlapping pending bookings when one is approved

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access 15m + refresh 7d, rotation) |
| Frontend | React, Axios |
| Docs | Swagger UI (`/api/docs`) |
| Email | Nodemailer stub (Ethereal preview URLs) |
| Deploy | Render (backend) + Vercel (frontend) + MongoDB Atlas (DB) |

---

## ⚡ Quick Start (Docker — one command)

```bash
git clone <your-repo-url>
cd cowork-space
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Swagger Docs | http://localhost:5000/api/docs |

**Seeded credentials:**
- Admin: `admin@cowork.com` / `admin123`
- Member: `member@cowork.com` / `member123`

---

## 🔧 Manual Setup (without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally

### Backend

```bash
cd backend
cp ../.env.example .env   # fill in your values
npm install
npm run seed              # seed admin + spaces
npm start                 # runs on port 5000
```

### Frontend

```bash
cd frontend
cp .env.example .env      # set REACT_APP_API_URL
npm install
npm start                 # runs on port 3000
```

---

## 🌐 Deployment Guide

### 1. MongoDB Atlas (Database)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → create free cluster
2. **Database Access** → Add user with password
3. **Network Access** → Allow `0.0.0.0/0`
4. **Connect** → Copy connection string: `mongodb+srv://<user>:<pass>@cluster.mongodb.net/coworking`

---

### 2. Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Add environment variables:

| Key | Value |
|---|---|
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` | Any long random string |
| `JWT_REFRESH_SECRET` | Any different long random string |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Your Vercel frontend URL |
| `NODE_ENV` | `production` |

5. After deploy, run seed: open Render shell → `node src/utils/seed.js`
6. Copy your Render URL: `https://cowork-backend.onrender.com`

---

### 3. Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:

| Key | Value |
|---|---|
| `REACT_APP_API_URL` | `https://cowork-backend.onrender.com/api` |

4. Deploy → copy your Vercel URL

5. Go back to Render → update `CLIENT_URL` to your Vercel URL → redeploy

---

## 📁 Project Structure

```
cowork-space/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/      # authController, bookingController, spaceController
│   │   ├── middleware/        # auth, errorHandler, rateLimiter, validators
│   │   ├── models/            # User, Space, Booking
│   │   ├── routes/            # auth, spaces, bookings
│   │   ├── utils/             # jwt, email, seed
│   │   └── server.js
│   ├── docs/swagger.yaml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/               # axios instance + API calls
│   │   ├── components/        # Navbar, SpaceCard, BookingModal, AvailabilityCalendar
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Home, Spaces, SpaceDetail, Dashboard, AdminDashboard
│   │   └── App.js
│   └── package.json
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 📖 API Documentation

Swagger UI available at: `http://localhost:5000/api/docs`

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register member |
| POST | `/api/auth/login` | — | Login, get tokens |
| POST | `/api/auth/refresh` | — | Refresh access token |
| POST | `/api/auth/logout` | Bearer | Logout |
| GET | `/api/spaces` | — | List spaces (search/filter/paginate) |
| GET | `/api/spaces/:id` | — | Space details |
| GET | `/api/spaces/:id/availability` | — | Hourly availability for date |
| POST | `/api/spaces` | Admin | Create space |
| PUT | `/api/spaces/:id` | Admin | Update space |
| DELETE | `/api/spaces/:id` | Admin | Deactivate space |
| POST | `/api/bookings` | Member | Create booking |
| GET | `/api/bookings/my` | Member | My bookings |
| PATCH | `/api/bookings/:id/cancel` | Member | Cancel booking |
| GET | `/api/bookings` | Admin | All bookings |
| PATCH | `/api/bookings/:id/approve` | Admin | Approve booking |
| PATCH | `/api/bookings/:id/reject` | Admin | Reject booking |
| POST | `/api/bookings/maintenance` | Admin | Block maintenance window |

---

## 🔑 Environment Variables

See [`.env.example`](.env.example) for all required variables.

---

## 📧 Email Notifications (Stub)

Email notifications fire on every booking status change (pending, approved, rejected, cancelled).

- **Without SMTP config:** Uses [Ethereal](https://ethereal.email) — a fake SMTP service. Preview URLs are logged to the backend console.
- **With real SMTP:** Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env` (supports Gmail, SendGrid, etc.)
