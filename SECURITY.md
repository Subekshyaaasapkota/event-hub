# Security Policy

## Supported versions

EventHub is a student project at version 1.0 and is not released as a stable
package, so there is no long term support branch to patch.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Any fork or older commit | No |

Fixes land on `main`. If you are running a fork, merge from `main` rather than
expecting a backport.

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Use GitHub's private reporting, which needs no email address and reaches the
maintainers without making the report public:

1. Go to this repository on GitHub.
2. Open the **Security** tab.
3. Choose **Report a vulnerability**.

If private reporting is not enabled for this repository, contact the maintainer
directly through the details in the repository profile and ask for a private
channel.

### What to include

- What the issue is and what an attacker could do with it.
- The route, file and function involved.
- Steps to reproduce, or a proof of concept if you have one.
- What you already tried.

You do not need to write a fix. A clear report is worth more than a rushed
patch, and you are welcome to submit the fix as a pull request afterwards.

### What to expect

This is an unpaid student project, so treat the timeline as best effort rather
than a guaranteed response window. In practice:

- **Acknowledgement:** within a few days.
- **Assessment:** after acknowledgement, with a judgement on severity.
- **Fix:** prioritised by severity. Critical issues are fixed before anything
  else in the backlog.

Please give maintainers reasonable time before disclosing publicly. We would
rather fix something quietly than ship a patch to an unpatched live system.

## What counts as a vulnerability here

In scope:

- Authentication or session handling that lets someone act as another user.
- Missing or bypassable authorization, particularly on the admin and club
  routes.
- Injection, traversal or SSRF through user supplied input.
- A registration or payment path that can be manipulated to take more seats
  than were sold, or to register without paying on a paid event.
- Personal data exposure through an API response or a log line.
- Secrets or credentials committed to the repository.

Out of scope:

- Missing rate limiting, unless it enables one of the above.
- Denial of service through volume.
- Self cross site scripting in a development build.
- Anything a user can already do to their own account.

## Known limitations

Stated plainly, because a security policy that pretends there is nothing to
report is not useful:

- **Credentials exist in the git history.** Early commits on this repository
  contain a database connection string and a signing secret. Treat anything
  from that history as compromised. If you run a fork of an old commit,
  rotate those credentials before exposing it to anyone.
- **The demo seed writes predictable values.** `npm run seed` in `server`
  creates demo accounts with fixed identifiers. Do not run it against a
  database that holds anything real.
- **There is no verification on email or reset flows** beyond what the code
  shows. Read the route before relying on it.
- **This is a pre-release academic project.** It has had no external security
  review and should not be treated as hardened for production use.

## Security relevant design notes

So a reviewer knows where to look:

- Authentication is stateless JWT. The signing secret lives in the environment,
  never in the repository. Rotating it invalidates every issued token at once.
- Admin and club routes are authorized per request against the role on the user
  document. There is no route level middleware guarantee, so each handler is
  responsible.
- Seat capacity is enforced with a conditional atomic update rather than a read
  followed by a write. Payment callbacks are idempotent and must stay that way.
- The client validates form fields for feedback only. The server is the trust
  boundary and validates everything independently.