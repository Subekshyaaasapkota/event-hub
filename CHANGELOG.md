# Changelog

All notable changes to EventHub are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [semantic versioning](https://semver.org/spec/v2.0.0.html)
as a convention rather than a strict contract, since it is pre-release.

## [Unreleased]

Nothing yet.

## [1.0.0] - 2026-10-05

First tagged state of the application. Everything below landed as part of a
review pass over the existing code, followed by the first hardening work on
registration.

### Added

- Project SVG mark at `client/public/eventhub-logo.svg`, used for the favicon,
  header, footer, login page and both sidebars. The tab icon was previously
  Vite's default logo.
- Sign out confirmation dialog, so signing out is no longer a single
  irreversible click. Focus is trapped while it is open and restored on close.
- Automated test suite for the registration rules, run with `npm test` in
  `server`. 48 tests across the service and controller.
- Seat holds for paid events. A seat is now taken when the registration is
  created rather than when payment clears, with a 30 minute expiry.
- Generated event posters to replace avatar images used as event artwork.
- `docs/DEVELOPING.md`, a developer guide covering the request lifecycle, the
  data model, the API surface and the design conventions.
- `docs/USING-EVENTHUB.md`, a plain language guide for running events.
- `docs/RECOMMENDATION_ENGINE.md`.
- Two ESLint rules for mistakes that previously reached the browser:
  an undefined JSX component, and an orphaned `reveal` class.
- Community and governance files: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `SECURITY.md`, `SUPPORT.md`, `CHANGELOG.md`, and GitHub issue and pull
  request templates.

### Fixed

- **Paid events could sell unlimited seats.** Capacity was checked against
  `currentParticipants`, which was only incremented once payment cleared. Any
  number of people could be mid checkout and all of them passed the check. A
  ten seat paid event sold as many tickets as anyone asked for.
- **Free events could oversell the last seat by one.** The count was read and
  then written as two operations, so two people could both read nine of ten.
- **Registration accepted an empty body.** Empty strings were dropped silently
  and every form field was optional in the schema, so a confirmed registration
  with no name, phone or email could be saved.
- **Phone validation accepted anything non empty** and forwarded it to the
  payment provider as `customer_info`.
- **Unpublished events were served to the public** event list.
- **`ClubDashboard` threw on a null user** during the auth check.
- **Four animation classes in the registration form were dead**, emitting no
  CSS at all, so the step transitions never animated.
- Signing out from the header was immediate and unconfirmed.
- A documentation claim about the near me radius that the code did not support.

### Changed

- The student view, profile page, user dashboard, club workspace, both
  sidebars and the events tab were rebuilt on one shared iOS HIG component set,
  with consistent focus rings, 44px targets and real design tokens.
- Palette usage moved toward the `paper`/`ink` tokens. Around 1,350 raw palette
  references remain and are being migrated out.
- Removed the remaining gradients from the payment pages and the indigo from
  the focus ring.
- The documentation was audited against the code and corrected where it made
  claims the code did not support.

### Known issues

Tracked in [docs/DEVELOPING.md](docs/DEVELOPING.md#known-gaps). The most
significant are the single large production bundle, the absence of route level
code splitting, and credentials present in the git history, which must be
treated as compromised and rotated.

[Unreleased]: https://github.com/Subekshyaaasapkota/event-hub/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Subekshyaaasapkota/event-hub/releases/tag/v1.0.0