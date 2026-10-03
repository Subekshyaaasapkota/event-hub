# EventHub Demo Data

Everything in this file is created by one command, so you can log in and click
around without typing anything by hand.

```
cd server
npm run seed
```

The seeder is safe to run as many times as you like. It updates existing
accounts instead of creating duplicates, so the IDs listed below stay valid.

---

## Demo accounts

Log in at `http://localhost:5173/login` with any row below.

| Role | Email | Password | User ID |
| --- | --- | --- | --- |
| Admin | `admin@eventhub.dev` | `Admin@12345` | `6abff329d46ed14812c5f66e` |
| Club | `robotics.club@eventhub.dev` | `Club@12345` | `6abff32ad46ed14812c5f66f` |
| Club | `photography.club@eventhub.dev` | `Club@12345` | `6abff32ad46ed14812c5f670` |
| Club | `startup.club@eventhub.dev` | `Club@12345` | `6abff32ad46ed14812c5f671` |
| Student | `student@eventhub.dev` | `Student@12345` | `6abff32ad46ed14812c5f672` |
| Student | `sita.thapa@student.eventhub.dev` | `Student@12345` | `6abff32ad46ed14812c5f673` |
| Student | `bikash.gurung@student.eventhub.dev` | `Student@12345` | `6abff32ad46ed14812c5f674` |
| Student | `anisha.basnet@student.eventhub.dev` | `Student@12345` | `6abff32ad46ed14812c5f675` |

### Which account to use for what

| Page or feature | Account to use |
| --- | --- |
| Admin dashboard, approve clubs, delete users | `admin@eventhub.dev` |
| Create an event, see registrant lists | any Club account |
| Register for an event, see "My Registrations" | any Student account |
| Profile, skills, recommended events | any account |

The Student account `student@eventhub.dev` already has six registrations, so
the "My Registrations" page is not empty when you present it.

---

## Your existing accounts

These were already in the database. The seeder resets their passwords to the
values below so you can log in with them too.

| Role | Email | Password | User ID |
| --- | --- | --- | --- |
| Admin | `sapkotasubekshya600@gmail.com` | `Admin@12345` | `6a785777394224e36ed2abc9` |
| Club | `sapkotasubekshya60@gmail.com` | `Club@12345` | `6a785668394224e36ed2abc8` |
| Student | `sapkotasubekshya6000@gmail.com` | `Student@12345` | `6a785f0c394224e36ed2abcb` |
| Student | `123@123.com` | `Student@12345` | `6a79308f2b40eab747b019b8` |
| Student | `156@56.com` | `Student@12345` | `6a7931282b40eab747b019b9` |

---

## Club profiles

| Status | Club | Club ID | Owner |
| --- | --- | --- | --- |
| Approved | EventHub Robotics Club | `6abff32bd46ed14812c5f676` | `robotics.club@eventhub.dev` |
| Approved | EventHub Photography Society | `6abff32bd46ed14812c5f677` | `photography.club@eventhub.dev` |
| Approved | EventHub Entrepreneurship Cell | `6abff32bd46ed14812c5f678` | `startup.club@eventhub.dev` |
| Pending | Himalayan Trekkers Collective | `6abff32bd46ed14812c5f679` | none |

Himalayan Trekkers Collective is left `Pending` on purpose. Log in as the
Admin, open the Admin dashboard and approve it, which demonstrates the club
approval flow without any setup.

---

## Events

| Status | Event | Category | Type | District | Date | Price | Seats | Registrations | Event ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| published | Intro to Web Development Bootcamp | Workshop | physical | Kathmandu | +6 days | Free | 30 | 4 confirmed | `6abff34bd46ed14812c5f693` |
| published | AI and Machine Learning Seminar | Seminar | online | Kathmandu | +9 days | Free | 100 | 5 confirmed | `6abff34bd46ed14812c5f694` |
| published | National Robotics Championship 2026 | Competition | physical | Lalitpur | +24 days | NPR 1500 | 10 | 1 pending | `6abff34bd46ed14812c5f695` |
| published | Photography Walk: Patan Durbar Square | Meetup | physical | Lalitpur | +4 days | Free | 4 | 4 confirmed, full | `6abff34bd46ed14812c5f696` |
| published | Git and GitHub Masterclass | Workshop | online | Kathmandu | +12 days | Free | 25 | 2 confirmed | `6abff34cd46ed14812c5f697` |
| published | Tech Startup Pitch Night | Competition | physical | Kathmandu | +17 days | NPR 500 | 40 | 1 pending | `6abff34cd46ed14812c5f698` |
| draft | Hackathon: Build for Nepal | Hackathon | physical | Kathmandu | +31 days | Free | 50 | none | `6abff34cd46ed14812c5f699` |
| completed | Inter College Debate 2025 | Competition | physical | Kathmandu | 40 days ago | Free | 20 | 5 confirmed | `6abff34cd46ed14812c5f69a` |

Dates are relative to the day you run the seeder, so the list never goes stale.

### Why each event is here

| Event | What it demonstrates |
| --- | --- |
| Intro to Web Development Bootcamp | A normal free event with several registrants, good for the registrant list screen |
| AI and Machine Learning Seminar | An online event, so the Online badge and the "link shared after registration" venue text are shown |
| National Robotics Championship 2026 | A paid event with a `Pending` registration, this is the one to use for the payment screens |
| Photography Walk | Already full at 4 of 4 seats, shows the "event is full" state and the full seat bar |
| Git and GitHub Masterclass | A second free workshop, useful for testing search by category |
| Tech Startup Pitch Night | A second paid event, useful for testing search by district |
| Hackathon: Build for Nepal | Left as `draft`, so you can demo publishing it from the club dashboard. Drafts are hidden from search and from the public list |
| Inter College Debate 2025 | Already in the past, gives the dashboards real history to show |

---

## Things worth showing during the presentation

1. **Sign up with any email.** New accounts always get the `Student` role. A
   student cannot pick `Club` or `Admin` at signup, even if the browser sends
   that in the request.
2. **Club approval.** Log in as the Admin, open the Admin Dashboard and follow
   the "Verify Clubs" link. Himalayan Trekkers Collective is waiting there,
   approve it and it flips to Approved and verified.
3. **Search.** On the events page try `?q=robotics`, then filter by
   `Workshop` and by district `Lalitpur`.
4. **Registration limits.** Photography Walk is already full. Try to register
   for it as any Student and the server refuses with `This event is already
   full`, and the seat count stays at 4 of 4. Then register for the Git and
   GitHub Masterclass and watch the seat count go up.
5. **Registrant privacy.** Log in as a Student and try to open the registrant
   list of an event you did not create. It returns `403`. Log in as the Club
   owner and the same link works.
6. **Payment amounts come from the server.** Open the payment screen for the
   National Robotics Championship and try editing the amount in the browser
   console before submitting. The server ignores the client value and charges
   the price stored in the database.
7. **Publishing a draft.** Log in as a Club account, open the Hackathon draft
   and publish it. It appears in search immediately.
8. **Past event history.** Open Event Analytics as a Club owner and the
   completed Inter College Debate is counted there alongside your live events.

---

## Where the data lives

| Collection | Contents |
| --- | --- |
| `users` | All accounts, passwords stored as bcrypt hashes |
| `registerclubs` | Club applications and their approval status |
| `events` | Events with capacity, pricing, location and status |
| `registrations` | Who registered for what, with payment state |

Posters and club logos use generated avatar URLs from `ui-avatars.com`, so
there are no image files to download and the demo works offline for everything
except viewing those two images.

A machine readable copy of all IDs is written to `docs/dummy-data.seed.json`
on every run, in case the IDs in this file ever drift.

---

## Resetting

To wipe the demo data and start over, delete the seeded collections from
MongoDB Atlas or Compass:

```js
db.events.deleteMany({ title: { $regex: "Bootcamp|Seminar|Robotics Championship|Photography Walk|Git and GitHub|Pitch Night|Build for Nepal|Inter College Debate" } })
db.registrations.deleteMany({})
```

Then run `npm run seed` again to get a clean set with fresh IDs.

---

## Security note

These passwords are intentionally simple so the demo is easy to run. They are
fine for a college project on a local machine or a private demo link. Do not
reuse them on a public server, and never commit `server/.env` to git.