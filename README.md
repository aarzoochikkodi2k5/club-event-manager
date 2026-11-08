# Club Event Manager

A full-stack web app where campus clubs publish events and students register for them in one place, with a hard seat limit that can't be overbooked.

## The problem

Club events are scattered across WhatsApp groups, Google Forms and paper sheets. Students miss events, forms keep accepting registrations after the hall is full, and clubs can't see how many registered students actually attended.

## Features

**Students**
- Browse and search events from every club, without logging in
- Filter by club and by upcoming events
- Register and cancel, with live seat counts
- "My Events" page showing registered and attended events

**Club admins**
- Create, edit and delete events with a poster image
- See registered students for each event
- Mark attendance with one click
- Dashboard: total events, registrations, attendance and attendance rate

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, plain CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT, bcrypt password hashing |
| File upload | Multer |

## How it works

```
React (browser)  -->  Express REST API  -->  MongoDB Atlas
```

## Key design decisions

- **No overbooking.** Registering takes a seat with a single conditional MongoDB update (`registeredCount < capacity`), so if two students click the last seat at the same moment, only one succeeds. A check-then-update approach would let both in.
- **No duplicate registrations.** The registrations collection has a unique index on (event, student).
- **Security is enforced on the server.** Role checks and ownership checks (a club can only edit its own events) happen in the API, not just in the UI.
- **Separate registrations collection.** It links one student to one event and also stores attendance, which keeps attendance and dashboard queries simple.


## Run it locally

You need Node.js 20+ and a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
git clone https://github.com/YOUR-USERNAME/club-event-manager.git
cd club-event-manager
```

**Backend**

```bash
cd server
npm install
cp .env.example .env     # on Windows: copy .env.example .env
# edit .env and fill in your own values
npm run seed             # optional: loads demo clubs, students and events
npm run dev              # runs on http://localhost:5000
```

**Frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev              # runs on http://localhost:5173
```

## Demo accounts (after `npm run seed`)

Password for all: `demo1234`

| Role | Email |
|---|---|
| Club admin | `techclub@seed.test` |
| Student | `student1@seed.test` |

To sign up as a new club admin, use the admin code from your `.env` (`ADMIN_CODE`).

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login` | Public |
| GET | `/api/events`, `/api/events/:id`, `/api/events/clubs` | Public |
| POST / PUT / DELETE | `/api/events` | Club admin (own events) |
| GET | `/api/events/:id/registrations` | Club admin |
| POST / DELETE | `/api/registrations/:eventId` | Student |
| GET | `/api/registrations/mine` | Student |
| PATCH | `/api/registrations/:id/attendance` | Club admin |
| GET | `/api/dashboard` | Club admin |

## Future improvements

- QR code check-in for attendance
- Waitlist that offers a freed seat to the next student
- Email notifications for new events
- MongoDB transactions for the registration step