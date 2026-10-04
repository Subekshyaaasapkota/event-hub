# Developing EventHub

Architecture, data flow and API reference for people changing the code. If you
want to run events rather than change the software, read
[USING-EVENTHUB.md](./USING-EVENTHUB.md) instead. If you want to install it,
read the [README](../README.md).

Everything here was read out of the source. Where the code and an expectation
disagree, the disagreement is called out rather than smoothed over.

## Layout

Two independent applications and no root `package.json`, so there is no `npm
install` at the top level and no single command that runs both.

```
client/     React 18 + Vite, runs on 5173
server/     Express + Mongoose, runs on 5000
docs/       This and the other documents
```

Each has its own `node_modules` and its own `.env`. Install and run them
separately.

## Running it

```bash
# terminal one
cd server
npm install
npm run seed     # optional, needs Cloudinary credentials, see the README
npm start

# terminal two
cd client
npm install
npm run dev
```

`server` also has `npm run dev`, which is nodemon and reloads on save. `npm
start` is plain node and does not, so **the running server does not pick up
backend edits**. This matters when testing a change: either use nodemon, or
restart the process.

`client` has `dev`, `build`, `lint` and `preview`. There is no test script
anywhere in this project.

## Request lifecycle

The client never talks to MongoDB and the server never talks to the client
directly. Every request goes through one place.

```
component -> hook (useEvents) -> service (eventService) -> axios instance
          -> http://localhost:5000 -> routes -> middleware -> controller
          -> service -> Mongoose model -> MongoDB
```

**There is no Vite dev proxy.** The client calls the backend by absolute URL.
`client/src/api/axios.js` sets `baseURL` from `VITE_BASE_API_URL` and falls back
to `http://localhost:5000`. If the API is somewhere else and you do not set
that variable, requests go to the wrong place and fail with a network error
rather than a helpful message.

## Authentication

Login signs a JWT and sets it as an `httpOnly` cookie named `authToken`. The
browser sends it automatically because the axios instance is created with
`withCredentials: true`. A bearer token in the `Authorization` header also
works, which is what makes scripted testing possible.

Token details that matter when writing code against `req.user`:

| field | note |
| --- | --- |
| `id` | the user id. **There is no `_id` on the token.** |
| `roles` | array of strings, for example `["Admin"]` |

The payload is a flattened user object, not the Mongoose document, so anything
Mongoose adds to a document (`select`, virtuals, `save`) is not on the token.
Roles live on the token, so a role change does not take effect until the user
logs in again.

The token lasts 24 hours. In production the cookie is `secure` and
`SameSite=None`; in development it is `SameSite=Lax`. That difference is why
payments and anything else cross-site behave differently once deployed.

Two middlewares guard routes:

- `auth` requires a valid token and answers 401 without one. This is the default
  for anything private.
- `optionalAuth` attaches `req.user` when a token is usable and otherwise
  carries on anonymously. Use it on endpoints that are public but need to
  recognise the caller, such as the event detail route, which serves published
  events to anyone and unpublished ones only to the owner or an Admin.

`roleBasedAuth("Admin")` and `roleBasedAuth("Club", "Admin")` run after `auth`
and check `req.user.roles`.

## Identifier shapes

This trips people up, so it is worth stating plainly:

- Users are addressed by `id`.
- Events are addressed by `_id`. The Events schema does not expose an `id`
  virtual, so the client reads `event._id` throughout.
- A club's owning user is `club.createdBy`.
- An event's organising club is `event.organizer`, which references
  `RegisterClub`, not `User`.

## Models

Four, in `server/src/models`.

**User.** Name, email, password, district, college, address, bio,
profilePicture, interestedSkills, roles, and an optional `club`. Roles are never
self-assigned. Signup always creates a `Student`; an Admin grants `Club` and
`Admin`.

**Events.** Name, description, category, tags, eventType (`physical` or
`online`), district, venue, location as a GeoJSON point, eventDate, deadline,
participantCount, isPaid, price, poster, googleFormUrl, attendee list, and the
organising club as `organizer`.

`status` is an enum of `draft`, `published`, `cancelled`, `completed`, default
`published`. Only the seed ever writes a non-published value, and the schema
default means an event is public the moment it is created. Do not assume a
draft workflow exists; if you add one, filter on `status` in every read path.

**Registration.** Ties a user to an event with a status of `Confirmed`,
`Pending`, `Cancelled` or `Failed`, plus a payment method enum of `Khalti`,
`eSewa`, `GoogleForm` or `None`. Payment state lives here.

**RegisterClub.** Name, phone, contactPerson, category, description,
establishedYear, website, district, email, logo, social links, `createdBy`
pointing at the owning user, a `status` enum of `Pending`, `Approved` or
`Rejected` defaulting to `Pending`, and a separate `isVerified` boolean.

Note that a club carries both `status` and `isVerified`, which is redundant:
`status: "Approved"` and `isVerified: true` mean the same thing. Every writer
today sets them together, in `clubService` on register, approve and reject, and
in the seed. So the two cannot currently drift apart, but the redundancy is a
trap for whoever adds the next writer and sets only one. Gate on `isVerified`,
which is what the rest of the code checks, and set both when you change either.

The client also reports a club status of `"None"` when a user has no club at
all. That is a value the schema does not define and it is not the same as
`Pending`.

## API surface

All paths are relative to the base URL, so with the default they start
`http://localhost:5000`. `auth` means the route requires a token.

### `/api/auth`

| method | path | auth | purpose |
| --- | --- | --- | --- |
| POST | `/register` | no | create an account, always as `Student` |
| POST | `/login` | no | sign in, sets the cookie, returns the token |
| POST | `/logout` | no | clears the cookie |
| GET | `/me` | yes | current user |
| PUT | `/profile` | yes | update own profile |

### `/api/events`

| method | path | auth | purpose |
| --- | --- | --- | --- |
| GET | `/` | no | published events, or nearby if coordinates are given |
| GET | `/search` | no | filter by `q`, `category`, `district` |
| GET | `/recommendations` | yes | scored against the user's interests |
| GET | `/organizer/:organizerId` | no | one club's events, any status |
| GET | `/:id` | optional | one event; unpublished needs owner or Admin |
| POST | `/create` | yes | create, multipart with a `poster` file |
| PUT | `/:id` | yes | update |
| DELETE | `/:id` | yes | delete |
| PATCH | `/integration/google-sheet/:id` | yes | swap the external sign up link |
| GET | `/diag/ping` | no | liveness, no database |

`GET /api/events` is two endpoints in one, decided by whether `lat` or `lng` is
present:

- Neither: every published event, oldest first.
- Either: a nearby search using `$near` on the GeoJSON point.

Nearby parameters are `lat`, `lng`, `radius` in kilometres and `limit`. The
server defaults are 10 km and 100 results, capped at 200. Coordinates outside
their valid range are rejected with 400 rather than being passed to Mongo, so a
typo produces a clear message instead of a driver error.

The client asks for 20 km when you press the near me button. That number is in
`Events.jsx`, not on the server, so changing the radius means changing the
client.

Note the two filters that decide what is visible. `searchEvents` and
`getNearbyEvents` filter on `status: "published"`, and `getAllEvents` does too.
`getEventsByOrganizer` deliberately does not, because a club needs to see its
own drafts. If you add a read path, decide which side of that line it is on.

### `/api/registrations`

| method | path | auth | purpose |
| --- | --- | --- | --- |
| GET | `/my` | yes | the caller's registrations |
| GET | `/club/all` | yes | registrations for the caller's events |
| POST | `/:eventId` | yes | register |
| GET | `/:eventId` | yes | who is registered |

### `/api/clubs`

| method | path | auth | purpose |
| --- | --- | --- | --- |
| POST | `/register` | yes | apply, multipart with a `logo` |
| GET | `/status` | yes | the caller's application status |
| PUT | `/profile` | yes | edit the club |
| GET | `/my-events` | Club | events this club created |
| DELETE | `/events/:id` | Club or Admin | remove an event |
| GET | `/pending` | Admin | applications awaiting review |
| GET | `/all` | Admin | every club |

### `/api/admin`

| method | path | auth | purpose |
| --- | --- | --- | --- |
| GET | `/users` | Admin | all accounts |
| DELETE | `/users/:id` | Admin | remove an account |
| GET | `/registrations` | Admin | registrations across events |
| PUT | `/clubs/approve/:id` | Admin | verify a club |
| PUT | `/clubs/reject/:id` | Admin | refuse a club |

### `/api/payments`

| method | path | auth | purpose |
| --- | --- | --- | --- |
| POST | `/khalti/initiate` | yes | start a Khalti payment |
| POST | `/khalti/verify` | yes | confirm it |
| GET | `/esewa/form` | yes | fetch an eSewa payment form |
| POST | `/esewa/verify` | yes | confirm it |

Both providers need merchant keys in the server environment. Without them the
paid registration path fails, which is expected locally.

### `/api/contact`

`POST /` accepts a contact message. No auth.

### How search actually works

There are two search paths and they cover different fields, which is a
recurring source of confusion.

`GET /api/events/search?q=` is server-side: one case-insensitive regex across
`title`, `description`, `venue` and `tags`, plus optional `category` and
`district`. User input goes through `escapeRegex` first, so `c++` and `(a|b)`
are literal text, not patterns.

The public events page does **not** use that endpoint. It calls `GET /api/events`
once and filters in the browser on `title`, `district` and `venue` with
`includes`, on every render, with no network call and no debounce. So
`description` and `tags` are only searchable through the endpoint the page
ignores. If a search appears to miss an event because of its description, that
is why.

Category and district filters live in the URL via `useSearchParams`, so those
lists are linkable. The free-text search does not, so a searched list cannot be
shared or survived by a reload.

Near-me is a separate filter, not a search. It is not its own endpoint; it is
`GET /api/events` with coordinates, which routes to `getNearbyEvents` instead of
`getAllEvents`. The page sends `radius: 20` and gets 20km.

Do not read the `radiusKm = 10` default in the service signature as a cap. The
controller resolves `radius === undefined ? 10 : Number(radius)` and passes the
result straight through, so the default only applies when no radius is sent at
all. The value that is genuinely capped is `limit`, at 200, via
`Math.min(maxResults, 200)`. Coordinates are range checked and a request with
`lat` outside -90..90 or `lng` outside -180..180 is rejected with 400.

`$near` also needs a 2dsphere index; when it is missing, the service catches
that specific error and returns an unsorted list of published events rather
than surfacing a raw Mongo error.
`scripts/syncIndexes.js` creates the index.

A prefix type-ahead using binary search was designed once and never built. It
was dropped deliberately, and the reasoning is worth keeping before anyone tries
again: the dataset is single or double digit events, so an in-browser filter is
already imperceptibly fast and a sort plus a dropdown would add complexity to
remove a cost that does not exist. More importantly, binary search matches
*prefixes*, and these titles are not written as prefixes of what people search
for. Searching `robotics` should find `National Robotics Championship`, which a
prefix search on title cannot do.

`client/src/utils/eventSorter.js` is a leftover from that plan. It exports
`sortEventsPriority` and nothing imports it.

## State on the client

Redux Toolkit, four slices under `client/src/redux`: `auth`, `events`,
`organizer` and `admin`. Each has a slice and an action file.

`redux/hooks.js` exports `useAppDispatch` and `useAppSelector`. Use them rather
than importing `useDispatch` and `useSelector` directly, so there is a single
place to change if this ever becomes TypeScript.

Be clear about what that buys you today: **nothing**. This project has zero
`.ts` files and no `tsconfig.json`, and `useAppSelector` is a plain re-export
of `useSelector`. There is no type safety in it whatsoever. It is a convention,
not a requirement, and it is worth knowing that before anyone cites it as
enforcement.

Thin hooks in `client/src/hooks` wrap the slices so components do not import
Redux directly: `useAuth`, `useEvents`, `useOrganizer`, `useAdmin`,
`usePayment`, plus `useFocusTrap` and `useReveal`, which are UI utilities
rather than data hooks.

Services in `client/src/services` are the only place that calls axios. If you
find yourself writing `api.get` inside a component, add a method to the service
instead. That is what keeps the base URL, the credentials flag and the error
interceptors in one place.

## Conventions

**Design tokens live in `client/src/index.css`**: `--color-paper`, `--color-ink`,
`--color-ink-soft`, `--color-hairline`, plus semantic status colours. Use those
classes, not raw palette values. The codebase has around 1,350 raw palette
references across 49 JSX files that were written before the tokens existed;
they are being migrated, so do not add new ones.

**`tailwindcss-animate` is not installed.** The `animate-in`, `fade-in` and
`zoom-in-95` utilities do not exist. Anything that looks animated is either a
custom class or a bug.

**Interactive targets are at least 44 by 44 pixels.** Icon buttons need a real
hit area, not padding that only looks like one. Any control that is only
reachable by hovering fails on touch and is invisible to keyboard users.

**Keyboard and focus are not optional.** Interactive elements that are not
buttons must carry a role, a tab index and key handlers. This is why
`ConfirmDialog` and the account sheet exist instead of inline handlers.

**Comments explain why, not what.** Most of this repository is lightly
commented and that is deliberate. A comment that restates the line below it is
noise.

## Linting

`npm run lint` in `client`. Two project specific rules are registered in
`client/eslint.config.js` and both are errors:

- `eventhub/no-undefined-jsx-component` catches a JSX tag whose component was
  never imported or defined. It exists because that failure mode is a blank
  page with no error message, which cost real debugging time here.
- `eventhub/no-orphan-reveal-class` catches a `reveal` animation class left on
  an element with nothing to reveal it, which is how dead animation classes
  accumulated.

Both are implemented in `client/eslint-rules/eventhub.js`. If you need to opt
out deliberately, disable the rule on the line with a comment saying why rather
than turning it off in the config.

## Startup order

`server/src/app.js` connects to MongoDB before it listens, so a database that
is not reachable produces no server at all rather than a server that 500s on
every request. On boot it also runs `syncIndexes`, which reconciles MongoDB
indexes with the Mongoose schemas and logs how many each model has. Index
mismatches after a schema change are therefore handled automatically.

## Known gaps

Worth knowing before you trust a part of this.

- There are no tests of any kind. `npm test` in `server` is a placeholder that
  exits 1. Verification has been lint, build, module compilation and manual
  requests against a running server.
- `client/scripts/render-check.mjs` renders every route through React's
  server renderer and reports which ones throw on mount. It is uncommitted
  scaffolding, and 30 of 31 routes pass. It runs no effects and makes no API
  calls, so it catches render crashes and nothing else.
- There is no visual regression baseline, so UI changes were reviewed by
  reading rather than by comparing screenshots.
- The production client bundle is one 1.3 MB chunk and Vite warns about it.
  There is no route level code splitting.
- A club has both `status` and `isVerified`, which are redundant. Every current
  writer keeps them in step, but nothing enforces that, as noted above.
- `Events.status` describes states nothing writes, as noted above.
- Demo posters generated by the seed are avatars rather than real event
  photography, so a fresh install looks emptier than a real one.
