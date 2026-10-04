# EventHub Client

The React frontend for EventHub. Single page app, no server side rendering, no
framework beyond Vite and React Router.

For the full architecture, the Redux shape, the API contract and the design
conventions, read [docs/DEVELOPING.md](../docs/DEVELOPING.md). This file is
the short version for working on the client specifically.

## Running it

```bash
cd client
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173.

The API has to be running too, on port 5000 by default. Start the server first.
If the client loads and every request fails, this is almost always the API not
running or `VITE_BASE_API_URL` pointing somewhere wrong, not a bug in the
client.

## There is no dev proxy

Vite is not configured to proxy `/api`. Every call goes straight to the origin
in `VITE_BASE_API_URL`, defaulting to `http://localhost:5000`.

This is deliberate and it is worth knowing why, because it is the reason you
will hit CORS errors rather than 404s. The backend validates the browser's
`Origin` header against `FRONTEND_URL` on its own. A dev proxy would strip the
origin, the backend would see no mismatch, and the check would pass
unconditionally in development while still protecting production. Failing loudly
locally is the point.

To point the client somewhere else:

```
VITE_BASE_API_URL=http://localhost:5000
```

No trailing slash. Vite only exposes variables prefixed with `VITE_`, and every
`VITE_` variable is shipped to the browser in the built JavaScript, so nothing
secret can go in this file. There is nowhere safe to put a secret on the client.

## Layout

```
client/src/
  components/
    common/     Navbar, Footer, dialogs, shared cards
    layout/     Page shells that wrap a route group
    admin/      Admin-only pieces
    auth/       Login and Signup pieces
    protected/  Route guards
    Organizer/  Club-only pieces
  pages/        One directory per audience, then one file per page
    public/     Events, EventDetails
    user/       Dashboard, Profile, RegisteredEvents
    club/       The club console
    admin/      The admin console
  hooks/        useAuth, useEvents, useAdmin and friends
  redux/        Store and slices
  services/     Axios calls, one function per endpoint group
  routes/       AppRoutes, the single source of truth for URLs
  utils/        Formatters, image URLs, CSV, constants
  api/          Axios instance and interceptors
```

Two conventions that are easy to get wrong:

**Routes live in one file.** `routes/AppRoutes.jsx` defines every URL in the app.
Do not invent a path in a component with `navigate("/somewhere")`. Look it up,
because a typo there is a 404 that no type checker will catch.

**Event detail is `/event/:id`, singular.** The list is `/events`. The plural
with an id in it is not a route. This has been got wrong before.

## Data fetching

State is Redux Toolkit, with Redux Persist keeping the auth token and a few UI
preferences across reloads.

Each resource has a hook, and pages use the hook rather than calling the service
directly, so loading and error state is handled in one place:

```js
const { events, loading, error, fetchEvents } = useEvents();
```

`fetchEvents` takes filters where the endpoint supports them, for example
`fetchEvents({ lat, lng, radius })` for the near me list.

A detail worth knowing, because the code reads like it says otherwise:
`getNearbyEvents` has a default parameter of `radiusKm = 10`, and it is easy to
assume that caps the radius at 10km. It does not. The controller resolves
`radius === undefined ? 10 : Number(radius)`, so your value is passed straight
through. The events page asks for 20km and gets 20km. The default only applies
when no radius is sent at all.

`limit` is the value that is genuinely capped, at 200.

## Adding a page

1. Create the file under the right `pages/` directory.
2. Add the route in `routes/AppRoutes.jsx`, wrapped in the layout and guard it
   needs. Guards are role based, so pick `Student`, `Club` or `Admin` on
   purpose rather than leaving it open.
3. If it needs new data, add it to the existing hook or create one beside it.
   Do not call Axios from the component.

## Conventions worth keeping

- Design tokens live in `index.css` as `--paper`, `--ink`, `--hairline` and
  friends. Use those, not raw palette colours, or the page drifts away from the
  rest of the app.
- Interactive targets are at least 44px. This is the single most common
  accessibility miss in the codebase.
- `tailwindcss-animate` is not installed. `animate-in`, `fade-in` and
  `zoom-in-*` do nothing here and should not be used.
- Above `z-50`, use the arbitrary form: `z-[60]`, `z-[70]`. Bare `z-60` is not
  emitted by Tailwind v4 and silently does nothing.
- Two lint rules are custom and both exist because of bugs that shipped:
  no unlabelled icon-only buttons, and no dead props. Read
  [docs/DEVELOPING.md](../docs/DEVELOPING.md) before removing either.

## Scripts

```bash
npm run dev       # dev server with hot reload
npm run build     # production build into dist/
npm run lint      # ESLint, including the two custom rules
npm run preview   # serve the production build locally
```

There is no test suite. `npm run build` and `npm run lint` are the gate.
