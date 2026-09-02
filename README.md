# HOTEL Management System

A full-stack hotel management web application for managing rooms, guests, and bookings.

## Features

- **Dashboard** — occupancy stats, revenue, and room availability at a glance
- **Rooms** — view and update room status (available, occupied, maintenance)
- **Guests** — register and manage guest records
- **Bookings** — create reservations, check out guests, and cancel bookings

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3)

## Getting Started

### Prerequisites

- Node.js 18+

### Install & Run

```bash
# Backend
cd backend
npm install
npm run seed   # seed sample rooms (first time only)
npm run dev    # starts API on http://localhost:3001

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev    # starts UI on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/rooms` | List all rooms |
| PATCH | `/api/rooms/:id` | Update room status |
| GET | `/api/guests` | List all guests |
| POST | `/api/guests` | Create a guest |
| GET | `/api/bookings` | List all bookings |
| POST | `/api/bookings` | Create a booking |
| PATCH | `/api/bookings/:id` | Update booking status |

## Project Structure

```
backend/
  src/
    index.js   # Express API server
    db.js      # SQLite setup & schema
    seed.js    # Sample room data
frontend/
  src/
    api.ts              # API client
    components/         # React UI components
```
