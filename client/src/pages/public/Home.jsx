import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, Calendar, MapPin, Globe, Users } from "lucide-react";

import Footer from "../../components/common/Footer";
import EventCard from "../../components/common/EventCard";
import useEvents from "../../hooks/useEvents";

/*
 * Homepage.
 *
 * The previous version of this page was the main source of the "AI slop" look.
 * Everything below was removed deliberately:
 *
 *   - An eyebrow badge above the headline ("Nepal's #1 IT Event Platform").
 *     The kicker is a house-style tic, and the claim was unverifiable.
 *   - A four-tile stat band reading 120+ events, 3,500+ students, 45+
 *     organizers, 12+ departments. The database holds 9 events and 16 users.
 *     The numbers were decorative and false.
 *   - Four floating cards with invented events ("Only 5 seats left!"). Fake
 *     urgency attached to data that does not exist.
 *   - Two radial glows, a dot-grid overlay, a spinning dashed ring, three
 *     bobbing dots, plus slideUp, float, bob, spin and pulse keyframes. Five
 *     infinite animations with no opt-out.
 *   - A hand-drawn SVG monitor standing in for an illustration.
 *
 * What replaces it is real content: the event feed the page already fetches.
 */

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";

/** Keeps the "next up" rail to events that have not already finished. */
const upcomingEvents = (events) => {
  if (!Array.isArray(events)) return [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return events
    .filter((event) => event?.eventDate && new Date(event.eventDate).getTime() > cutoff)
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
};

/**
 * Hero side panel: the next three real events.
 *
 * This occupies the space the decorative illustration used to sit in, and it
 * shows actual records, so the panel is useful on its own instead of merely
 * filling a column.
 */
const NextUp = ({ events }) => {
  const next = upcomingEvents(events).slice(0, 3);

  if (!next.length) {
    return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-8 text-center">
      <Calendar size={20} className="mx-auto mb-3 text-stone-400" />
      <p className="text-sm text-stone-500">
        No upcoming events are listed right now.
      </p>
    </div>
    );
  }

  return (
  <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-[0_18px_40px_-24px_rgba(17,17,20,0.3)]">
    <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
      <h2 className="font-display text-sm font-semibold text-ink">Next up</h2>
      <span className="text-xs text-stone-500">
        {upcomingEvents(events).length} upcoming
      </span>
    </div>

    <ul className="divide-y divide-hairline">
      {next.map((event) => {
        const capacity = event.participantCount ?? event.capacity ?? null;
        const registered = event.currentParticipants ?? 0;
        const seatsLeft =
        Number.isFinite(capacity) && capacity > 0
          ? Math.max(capacity - registered, 0)
          : null;

        return (
        <li key={event._id || event.id}>
          <Link
            to={`/event/${event._id || event.id}`}
            className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-200 hover:bg-stone-50"
          >
            <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-ink py-1.5 text-white">
              <span className="font-display text-base font-semibold leading-none tabular-nums">
                {new Date(event.eventDate).getDate()}
              </span>
              <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-stone-400">
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  month: "short",
                })}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink transition-colors group-hover:text-ink-soft">
                {event.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-stone-500">
                {event.eventType === "online" ? (
                <Globe size={11} className="shrink-0" />
                ) : (
                <MapPin size={11} className="shrink-0" />
                )}
                {event.eventType === "online"
                ? "Online"
                : event.district || "Venue TBA"}
                <span className="text-stone-300">/</span>
                {formatTime(event.eventDate)}
              </p>
            </div>

            {seatsLeft !== null && (
            <span className="hidden shrink-0 items-center gap-1 text-[0.6875rem] font-medium text-stone-500 sm:flex">
              <Users size={11} className="text-stone-400" />
              {seatsLeft}
            </span>
            )}
          </Link>
        </li>
        );
      })}
    </ul>

    <Link
      to="/events"
      className="group flex items-center justify-center gap-1.5 border-t border-hairline px-5 py-3.5 text-[0.8125rem] font-semibold text-ink transition-colors duration-200 hover:bg-stone-50 hover:text-ink-soft"
    >
      See the full calendar
      <ArrowRight
        size={14}
        className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
      />
    </Link>
  </div>
  );
};

const SectionSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[0, 1, 2].map((i) => (
    <div
      key={i}
    className="h-[22rem] animate-pulse rounded-2xl border border-hairline bg-stone-100"
    />
    ))}
  </div>
);

const Home = () => {
  const { events, fetchEvents, loading, error } = useEvents();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const feed = useMemo(
    () => (Array.isArray(events) ? events : []),
    [events],
  );

  const hasEvents = feed.length > 0;

  return (
  <div className="flex min-h-screen flex-col bg-paper">
    {/* Hero */}
    <section className="border-b border-hairline">
    <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          {/* No eyebrow badge here on purpose. The headline carries the page. */}
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-[3.4rem]">
            Every student event in Nepal,
            <span className="text-stone-400"> in one calendar.</span>
          </h1>

          <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-stone-600">
            Workshops, hackathons, bootcamps and club meetups with the date,
            venue, registration deadline and remaining seats shown up front, so
            you can decide before you sign up.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/events"
              className="group inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white
                transition-colors duration-200 ease-out hover:bg-ink-soft active:bg-black"
            >
              Browse events
              <ArrowRight
                size={16}
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              />
            </Link>

            {!user && (
            <Link
              to="/signup"
              className="inline-flex items-center rounded-xl border border-stone-300 bg-transparent px-6 py-3.5
                text-sm font-semibold text-ink transition-colors duration-200 ease-out hover:border-ink hover:bg-white"
            >
              Create an account
            </Link>
            )}
          </div>

          {hasEvents && (
          <p className="mt-7 text-[0.8125rem] text-stone-500">
            {upcomingEvents(feed).length} upcoming event
            {upcomingEvents(feed).length === 1 ? "" : "s"} listed right now.
          </p>
          )}
        </div>

        <NextUp events={feed} />
      </div>
    </div>
    </section>

    {/* Featured events */}
    <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 md:py-20">
    <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
      <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        Open for registration
      </h2>
      <p className="mt-2 max-w-md text-sm text-stone-600">
        Sorted by the app, refreshed from the club that published it.
      </p>
      </div>

      <Link
        to="/events"
        className="group inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-ink transition-colors duration-200 hover:text-ink-soft"
      >
        View all
        <ArrowRight
          size={15}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      </Link>
    </div>

    {loading ? (
      <SectionSkeleton />
    ) : error ? (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
      <p className="mb-4 text-sm font-medium text-red-700">{error}</p>
      <button
        onClick={() => fetchEvents()}
        className="cursor-pointer rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-800"
      >
        Try again
      </button>
      </div>
    ) : hasEvents ? (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {feed.slice(0, 6).map((event, index) => (
          <div
            key={event._id || event.id || index}
            // Staggered by index rather than a fixed delay per element, and
            // neutralised for reduced-motion users by the global media query.
            className="rise"
            style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
          >
          <EventCard {...event} />
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center">
      <Calendar size={28} className="mx-auto mb-4 text-stone-400" />
      <h3 className="font-display text-lg font-semibold text-ink">
        Nothing published yet
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500">
        Clubs publish their events here. Once a club is verified its listings
        appear here automatically.
      </p>
      <Link
        to="/events"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-soft"
      >
        Browse all events
        <ArrowRight size={15} />
      </Link>
      </div>
    )}
    </section>

    {/* Closing call to action */}
    {!user && (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 md:pb-20">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink px-8 py-10 md:flex-row md:items-center md:px-10">
      <div>
        <h3 className="font-display text-xl font-semibold text-white md:text-2xl">
          Hosting something?
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-400">
          Register a club, get it verified, and publish your events to every
          student browsing EventHub.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-3">
        <Link
          to="/signup"
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-stone-200"
        >
          Register a club
        </Link>
        <Link
          to="/about"
          className="rounded-xl border border-stone-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-stone-400 hover:bg-white/5"
        >
          How it works
        </Link>
      </div>
      </div>
    </section>
    )}

    <Footer />
  </div>
  );
};

export default Home;
