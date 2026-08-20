# CoWork Space — Desk & Room Booking System

A full-stack co-working space booking system where members book desks/meeting rooms, and admins manage inventory, approve/reject bookings, and prevent double-booking conflicts.

## 🚀 Live Demo

| Service | URL |
|---|---|
| Frontend | https://cowork-space-steel.vercel.app |
| Backend API | https://cowork-space.onrender.com/api |
| Swagger Docs | https://cowork-space.onrender.com/api/docs |

**Test Credentials**
| Role | Email | Password |
|---|---|---|
| Admin | admin@cowork.com | admin123 |
| Member | member@cowork.com | member123 |

---

## ✨ Features

- **Visitor** — Browse spaces, search/filter by type & capacity, view availability calendar, pagination
- **Member** — Register/Login (JWT), book a space, view/cancel own bookings
- **Admin** — Manage spaces (CRUD), approve/reject bookings, block maintenance windows, auto-reject overlapping bookings

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access 15m + refresh 7d, rotation) |
| Frontend | React, Axios |
| Docs | Swagger UI |
| Email | Nodemailer (Ethereal stub) |
| Deploy | Render + Vercel + MongoDB Atlas |

---

## ⚡ Quick Start (Docker — Recommended)

> One command brings up **frontend + backend + MongoDB** — no manual setup needed.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Run

```bash
git clone https://github.com/archeedoshi12/Cowork-Space.git
cd Cowork-Space
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Swagger Docs | http://localhost:5000/api/docs |

> Seed data (admin + member + spaces) is loaded automatically on first run.

To stop:
```bash
docker-compose down
```

---

## 🔧 Manual Setup (without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally

### Backend
```bash
cd backend
cp ../.env.example .env
npm install
npm run seed
npm start
```

### Frontend
```bash
cd frontend
cp .env.example .env   # set REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start
```

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── controllers/   # auth, booking, space
│   │   ├── middleware/    # auth, errorHandler, rateLimiter, validators
│   │   ├── models/        # User, Space, Booking
│   │   ├── routes/        # auth, spaces, bookings
│   │   ├── utils/         # jwt, email, seed
│   │   └── server.js
│   └── docs/swagger.yaml
├── frontend/
│   └── src/
│       ├── api/           # axios instance + API calls
│       ├── components/    # Navbar, SpaceCard, BookingModal, AvailabilityCalendar
│       ├── context/       # AuthContext
│       └── pages/         # Home, Spaces, SpaceDetail, Dashboard, AdminDashboard
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🔑 Environment Variables

See `.env.example` for all required variables.

| Key | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `CLIENT_URL` | Frontend URL (for CORS) |

---

## 📖 Key API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register member |
| POST | `/api/auth/login` | — | Login, get tokens |
| POST | `/api/auth/refresh` | — | Refresh access token |
| GET | `/api/spaces` | — | List spaces (search/filter/paginate) |
| GET | `/api/spaces/:id/availability` | — | Hourly availability for date |
| POST | `/api/bookings` | Member | Create booking |
| GET | `/api/bookings/my` | Member | My bookings |
| PATCH | `/api/bookings/:id/cancel` | Member | Cancel booking |
| GET | `/api/bookings` | Admin | All bookings |
| PATCH | `/api/bookings/:id/approve` | Admin | Approve booking |
| POST | `/api/bookings/maintenance` | Admin | Block maintenance window |

Full docs available at `/api/docs`.
