# EventHub Bug Fix Report

Every issue below was found by reading the code and exercising the running app,
then fixed and verified. Each section names the commit that carries the fix.

Commits, newest first:

| Commit | Area |
| --- | --- |
| `3e53864` | 404 page, error boundary, placeholder identity |
| `6d32995` | Dead analytics dropdown, dead poster image, dead contact form |
| `72efacc` | Malformed event id returned 500 |
| `2b57071` | Admin stat cards were not clickable |
| `eaca323` | CSV export did not work; organizer column always empty |
| `f9ad6f6` | Signup asked for a role the server would never grant |
| `119983d` | Client auth flow, routing and dead UI |
| `bbd1928` | Server auth, registration, payment, geospatial |

---

## 1. Security and authorization

### Signup let you pick your own role
`Signup.jsx` rendered a role selector and submitted it, but
`authService.js` forced every new account to `Student`. The form therefore
promised something the server silently ignored, and anyone reading the UI
would believe self-registering as an Admin or Club was possible. It is not,
and must not be.

The selector was removed. Club access now happens only through
`/club/register` plus admin approval, and the signup copy says so.
*(`f9ad6f6`)*

### Club role could be granted without approval
Approval is the only path that adds the `Club` role, enforced in
`clubService.approveClub`. Verified end to end: signup, submit application,
admin approves, role appears, `/clubs/status` reports verified.
*(`bbd1928`)*

### Auth errors leaked internals
Registration and login failures returned raw driver messages that could
include collection names and query shapes. Responses are now shaped
deliberately, and unexpected errors are logged server side rather than sent
to the client. *(`bbd1928`)*

### Contact form was an injection vector waiting to happen
The new endpoint forwards free text from the public internet into an HTML
email body. Every interpolated field is escaped before use, so a message
containing `<script>` cannot break the markup. *(`6d32995`)*

---

## 2. Controls that did nothing

These were the most damaging defects in the project: UI that looked finished
and silently did nothing.

### The analytics range selector was not connected to anything
`EventAnalytics.jsx` had a `<select>` offering 7 days, 30 days and all time,
with no `value`, no `onChange`, and no state. The chart underneath was
hardcoded to the last 7 days, so every option produced an identical graph.

It now drives real logic: daily buckets for 7 and 30 days, monthly buckets
for all time. *(`6d32995`)*

### The headline count disagreed with the chart it sat next to
Fixing the dropdown exposed a second bug. The chart bucketed registrations
by UTC day key, while the headline figure filtered on exact instants, so
around midnight the two disagreed. "All Time" was worse: it counted records
whose `createdAt` could not be parsed, which the chart dropped entirely, so
the total could read higher than the sum of every bar.

Both now derive from one shared window definition and drop unparseable dates
together. Verified that the headline equals the sum of the bars across
boundary cases, a 400-registration set, malformed dates, and empty and null
input. *(`6d32995`)*

### The contact form only wrote to the console
`handleSubmit` called `e.preventDefault()` and then `console.log("Message
sent!")`. The primary call to action on the contact page did nothing at all.

It now posts to a new `POST /api/contact`, which validates the payload,
rate limits to 5 requests per IP per 15 minutes, and forwards to Resend. The
form shows field-level validation, a sending state, and success or failure
toasts. A missing mail configuration returns 503 with an "email us
directly" message rather than blaming the visitor. Messages were confirmed
delivered, with real Resend message IDs. *(`6d32995`)*

### Admin stat cards were not links
The four summary numbers looked like navigation but were plain `div`s.
Wrapped in React Router `Link`s to `/admin/clubs`, `/admin/users`,
`/admin/events` and `/admin/club/verification`, so they are now focusable
with the keyboard and show a pointer. *(`2b57071`)*

### CSV export produced nothing usable
The download button built a filename, created an anchor, never appended it
to the document and never clicked it. Columns were joined with bare commas,
so any value containing a comma, quote or newline corrupted the file. The
organizer column was always empty because of the populate bug in section 4.

Rewritten with RFC 4180 quoting, a UTF-8 BOM so Excel opens it correctly,
date-stamped filenames, a clear message when the filtered result set is
empty, and a cleaned-up object URL. Round-tripped through a real CSV parser
including a value with an embedded comma and quote. *(`eaca323`)*

### Every event without a poster showed a broken image
Event posters fell back to `via.placeholder.com`, a service that has been
shut down, so the fallback was itself a dead request and the browser painted
a broken-image icon. Replaced with an inlined SVG that cannot fail to load,
plus an `onError` fallback for posters that 404 after a folder rename. The
duplicated local `normalizePoster` helper was removed in favour of the
shared one. *(`6d32995`)*

---

## 3. Errors that crashed instead of answering

### A malformed event id returned 500
`/api/events/:id` passed the raw parameter to Mongoose. A non-ObjectId string
made `findById` throw a `CastError` with no handler, so a bad URL produced a
500 and a stack trace in the response instead of a 404.

Added a shared `isValidObjectId` / `sendInvalidId` pair and guarded
`getEventById`, `updateEvent` and `deleteEvent`, each returning consistent
JSON. *(`72efacc`)*

Note: `/api/events/nearby` is not a route and now correctly returns 404. The
real nearby search is a query on the collection root,
`GET /api/events?lat=27.7172&lng=85.3240&radius=25`.

---

## 4. Data that never arrived

### The organizer column was always "Unknown"
`adminController.js` populated `event` but requested `organizer` as a field
*inside* the event projection. Organizer lives on the separate `RegisterClub`
collection, so it was never selected.

Replaced with a nested populate. Verified across all 24 registrations that
`event.organizer.name` is now populated rather than falling back.
*(`eaca323`)*

### A club application held a status the schema forbids
`RegisterClub.status` is an enum of `Pending`, `Approved`, `Rejected`, but
one row held `"Verified"`. Mongoose only validates on write, so it had been
sitting there undetected.

It was not user-visible, because the client keys off the `isVerified`
boolean rather than the status string, but it was invalid data. Normalized
to `Approved`, matching the 5 other clubs. *(`data cleanup)*

---

## 5. Print output included the whole application

`AdminEventDetails` had a print button that triggered `window.print()`, but
nothing was styled for print. Printing produced the navbar, sidebar and
buttons on the paper along with the event.

Added print styles that hide navigation, sidebars and controls, and remove
the decorative background. *(`eaca323`)*

---

## 6. Missing error states

### Unknown URLs silently redirected to the home page
The catch-all route was `<Route path="*" element={<Navigate to="/" />} />`. A
dead or mistyped link bounced the visitor home with no explanation and broke
back-button behaviour.

Replaced with a 404 page offering go back, home, and browse events, rendered
inside the main layout so the navbar stays available. *(`3e53864`)*

### A render crash blanked the entire app
Any uncaught render error unmounted the whole React tree to a white screen
with no way out short of a manual refresh.

Added an error boundary around the router that shows a retry screen, with
the underlying error printed only in development builds. *(`3e53864`)*

---

## 7. Placeholder content

Content that read as finished but was not real:

| Location | Was | Now |
| --- | --- | --- |
| Event poster fallback | dead `via.placeholder.com` | inlined SVG *(6d32995)* |
| Contact page | `+977 98XXXXXXXX` | real contact details *(6d32995)* |
| Terms and privacy `mailto:` | `support@eventhub.com.np`, a domain nobody owns | maintainer address *(3e53864)* |
| Registration phone field | `+977 98XXXXXXXX` | `9812345678` *(3e53864)* |
| Profile name field | `Identity Name` | `Your name` *(3e53864)* |

Deliberately left alone: generic field hints such as `name@example.com`, the
seeded `admin@eventhub.dev` demo login, and the genuine eSewa gateway URLs.

---

## 8. Accessibility

### Registration cards could not be reached by keyboard
Every card on "My Registrations" was a `div` with an `onClick`. It looked
clickable, but it was not focusable and could not be opened with Enter, so a
keyboard or screen reader user had no route from the list to the event it
described. Each card is now a `Link`, which also makes middle-click and
"open in new tab" behave the way the cursor already implied, and it carries
a visible focus ring. *(`adb7d64`)*

### Three images had no alt text
The user and club detail modals in the admin and club areas rendered images
with no `alt` attribute at all, so a screen reader read out the file name.
They now describe whose picture they show. The decorative avatars that
already used `alt=""` were left alone, since the name sits beside them in
text and an empty alt is the correct choice there. *(`adb7d64`)*

No `href="#"` placeholder links were found anywhere in the client.

---

## 9. The homepage and event cards

The public homepage had been assembled out of filler that looked designed. None
of it was wrong in a way a linter can catch, because every element rendered, but
a lot of it was not true. *(`ef639e5`)*

### Numbers that were not real

The page claimed 120+ events hosted, 3,500+ students registered, 45+ active
organizers and 12+ departments. The database at the time of this work holds
**9 events and 16 users**. The four figures were hardcoded, animated up from
zero on scroll, and presented as measurements. The stat band has been removed
rather than corrected, because a homepage that has to invent its own traction has
no honest metric to show yet.

The four floating cards around the illustration were worse. They advertised
`HackFest 2026` at `148 / 200 seats` and `CTF Challenge` with `Only 5 seats left!`.
None of those events existed. Fabricated scarcity on invented events is the most
damaging version of this problem, so all of it is gone.

The eyebrow badge reading `Nepal's #1 IT Event Platform` is also unverifiable and
has been dropped.

### Decoration standing in for content

Two radial glows, a dot-grid overlay with no canvas or map underneath it, a
spinning dashed ring, three bobbing dots, and a hand-drawn SVG monitor. These
now combine with `slideUp`, `float`, `bob`, `spin` and `pulse` keyframes to run
**five infinite animations at once**, none of which had a reduced-motion escape.
Motion is now one authored stagger on the event grid, transform and opacity
only, and the global stylesheet neutralises it under `prefers-reduced-motion`.

The hero's right column now holds a **Next up** panel listing the next three real
upcoming events from the API, so the space carries information instead of filling
it.

### The interface could not be tabbed through

There was no `:focus-visible` rule anywhere in the client, so keyboard focus
moved invisibly through every page. There is now a visible ring on all focusable
elements, applied only for keyboard interaction.

### The event card was a div pretending to be a link

`EventCard` was a `div` with an `onClick` and a `navigate()` call. It looked
clickable and had `cursor-pointer`, but had no role, was not focusable, could not
be opened with Enter, and could not be middle-clicked or opened in a new tab. It
is now a single `Link`.

The card also scaled to `1.03` on hover and `0.95` on press, which shifted its
siblings in the grid every time the pointer crossed it, so the card moved out from
under the cursor. The lift is now shadow and border, with the only movement being
the poster inside a clipped box, which cannot affect layout. Each metadata row
previously sat in its own bordered pill, nesting cards inside a card; those are
now flat rows.

### The homepage card was reading fields that do not exist

`Home.jsx` carried its own private copy of `EventCard`, distinct from the shared
one, and it read `seats` and `registeredCount`. The API returns
`participantCount` and `currentParticipants`. Neither name it asked for exists,
so its capacity bar was permanently `null` and **never rendered at all**. The
homepage now uses the shared component, and the duplicate is gone.

That card also defaulted capacity to `100` when the field was absent, then drew a
progress bar against that invented figure. When capacity is genuinely unknown the
card now says so rather than reporting a number.

### Headings were rendered with fake weights

`index.html` loaded Poppins at `400,500,600`, while the client uses `font-extrabold`
(800) and `font-black` (900) in roughly 320 places. The browser was synthesising
every heavy weight on the site. The real weights are now loaded, and Space
Grotesk carries the display voice on marketing surfaces.

### Verification for this pass

- Client ESLint: clean.
- Client production build: clean, 2639 modules, unchanged from before.
- `impeccable detect` on `Home.jsx`, `EventCard.jsx` and `index.css`: no findings.
- All three modules confirmed to compile in the running Vite dev server, and
  confirmed to be served from `index.html` with both font requests present.
- Confirmed in the built CSS that `--color-paper`, `--color-ink`, `--font-display`,
  the `:focus-visible` rule, the `prefers-reduced-motion` block and the `rise`
  keyframes were all emitted by Tailwind, so the tokens are real rather than
  silently dropped classes.

---

## 10. Event imagery, and the About, Contact and Event pages

### Events with no poster now get a drawn placeholder

The old fallback was a grey box with a generic picture glyph and the words "No
poster uploaded". It read as an error rather than as a placeholder, and its
caption sat at **3.86:1** against its own background, under the 4.5:1 floor.

Events now fall back to a drawn composition built from the event's own category
colour: a tinted ground, concentric arcs, and the event's initials and a short
caption. Nine category palettes are matched by keyword, so a wall of poster-less
events reads as distinguishable cards rather than one grey slab. It is
deliberately geometry, not illustration, and it never invents an event name.

One path now serves every case. `getEventPoster` returns the real poster when
there is one and the placeholder otherwise, and `onPosterError` catches the third
case, a poster URL that resolves but returns 404. Previously a broken poster URL
on the event hero left a broken-image icon in the largest element on the page,
and `EventCard` merely hid the broken image with `visibility: hidden`, which
left an empty grey rectangle. `EventDetails` also carried its own private copy
of the URL-normalising function; both now use the shared module.

Building this surfaced a bug worth recording: an event titled "AI & ML Summit"
produced invalid XML, because the `&` went into SVG text unescaped, and the
browser then rendered a broken image. That is the exact failure the placeholder
exists to prevent. Text is now escaped, and taking the initials from the escaped
string instead of the raw one re-introduced the same stray ampersand, which the
verification script caught on the first run.

### The QR dialog could not be closed and announced itself as an empty button

The close button on the QR dialog was rendered with **no icon and no label**. It
was invisible on the page, and to a screen reader it was an unlabelled button
with no name. The dialog itself had no `role="dialog"`, no `aria-modal`, no
focus handling, and could be dismissed neither with Escape nor by clicking the
backdrop.

### Five unlabelled links and an invented badge

The organizer's five social icons were icon-only anchors with no accessible
name, so a screen reader announced five identical bare links. Each now carries
an `aria-label` naming the club and the network.

The organizer panel also displayed a hardcoded **"Verified Legacy"** badge,
which asserted nothing true about any club. It now reflects the stored
verification flag and says nothing when that flag is unset.

### Other fixes on these pages

- **Contrast.** Seven labels on the event page used `slate-400` on white, roughly
  2.6:1, including "Date and time", "Available Seats", "Total", "Registration
  Fee", "QR Info" and "Share". All now clear 4.5:1. The same applied to the
  contact page's attribution line.
- **Nine-pixel text.** "QR Info" and "Share" were set at 9px, "Registration Fee"
  and "Organized By" at 10px, with `font-black` and wide tracking. That is below
  any readable minimum. All are now 14px or larger with normal weight.
- **Invented and negative seat counts.** Capacity still defaulted to 100 when the
  field was absent, and `availableSeats` was not clamped, so an overbooked event
  could display "-4 Available Seats". When capacity is genuinely unknown the page
  now says so.
- **Share could throw.** `navigator.clipboard.writeText` was awaited with no error
  handling, and that API is unavailable outside a secure context. It now falls
  back to the platform share sheet and then to a manual prompt.
- **Dialog dismissal** and **`window.open`** without `noopener`, which leaves
  `window.opener` reachable from the opened page.
- **Form errors were invisible to assistive tech.** The contact form rendered
  validation messages as bare paragraphs with no link to their input, and the
  fields never reported an invalid state. Each now has an `aria-invalid`, an
  `aria-describedby` pointing at a `role="alert"` message, plus `autocomplete`,
  `maxLength` matching the server limits, and `aria-busy` while sending.
- **A nested component in render.** The error message helper was declared inside
  the component body, so it unmounted and remounted on every keystroke. It is a
  plain render helper now.
- **Stable hover.** The register button scaled to 1.02 and pressed to 0.95, and
  every button on the event page lacked a pointer cursor.
- The loading spinner had no accessible text and the error panel no `role`, so
  both were silent. The poster gradient placeholder and a decorative top wash
  were removed, along with a 40px corner radius on the organizer panel.
- About was centred above `md` but left-aligned below it, mixed `gray-900` with a
  `#475569` hex for the same role, and ran body copy past a 75-character measure
  at wide viewports. It now uses the shared type tokens and an explicit measure.

### Verification for this pass

- Client ESLint: clean. Client production build: clean, 2639 modules.
- `impeccable detect` on all five touched files: no findings.
- All five modules confirmed to compile in the running Vite dev server, and
  `AdminEventDetails`, the other consumer of this image module, still resolves.
- The generated placeholder was evaluated directly against five inputs including
  `AI & ML <Summit> "2026"`, an empty title and a missing category, and each
  checked for well-formed XML. This is what caught the ampersand bug.
- Audited the three pages afterwards: zero remaining `slate-400`-on-white labels,
  zero text under 12px, and zero buttons without an explicit cursor.

---

## 11. Verification

### Automated

- Client ESLint: clean.
- Client production build: clean, 2639 modules.
- Server syntax check: all 38 files parse.
- Contact endpoint: empty body 422, malformed email 422, missing message 422,
  oversized name 422, undersized message 422, rate limiter trips on the 6th
  request, valid messages confirmed delivered via Resend.
- Trend windows: headline equals chart sum for all three ranges, across
  boundary timestamps, 400 registrations, unparseable dates, empty and null
  input, and an unrecognised range value.
- Custom smoke suites run during the earlier passes: auth 20/20,
  registration 22/22, seed 39/39, documentation 12/12, club approval 5/5,
  geospatial 14/14.
- Final end to end smoke run, 17/17 passing: health, public event list, geo
  query, malformed id 404, `/events/nearby` 404, contact validation 422,
  unauthenticated admin refused with 401, admin login, admin registrations
  and users, clubs all and pending, student and club login, a student
  blocked from admin with 403, and a registration attempt that submitted
  `role: "Admin"` being stored as `["Student"]`. The probe account created by
  that last check was deleted again, and the database was re-counted
  afterwards to confirm nothing was left behind.

### Live, against the running servers

```
health                {"status":"ok","database":"connected"}
GET /api/events       200
POST /api/contact     422 for an empty body, as intended
GET /events/nearby    404
GET /api/events?lat=27.7172&lng=85.3240&radius=25   200, 6 events
all 24 registrations  organizer populated
deep links /contact, /this-does-not-exist   200, so the router renders 404
```

### Data state after the work

16 users, 6 clubs, 9 events, 24 registrations. All 6 clubs are `Approved` and
verified, with no row left holding a status outside the schema enum. No event
is missing a poster, no registration points at a deleted event, and there are
no orphaned rows. Test accounts created while verifying these fixes were
removed again and the counts re-checked afterwards.

### Known gaps

- No formal automated test suite exists. `npm test` on the server is a
  placeholder, and the checks above were run as one-off scripts. This is the
  single biggest thing missing from the project.
- Khalti and eSewa payment flows cannot be fully exercised without live
  merchant credentials.
- The production bundle is a single 1.3 MB chunk and emits a size warning.
  Route level code splitting would fix it.
- Some accounts in the database look like manual test signups rather than
  seeded data. They were left in place rather than deleted, because they may
  be real accounts belonging to the project team.
- Every seeded event poster is a generated `ui-avatars.com` avatar rather than a
  real event image, so the event grid currently reads as unpopulated. The card
  was designed to hold up without photography, but real posters are the single
  biggest remaining visual improvement available.
- The redesign covered `Home.jsx` and the shared `EventCard`. The other public
  pages, and `HorizontalEventCard` (used only by `ClubEventListing`), still carry
  the older indigo-on-white styling, so the site is not yet visually uniform.
- No visual regression test or screenshot baseline exists, and the redesign was
  verified by build output, module compilation and the design linter rather than
  by eye, because no browser automation is installed in this project.
