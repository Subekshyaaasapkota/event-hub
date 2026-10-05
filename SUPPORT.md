# Support

## Where to ask

Most questions about EventHub have an answer already written down:

| You want to know | Read |
| --- | --- |
| How to install and run it | [README.md](README.md#installation) |
| How the thing is built | [docs/DEVELOPING.md](docs/DEVELOPING.md) |
| How to use it as a student or organizer | [docs/USING-EVENTHUB.md](docs/USING-EVENTHUB.md) |
| What the recommendation engine does | [docs/RECOMMENDATION_ENGINE.md](docs/RECOMMENDATION_ENGINE.md) |
| How to contribute | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Something is broken | Open an issue, see below |

## Reporting a bug

Use the bug report template in this repository's **Issues** tab. It asks for the
route, the account role and what you expected, which is the minimum needed to
reproduce anything.

What helps most:

- The exact URL and what you were doing.
- Whether it happens every time or sometimes.
- The browser and, if it is the client, the window width.
- The console or server log line, if there is one.

## Getting help inside the app

EventHub has an in app support centre with the terms, privacy policy and
frequently asked questions. It is reachable from the footer of every page.

## Maintainer

**Subekshya Sapkota**, `subekshyasapkota686@gmail.com`. Email is slower than an
issue but reaches one person directly, and it is the right channel for anything
about a pull request or about this project in general.

## Known issues

Before opening an issue, check whether it is already listed in
[docs/DEVELOPING.md](docs/DEVELOPING.md#known-gaps). Several honest limitations
are documented there, including:

- No route level code splitting, so the production bundle is one large chunk.
- Some redundant fields on the club model that nothing enforces.
- Event statuses that no code path currently writes.

## What not to file here

- **Security problems.** These go through [SECURITY.md](SECURITY.md), not a
  public issue.
- **Feature requests with no discussion.** Open a discussion or an issue first
  so it can be agreed before anyone builds it.
- **Support about using other software.** This is a student project with no
  commercial support obligation.

## Note on scope

EventHub is an academic project, so responses are best effort and happen when
maintainers are around. If you need a guaranteed response, this is not the
right place to depend on.