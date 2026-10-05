# Contributing to EventHub

Thanks for looking at this. EventHub is a student run project, so contributions
of every size are welcome, from a one line typo fix to a whole feature.

If something in here is wrong or out of date, correcting it is a contribution.

## Before you start

- For anything touching architecture, the data model or the API contract, read
  [docs/DEVELOPING.md](docs/DEVELOPING.md). It is the real reference and this
  file does not repeat it.
- If you are picking up an open issue, comment on it first. It avoids two people
  writing the same fix.
- For anything security related, do **not** open a public issue. Read
  [SECURITY.md](SECURITY.md).

## Requirements

Node.js 20 or newer, v24 recommended. MongoDB has to be reachable, either
locally or through the connection string in `server/.env`.

## Setup

```bash
# server
cd server
npm install
Copy-Item .env.example .env     # PowerShell, use cp on macOS and Linux
npm run dev                     # nodemon, http://localhost:5000

# client, in a second terminal
cd client
npm install
npm run dev                     # vite, http://localhost:5173
```

The server connects to MongoDB before it starts listening, so if the database is
unreachable you get no server at all rather than a server that fails every
request. That is deliberate.

## Commands that matter

| Where | Command | What it does |
| --- | --- | --- |
| `server` | `npm test` | Vitest suite, 48 tests over registration rules |
| `server` | `npm run dev` | Nodemon with reload |
| `server` | `npm start` | Plain node, no reload |
| `server` | `npm run seed` | Writes demo accounts, clubs, events and registrations |
| `client` | `npm run lint` | ESLint, including the two project specific rules |
| `client` | `npm run build` | Production build to `client/dist` |
| `client` | `npm run preview` | Serves the production build locally |

## Before you open a pull request

Run all three. They are the whole gate:

```bash
cd server && npm test
cd client && npm run lint
cd client && npm run build
```

If a change touches the registration lifecycle, add a test for it. That code
owns money and seat counts, so it is the part of this repository where a
regression is worst. Tests live in `server/tests` and mock the Mongoose models,
so they never touch a real database. Do not point them at a live cluster.

## Conventions that will be checked in review

These are not style preferences, they are existing decisions. The reasoning for
each is in [docs/DEVELOPING.md](docs/DEVELOPING.md#conventions).

- **Use the design tokens.** `--color-paper`, `--color-ink`, `--color-ink-soft`,
  `--color-hairline` and the status colours live in `client/src/index.css`. A
  large number of raw palette classes are still in the codebase and are being
  migrated out. Do not add more.
- **`tailwindcss-animate` is not installed.** `animate-in`, `fade-in` and
  `zoom-in-95` do not exist as utilities. An animation is either a real class
  or it is dead code that renders as a static element.
- **Interactive targets are at least 44 by 44.** Icon buttons need a real hit
  area, and anything reachable only by hover fails on touch and is invisible to
  keyboard users.
- **Keyboard and focus are not optional.** Anything that behaves like a button
  needs to actually be one, or carry a role, a tab index and key handlers.
- **Comments explain why, not what.** The codebase is lightly commented on
  purpose. A comment restating the next line is noise.

Two ESLint rules in `client/eslint.config.js` enforce project specific mistakes
and both are errors:

- `eventhub/no-undefined-jsx-component` catches a JSX tag whose component was
  never imported. That bug renders as a blank page with no error message, which
  is why it has its own rule.
- `eventhub/no-orphan-reveal-class` catches a `reveal` class left on an element
  with nothing to reveal.

If one is genuinely wrong for your case, disable it on that line with a comment
saying why. Do not turn it off in the config.

## Commits and pull requests

- One concern per commit. A commit that fixes a typo and changes a model does
  not need to be one commit.
- Write the message for someone reading `git log` in a year. Explain the
  problem and the reasoning, not a list of files.
- Do not reformat code you are not otherwise changing. It buries the real diff.
- Never commit `.env` or any credential. See [SECURITY.md](SECURITY.md).

A pull request should say what changed, why, and how you verified it. Screenshots
for anything visual. If you are fixing a bug, name the issue.

## Reporting a problem

- Bug or feature: open an issue using this repository's issue templates.
- Security: [SECURITY.md](SECURITY.md), never a public issue.
- Behaviour or conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md), and
contributions are accepted under the [ISC licence](LICENSE).