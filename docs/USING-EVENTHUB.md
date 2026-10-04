# Using EventHub

This guide is for people running events on EventHub. It assumes you can use a
website and nothing else. No code, no command line, no configuration files.

If you are trying to install EventHub on a machine, read the
[README](../README.md) instead.

## What EventHub is

EventHub is a notice board for technical events in Nepal. Clubs post events,
students find them and sign up, and nobody has to hunt through a dozen Facebook
posts to work out what is happening this weekend.

Three kinds of account use it:

| Account | What they do |
| --- | --- |
| Student | Finds events and registers for them |
| Club | Posts events and manages who is coming |
| Admin | Checks clubs are real, and keeps the site tidy |

You start as a Student. Only an Admin can change that.

## Signing up

1. Open the site and choose **Sign up**.
2. Fill in your name, email and password.
3. That is it. You are a Student and you can start browsing events.

Your email address is your identity on the site. It is also your sign in name,
and it is the only way we can reach you about an event, so use one you actually
check.

Your password cannot be changed from the site at the moment. If you forget it,
ask an Admin to reset it.

## Finding events as a student

The **Events** page is the whole catalogue. It has a search box, a set of
category buttons and a button that looks for events near you.

The search box matches against the event name, the district and the venue, so
searching for "Kathmandu" or "bootcamp" both work.

**Near me** asks your browser for your location and shows events within about
20 km. Your browser will ask you first. If you say no, nothing breaks, you just
do not get the nearby list.

When you open an event you can see what it is, when it runs, where it is, and
how many seats are left.

## Registering for an event

On the event page:

**Free events.** Choose **Register**. You are added straight away and it shows
up on your dashboard.

**Paid events.** You go through a payment page first. EventHub supports eSewa
and Khalti. Once the payment is confirmed your seat is held and a receipt
appears on the confirmation screen. If you close the browser halfway through,
come back to the event and pay again, the earlier attempt did not count.

**Events using a Google Form.** Some organisers handle sign up themselves. If
the event says so, the button takes you to their form instead and EventHub
never records your registration. That is the organiser's choice, not a fault.

## Your dashboard

Your dashboard is at `/dashboard`. It shows:

- How many events you have registered for, how many are still to come, and how
  many are in the past.
- A countdown to your next event.
- Everything you have coming up, with the confirmation status of each.
- Events picked for you based on the interests on your profile.
- Your past events.

**All registrations** takes you to the full list with a grid and list view, if
you want more than the few shown on the dashboard.

## Editing your profile

Your profile is at `/profile`. You can change your name, college, district,
address, a short bio and a list of skills.

Two things worth knowing:

- **Your email address cannot be changed here.** It is how you sign in.
- **Your address is used by organisers** when they need to know where you are,
  for example for a physical event or a delivery. Fill it in if that applies.

Add skills if you want. They are what the recommendations on your dashboard are
based on, so an empty list means an empty recommendations section.

## Running an event as a club

### Before anything else, register the club

Only a verified club can create events. To apply:

1. Choose **Register Club** in the account menu at the top right.
2. Fill in the form. You need a club name, a contact email, a contact number,
   the district you are in, a category, a website and a logo. Everything else is
   optional but helps.
3. Submit it.

An Admin then checks the application. Until they approve it, the club console
will tell you the application is under review. You cannot create events while
you wait.

There is no automatic approval, so if nobody has come back to you after a few
days, get in touch through the contact page.

### Creating an event

From the club console, choose **Create event**. The form looks long but only
seven things are required.

**Event Name.** What people will see in the list. Keep it short and specific.

**About the Event.** A few sentences on what the event is and who it is for.
This is the text people read before deciding to come, so it is worth more than
the name.

**Event Type.** Choose **Physical** for an event with a place, or **Online** for
a virtual one. This choice changes what the form asks for:

- Physical events also need a venue name and a pin on the map. The form tells
  you which fields are required, so watch the markers.
- Online events do not need a venue or a map pin. They do still need a district.
  There is no separate field for a meeting link, so put it in the description
  where people will actually see it.

**Registration Method.** Two choices:

- **System Registration.** People register through EventHub and you get a list of
  who is coming. This is the normal choice and it is what lets you see
  registrations and use analytics.
- **Google Form.** You paste in your own form link and EventHub sends people
  there. You will not get a registration list from us. Only use this if you
  need to ask questions our form cannot.

**District, Venue Name and Location on Map.** Click the map to drop a pin. The
district dropdown fills in from the map, so pick the pin first if you can.

**Event Date and Time.** When it actually happens.

**Registration Deadline.** When people must have signed up by. This is
separate from the event date and it matters: after the deadline, registration
closes and nobody new can join.

**Max Participants.** How many seats there are. Once it is full the event is
marked full on the public page and the dashboard shows your fill rate. If you
never set it, we cannot tell you a fill rate, so set it even for a free event.

**Ticket Price (NPR).** Leave it at zero for a free event. Anything above zero
makes it a paid event and turns on eSewa and Khalti checkout.

**Event Poster.** A picture for the event card. Landscape works best because
the card crops to a wide shape. Use a real image with the event title on it
rather than a screenshot of a poster, it reads much better in the list.

**Category and Tags.** Category is one of the fixed list and it is how people
filter. Tags are free text and they are what the recommendation engine looks
at, so add the ones a student would actually search for.

### After you publish

The event is live immediately. It appears in the Events list and anyone can
register.

Things you can do from the club console afterwards:

- **Your events** lists everything you have posted, with its registration count
  and fill rate.
- Opening one lets you change the details. Note that if you change the
  registration deadline, people who already registered are not affected.
- **Registrations** shows who has signed up, and lets you search the list.
- **Analytics** shows how your events filled up over time.

### When something is wrong

If an event is not showing up, the usual cause is that it is filtered out by a
search or category you have left active on the Events page. Clear the search box
and set the category back to All.

If a registrant paid and has no seat, check whether their payment actually
completed. An abandoned checkout looks the same as a slow one.

## What an Admin does

Admins have their own console with these jobs:

- **Verification.** Approve or reject club applications. Until you approve one,
  that club cannot post events.
- **Events.** See every event on the site and take down anything that should not
  be there.
- **Users.** See all accounts.
- **Clubs.** See all registered clubs.
- **Registrations.** See registrations across all events.

If you are an Admin and someone cannot do something they should be able to, it
is almost always the account role rather than a fault.

## Problems you are likely to hit

**An event is not on the Events page.** Check that it actually saved. Events are
published the moment you save, so there is no draft state to be stuck in. The
list is not filtered by date, so a past event is still there, it just sorts by
date among the rest. Search for it by name or district if it is buried, and
check no category or search term is still filtering the list.

**A club says it cannot create events.** The club application has not been
approved yet. Only an Admin can approve it, and an unverified club cannot post
anything at all.

**Registration fails with a payment error.** Payments need keys configured on
the server. If you are running this yourself, see the README environment
section. On a working install this should not happen.

**Near me never returns anything.** Either you declined the location prompt, or
you are outside the 20 km radius of every event. The radius is deliberately
small because these are mostly in-person events in Kathmandu.

**Something looks broken but the button does nothing.** Note what you clicked
and what you expected, and include the browser console output. That is usually
faster to diagnose than a description.

## Getting in touch

Use the **Contact** page. It reaches the people who run this instance of
EventHub.

For a bug in the software rather than a question about events, include the
steps that reproduce it, what you expected instead, and the browser console
output. That is usually faster to diagnose than a description.
