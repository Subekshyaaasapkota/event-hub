# EventHub

[![Built with MERN](https://img.shields.io/badge/MERN-Stack-61DAFB?logo=react)](https://github.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)](https://www.mongodb.com/)
[![CI](https://github.com/Subekshyaaasapkota/event-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/Subekshyaaasapkota/event-hub/actions/workflows/ci.yml)

**EventHub** is a centralized event discovery and management platform for Nepal's IT community. It connects students with verified technical opportunities while helping organizations efficiently manage and promote their events.

## Problem & Solution

**The Challenge**: Students across Nepal miss valuable workshops, hackathons, and tech events due to scattered social media announcements. Meanwhile, organizations struggle to reach their target audience effectively.

**EventHub's Solution**: one place to see every event a verified club has posted, searchable by keyword, category and district, with registration that handles both free and paid events.

## Key Highlights

- **Verified organizers**: every club is reviewed by an admin before it can post
- **Two ways to find events**: filter the list by category and district, or let
  the browser find events near you
- **Recommendations from your profile**: events scored against your listed
  interests, see [docs/RECOMMENDATION_ENGINE.md](./docs/RECOMMENDATION_ENGINE.md)
- **Registration tracking**: clubs see who signed up, and analytics per event
- **Role-based access control**: students, clubs and admins see different
  interfaces and different endpoints
- **Payments by card or wallet**: Khalti and eSewa, with the amount always
  resolved on the server

## Features

### For Students

- Browse, search and filter published events by category and district
- Find events near you using your browser location
- Register for an event, free or paid, and track your registrations
- Maintain a profile with your interests and skills
- Get recommended events based on the interests you have saved

### For Clubs (verified organizers)

- Apply for verification, then create and edit your own events
- See who registered, and per-event analytics
- Link an external Google Sheet to an event for signups
- Upload a poster and set capacity, price and district
- Manage your club profile

### For Administrators

- Approve or reject club applications
- See every user, club and event on the platform
- Delete users
- View all registrations across every event

> Some things this project does **not** do, so you are not misled: there are no
> email or push notifications, no event approval workflow for organizers (clubs
> publish their own events), no CSV export button in the interface, and nothing
> updates live without a page refresh.

## Tech Stack

| Layer  | Technology  | Purpose  |
| -------------------- | ---------------------------- | --------------------------------------------- |
| **Frontend**  | React 19, Vite, TailwindCSS  | Modern, fast UI with responsive design  |
| **State Management** | Redux Toolkit, Redux Persist | Scalable application state  |
| **Routing**  | React Router v7  | Client-side navigation  |
| **Forms**  | React Hook Form  | Efficient form handling  |
| **HTTP Client**  | Axios  | API communication  |
| **Mapping**  | Leaflet, React-Leaflet  | Interactive location features  |
| **UI Components**  | Lucide React, React Icons  | Professional icon library  |
| **Backend**  | Node.js, Express.js  | Scalable server runtime  |
| **Database**  | MongoDB, Mongoose  | Flexible document storage with validation  |
| **Authentication**  | JWT, Bcryptjs  | Secure session management  |
| **HTTP**  | cors, cookie-parser  | Cross-origin handling and cookie parsing  |
| **File Management**  | Multer, Cloudinary  | Image uploads & cloud storage  |
| **Email**  | Resend  | Club verification email  |
| **Logging**  | Custom middleware  | HTTP request logging  |

## Project Structure

```
EventHub/
  client/                    React frontend
    src/
      components/
        common/              Navbar, Footer, dialogs, shared cards
        layout/              Page shells that wrap a route group
        auth/                Login and Signup pieces
        admin/               Admin-only pieces
        protected/           Route guards
        Organizer/           Club-only pieces
      pages/
        public/              Events, EventDetails
        user/                Dashboard, Profile, RegisteredEvents
        club/                Club console
        admin/               Admin console
      hooks/                 useAuth, useEvents, useAdmin
      redux/                 Store and slices
      services/              Axios calls
      routes/                AppRoutes.jsx, every URL lives here
      utils/                 Formatters, image URLs, constants
      api/                   Axios instance
      index.css              Design tokens

  server/                    Express backend
    src/
      app.js                 Express app and middleware
      database.js            MongoDB connection
      routes/                One file per resource
      controllers/           Request handlers
      services/              Business logic and queries
      models/                Mongoose schemas
      middlewares/           auth, roles, uploads, logger
      utils/                 Email, payments, recommendations
      config/                Cloudinary
      scripts/               Seed, poster generator, index sync

  docs/
    USING-EVENTHUB.md        Guide for running events, no code
    DEVELOPING.md            Architecture and API reference
    RECOMMENDATION_ENGINE.md How recommendations are scored
    dummy-data.md            What the seed creates
    BUGFIX_REPORT.md         Bugs found and fixed
```

## Installation

### Prerequisites

- **Node.js** v20 or higher (v24 recommended)
- **npm**
- **MongoDB** - a local instance *or* a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### Setup Steps

#### 1. Clone the repository

```bash
git clone https://github.com/Subekshyaaasapkota/event-hub.git
cd event-hub
```

#### 2. Backend (must be started first)

The API waits for MongoDB to connect before it starts listening, so start it
before the frontend.

```bash
cd server
npm install

# Create your .env (PowerShell: Copy-Item .env.example .env)
cp .env.example .env

# Edit .env and set at minimum:
#  MONGODB_URL=mongodb://127.0.0.1:27017
#  JWT_SECRET=<a long random string>
#  FRONTEND_URL=http://localhost:5173

# Start with auto-reload (recommended while developing)
npm run dev
```

Expected output:

```
 MongoDB connected (database: event_hub_portal)
 Server running on port 5000
```

Verify it works:

```bash
curl http://localhost:5000/api/health
```

The backend runs on **http://localhost:5000** (or whatever `PORT` you set).

#### 3. Frontend

In a **second terminal**:

```bash
cd client
npm install

# Create your .env
cp .env.example .env  # VITE_BASE_API_URL=http://localhost:5000

npm run dev
```

The frontend runs on **http://localhost:5173**.

#### 4. Load the demo events (optional but recommended)

An empty install has no events, so the pages you most want to look at will be
empty. Two commands fill it in, and **the order matters**.

```bash
cd server

# 1. Build a poster for each event and upload it to your Cloudinary account.
node src/scripts/generateEventPosters.js

# 2. Write the accounts, clubs, events and registrations.
npm run seed
```

Step 1 first, because the seed points every event at the images step 1
uploads. Skip it and you get eight events whose posters are all broken.

> Both steps need `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and
> `CLOUDINARY_API_SECRET` in `server/.env`, since the posters are uploaded to
> **your** account. If you would rather not set up Cloudinary, skip this
> section entirely and create events by hand through the club console instead.

The seed is idempotent. It upserts by event title, so running it twice will not
duplicate anything, and it resets registration counts to their starting values
rather than stacking more on top.

See [docs/dummy-data.md](./docs/dummy-data.md) for exactly what it creates,
including the demo accounts and their passwords.

#### 5. Run again later

You only need to repeat these two commands each time you work on the project:

```bash
cd server && npm run dev
cd client && npm run dev
```

## Environment Variables

### Server - `server/.env`

Copy from `server/.env.example`. Only the first three are required to boot.

| Variable  | Required | Description  |
| ----------------------- | -------- | --------------------------------------------------------------- |
| `PORT`  | no  | API port. Defaults to `5000`.  |
| `NODE_ENV`  | no  | `development` or `production`.  |
| `FRONTEND_URL`  | **yes**  | Comma-separated list of allowed CORS origins.  |
| `MONGODB_URL`  | **yes**  | MongoDB connection string.  |
| `MONGODB_DB_NAME`  | no  | Database name. Defaults to `event_hub_portal`.  |
| `JWT_SECRET`  | **yes**  | Secret used to sign and verify tokens.  |
| `KHALTI_SECRET_KEY`  | no  | Server-side Khalti secret. Needed for paid events.  |
| `ESEWA_MERCHANT_ID`  | no  | eSewa merchant id.  |
| `ESEWA_SECRET_KEY`  | no  | eSewa signature key.  |
| `RESEND_API_KEY`  | no  | If missing, approval emails are skipped instead of crashing.  |
| `EMAIL_FROM`  | no  | Sender address for outgoing mail.  |
| `CLOUDINARY_CLOUD_NAME` | for uploads  | Required for logo and poster uploads, and by `npm run seed`.  |
| `CLOUDINARY_API_KEY`  | no  | Cloudinary API key.  |
| `CLOUDINARY_API_SECRET` | no  | Cloudinary API secret.  |

### Client - `client/.env`

| Variable  | Required | Description  |
| -------------------- | -------- | ---------------------------------------------------- |
| `VITE_BASE_API_URL`  | no  | API origin with no trailing slash. Defaults to `http://localhost:5000`. |

> Vite only exposes variables prefixed with `VITE_`, and every `VITE_` variable
> is shipped to the browser. Never put a secret in the client `.env`.

## Troubleshooting

**`MONGODB_URL is not defined`**
Copy `server/.env.example` to `server/.env` and set `MONGODB_URL`.

**`getaddrinfo ENOTFOUND _mongodb._tcp.<cluster>.mongodb.net`**
Your machine cannot resolve the Atlas host name. Check your internet
connection or VPN, or point `MONGODB_URL` at a local MongoDB:
`mongodb://127.0.0.1:27017`.

**`Authentication failed` while connecting to MongoDB**
The username/password inside `MONGODB_URL` are wrong, or the database user has
not been granted access to that database.

**Frontend shows network/CORS errors**
Make sure the backend is running on port 5000 and that its `FRONTEND_URL`
includes `http://localhost:5173`.

**Logo or poster upload fails**
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are
missing or invalid.

**Club verification email is never received**
`RESEND_API_KEY` is not set. The server intentionally skips the email rather
than failing the request; the club is still approved in the database.

## API Endpoints

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint  | Description  |
| ------ | ---------------- | ------------------------------------ |
| POST  | `/auth/register` | Register a new user (always Student)  |
| POST  | `/auth/login`  | User login, returns a JWT  |
| POST  | `/auth/logout`  | Clear the auth cookie  |
| GET  | `/auth/me`  | Current user profile  |
| PUT  | `/auth/profile`  | Update own profile (multipart)  |

### Events

| Method | Endpoint  | Description  |
| ------ | ------------------------------------ | -------------------------------------- |
| GET  | `/events`  | List events (filters: search, district, category) |
| GET  | `/events/search?q=`  | Search by keyword  |
| GET  | `/events/organizer/:organizerId`  | Events for one organizer  |
| GET  | `/events/recommendations`  | Personalized picks (sign-in required)  |
| GET  | `/events/diag/ping`  | Liveness probe for the events router  |
| GET  | `/events/:id`  | Event details  |
| POST  | `/events/create`  | Create event (Club or Admin)  |
| PUT  | `/events/:id`  | Update event (owner or Admin)  |
| PATCH  | `/events/integration/google-sheet/:id` | Link a Google Sheet to an event  |
| DELETE | `/events/:id`  | Delete event (owner or Admin)  |

### Registrations

| Method | Endpoint  | Description  |
| ------ | ------------------------------ | -------------------------------------------- |
| POST  | `/registrations/:eventId`  | Register for an event  |
| GET  | `/registrations/:eventId`  | Registrants for an event (owner or Admin)  |
| GET  | `/registrations/my`  | Registrations belonging to the signed-in user |
| GET  | `/registrations/club/all`  | All registrations for the signed-in club  |

### Contact

| Method | Endpoint  | Description  |
| ------ | ------------- | ---------------------------------- |
| POST  | `/contact/`  | Submit a message from the contact form |

### Clubs

| Method | Endpoint  | Description  |
| ------ | ----------------------- | ------------------------------------------ |
| POST  | `/clubs/register`  | Apply for club verification (multipart)  |
| GET  | `/clubs/status`  | Verification status of the current user  |
| PUT  | `/clubs/profile`  | Update own club profile  |
| GET  | `/clubs/my-events`  | Events created by the club (Club only)  |
| DELETE | `/clubs/events/:id`  | Delete one of the club's events  |
| GET  | `/clubs/pending`  | Clubs awaiting verification (Admin)  |
| GET  | `/clubs/all`  | All clubs (Admin)  |

### Admin

| Method | Endpoint  | Description  |
| ------ | ----------------------------- | ----------------------------- |
| GET  | `/admin/users`  | List all users  |
| DELETE | `/admin/users/:id`  | Delete a user  |
| GET  | `/admin/registrations`  | All registrations across events |
| PUT  | `/admin/clubs/approve/:id`  | Verify/approve a club  |
| PUT  | `/admin/clubs/reject/:id`  | Reject a club  |

### Payments

| Method | Endpoint  | Description  |
| ------ | ---------------------------- | ---------------------------------------- |
| POST  | `/payments/khalti/initiate`  | Start a Khalti payment  |
| POST  | `/payments/khalti/verify`  | Verify a Khalti payment  |
| GET  | `/payments/esewa/form`  | Build a signed eSewa payment form  |
| POST  | `/payments/esewa/verify`  | Verify an eSewa transaction  |

Amounts are always resolved from the database on the server. Both gateways
require the registration to belong to the signed-in user, so a client cannot
pay - or confirm - an arbitrary amount or someone else's registration.

### Health

| Method | Endpoint  | Description  |
| ------ | -------------- | -------------------------------------------------- |
| GET  | `/health`  | `200` when MongoDB is connected, otherwise `503`  |
| GET  | `/`  | API name, version and port  |

## Authentication & Authorization

EventHub uses **JWT** authentication with role-based access control:

| Role  | Permissions  |
| ---------- | -------------------------------------------------------------------- |
| **Student** | Browse events, register, manage own profile  |
| **Club**  | Everything a Student can do, plus create/manage events and view their registrant lists |
| **Admin**  | Full platform control: moderate clubs, manage all users and events  |

New signups are always created with the `Student` role - the client cannot
choose a role. The `Club` role is granted by an Admin from
`/admin/club/verification`, and `Admin` must be assigned directly in MongoDB.

Tokens are accepted from the `Authorization: Bearer <token>` header, an
`authToken` cookie, or the browser's `authToken` localStorage entry.

## Scripts & Commands

### Frontend scripts (`cd client`)

```bash
npm run dev  # Start development server (hot-reload)
npm run build  # Build for production into dist/
npm run lint  # Run ESLint
npm run preview  # Preview the production build locally
```

### Backend scripts (`cd server`)

```bash
npm run dev    # Start with nodemon (auto-restart on changes)
npm start      # Run the server without nodemon
npm run seed   # Write the demo accounts, clubs, events and registrations
```

Two one-off scripts, run by hand rather than through npm:

```bash
node src/scripts/generateEventPosters.js   # Upload demo posters to Cloudinary
node src/scripts/syncIndexes.js            # Create the MongoDB indexes
```

> The server has an automated suite covering the registration rules. Run
> `npm test` in `server/` for 48 Vitest tests; it mocks the Mongoose models, so
> it never reaches a real database. The client has no test suite yet, so
> `npm run lint` and `npm run build` in `client/` are the only automated checks
> on that side. Continuous integration runs all three.

## Screenshots

> **These are out of date.** The images below are from an earlier version of the
> interface, before it was rebuilt onto the current design system. The layouts,
> colours and navigation shown no longer match the application, so do not use
> them as a reference for how it looks now. They are kept only until proper
> screenshots can be taken from a running instance.

| Event Discovery | Registration | Student home | Club dashboard |
| --- | --- | --- | --- |
| ![Old events page](./client/public/screenshots/1.jpeg) | ![Old registration flow](./client/public/screenshots/2.jpeg) | ![Old dashboard](./client/public/screenshots/3.jpeg) | ![Old club portal](./client/public/screenshots/4.jpeg) |

## Contributing and governance

| Document | What it covers |
| --- | --- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Setup, the commands that gate a pull request, and the conventions |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | What is expected of everyone taking part |
| [SECURITY.md](SECURITY.md) | How to report a vulnerability privately, and known limitations |
| [SUPPORT.md](SUPPORT.md) | Where to ask, and what not to file here |
| [CHANGELOG.md](CHANGELOG.md) | Notable changes, and the fixes behind them |
| [docs/DEVELOPING.md](docs/DEVELOPING.md) | Architecture, data model, API surface and design conventions |

Continuous integration runs the server test suite plus client lint and build on
every push and pull request against Node 20 and 24.

## License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## Copyright

© Subekshya Sapkota and contributors. Licensed under the [ISC License](LICENSE).

Maintainer: **Subekshya Sapkota**, [`subekshyasapkota686@gmail.com`](mailto:subekshyasapkota686@gmail.com)
