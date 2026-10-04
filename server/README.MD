# EventHub API

The Express and MongoDB backend for EventHub. It owns every piece of state:
accounts, events, registrations, clubs and payments. The React client in
`../client` only ever renders what this returns.

For the full architecture, the data model and the complete route table, read
[docs/DEVELOPING.md](../docs/DEVELOPING.md). This file is the short version for
working on the server specifically.

## Running it

```bash
cd server
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
npm run dev               # nodemon, restarts on change
```

`npm start` runs the same file without the watcher. There is no watch mode by
default and no clustering, so `npm start` will not pick up edits until you
restart it. If the API is behaving as though a fix did not take, this is
usually why.

The server waits for MongoDB to connect before it listens, so start MongoDB
first. If you see a connection error, fix that before anything else: the
process stays up and every request then fails in a confusing way.

Check it is alive:

```bash
curl http://localhost:5000/api/health
```

`200` means MongoDB is connected. `503` means the server is up but the
database is not, which is the single most useful thing that endpoint does.

## Environment

Only `MONGODB_URL`, `JWT_SECRET` and `FRONTEND_URL` are needed to boot.
Everything else switches on a feature:

| Missing variable | What stops working |
| --- | --- |
| `KHALTI_SECRET_KEY` | Khalti payments |
| `ESEWA_MERCHANT_ID`, `ESEWA_SECRET_KEY` | eSewa payments |
| `RESEND_API_KEY` | Club approval emails. Skipped rather than failed, so approvals still work silently |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Logo and poster uploads, and the demo seed |

Never commit `.env`. It is gitignored.

## Layout

```
server/src/
  app.js              Express app, middleware, route mounting
  database.js         MongoDB connection, holds the database name
  routes/             One file per resource, thin, no logic
  controllers/        Request handlers, HTTP status codes, messages
  services/           Business logic and the database queries
  models/             Mongoose schemas
  middlewares/        auth, role checks, uploads, request logger
  utils/              Email, payments, recommendation scoring
  config/             Cloudinary
  scripts/            Seed, poster generator, index sync
```

The rule the code actually follows: `routes` decide what a URL does,
`controllers` decide what the response is, `services` decide what the database
says. If you find yourself writing a database query in a controller, it belongs
in the service.

## Demo data

Two commands, in this order. The first is easy to miss and it matters:

```bash
# 1. Upload the generated posters to your own Cloudinary account.
#    Skipping this leaves every event pointing at an image that 404s.
node src/scripts/generateEventPosters.js

# 2. Write the events, clubs, accounts and registrations.
npm run seed
```

The seed is idempotent. It upserts by title, so running it twice does not
duplicate events, and it resets registration counts rather than stacking more
on top of them. It also writes `docs/dummy-data.seed.json` with every generated
ID.

See [docs/dummy-data.md](../docs/dummy-data.md) for the full list of what
exists afterwards.

## Before you commit

Two things have already gone wrong in this repository, so check them:

- No credentials, tokens or `.env` contents, in any file, ever. This one was
  committed by mistake before. See the note below.
- No personal email addresses. Use the `eventhub.dev` demo accounts.

## A committed credential, and what it means

An earlier version of this file listed three real account passwords and a live
JWT. They are committed in commit `bbd1928` and that commit is on `origin/main`,
so removing them from the working tree does not unpublish them. Anyone who has
cloned the repository has them.

The JWT in question expired on its own shortly after it was issued, but the
passwords never expire on their own. If those accounts exist in the live
database, treat the passwords as public and change them.

Rewriting published git history is destructive and needs an explicit decision,
so it has not been done. Until it is, the honest position is rotation, not
erasure.
