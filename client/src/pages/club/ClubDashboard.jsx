import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import ClubSidebar from "./ClubSidebar";
import useOrganizer from "../../hooks/useOrganizer";

// Written out in full because Tailwind cannot see classes assembled at runtime.
const EVENT_STATE_THEMES = {
  Open: "bg-emerald-50 text-emerald-800 border-emerald-200",
  "Registration closed": "bg-amber-50 text-amber-900 border-amber-300",
  Past: "bg-stone-100 text-stone-700 border-stone-300",
};

const formatEventDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// The old page stamped every event with an "Active" badge regardless of whether
// it had already happened. This derives the label from the dates instead.
// `now` is passed in rather than read here, so nothing impure runs during render.
const eventState = (event, now) => {
  if (new Date(event.eventDate).getTime() < now) return "Past";
  if (event.deadline && new Date(event.deadline).getTime() < now) {
    return "Registration closed";
  }
  return "Open";
};

const ClubDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { orgEvents, loading: eventsLoading } = useOrganizer();

  // Fixed for the life of the page. Reading the clock during render would let
  // the numbers change underneath the user between two renders of the same view,
  // and the compiler lint rules reject it outright.
  const [now] = useState(() => Date.now());

  const normalizePoster = (poster) => {
    if (!poster) return null;
    if (poster.startsWith("http")) return poster;
    const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
    return `${BASE_URL}${poster}`;
  };

  const summary = useMemo(() => {
    const events = orgEvents || [];

    let registrations = 0;
    let capacity = 0;
    events.forEach((event) => {
      registrations += event.currentParticipants || 0;
      // Only count a capacity the club actually set. The old code substituted
      // 50 for a missing value, which invented a number and then divided by it.
      capacity += event.participantCount || 0;
    });

    return {
      events: events.length,
      upcoming: events.filter((e) => new Date(e.eventDate).getTime() > now).length,
      registrations,
      capacity,
      fillRate: capacity > 0 ? Math.round((registrations / capacity) * 100) : null,
    };
  }, [orgEvents, now]);

  // authLoading alone is not enough. Once loading finishes the user can still be
  // null, because the token was rejected or the profile request failed, and
  // `user.club` below then throws and the page white-screens.
  if (authLoading || !user) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center text-stone-500"
      >
        <Loader2 size={24} className="animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading your club dashboard</span>
      </div>
    );
  }

  if (!user.club) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-hairline bg-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-paper text-ink">
            <Building2 size={28} aria-hidden="true" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">
            Register your club
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
            Once your club is approved you can create events, manage
            registrations and see how each one fills up.
          </p>
          <Link
            to="/club/register"
            className="press mt-8 inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-semibold text-paper transition-colors duration-200 hover:bg-stone-800"
          >
            Register a club
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  if (!user.club.isVerified && user.club.status === "Pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-hairline bg-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
          <p className="mt-6 inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
            Under review
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
            We are checking your application
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
            You will be able to create events as soon as the review is done. We
            will email {user.email} either way.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Events", value: summary.events, icon: Calendar },
    { label: "Upcoming", value: summary.upcoming, icon: CheckCircle2 },
    { label: "Registrations", value: summary.registrations, icon: Users },
    {
      label: "Fill rate",
      value: summary.fillRate === null ? "—" : `${summary.fillRate}%`,
      icon: Layers,
    },
  ];

  return (
    <div className="min-h-screen flex bg-paper">
      <ClubSidebar />

      <div className="lg:pl-0">
        <div className="mx-auto w-full max-w-5xl px-5 pb-24 pt-8 sm:px-8 lg:pt-12">
          {/* Club identity */}
          <header className="flex flex-col gap-6 border-b border-hairline pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {user.club?.logo ? (
                <img
                  src={normalizePoster(user.club.logo)}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink text-paper">
                  <Building2 size={24} aria-hidden="true" />
                </div>
              )}

              <div className="min-w-0">
                <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {user.club?.name || "Your club"}
                </h1>
                <p className="mt-1 text-sm text-stone-500">
                  Managed by {user.name}
                  {summary.upcoming > 0 ? ` · ${summary.upcoming} upcoming` : ""}
                </p>
              </div>
            </div>

            <Link
              to="/club/create-event"
              className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-semibold text-paper transition-colors duration-200 hover:bg-stone-800"
            >
              <Plus size={17} aria-hidden="true" />
              Create event
            </Link>
          </header>

          {/* Stats */}
          <section aria-label="Summary" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-hairline bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-paper text-ink">
                    <stat.icon size={19} aria-hidden="true" />
                  </div>
                  <p className="text-sm text-stone-500">{stat.label}</p>
                </div>
                <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none text-ink">
                  {stat.value}
                </p>
              </div>
            ))}
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* Recent events */}
            <section className="lg:col-span-2">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                  Your events
                </h2>
                <Link
                  to="/club/my-events"
                  className="press shrink-0 rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-ink"
                >
                  See all
                </Link>
              </div>

              {eventsLoading && !orgEvents?.length ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-4 flex items-center gap-3 rounded-3xl border border-hairline bg-white px-6 py-8 text-stone-500"
                >
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Loading your events
                </div>
              ) : orgEvents?.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {orgEvents.slice(0, 4).map((event) => {
                    const state = eventState(event, now);
                    const capacity = event.participantCount || 0;
                    const taken = event.currentParticipants || 0;
                    const percent = capacity > 0 ? Math.min(100, Math.round((taken / capacity) * 100)) : null;

                    return (
                      <li key={event._id}>
                        <Link
                          to={`/club/my-events/${event._id}`}
                          className="flex gap-4 rounded-2xl border border-hairline bg-white p-4 transition-colors duration-200 hover:bg-stone-50"
                        >
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper">
                            {event.poster ? (
                              <img
                                src={normalizePoster(event.poster)}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-stone-300">
                                <Layers size={22} aria-hidden="true" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${EVENT_STATE_THEMES[state]}`}
                              >
                                {state}
                              </span>
                              <span className="text-xs text-stone-500">
                                {formatEventDate(event.eventDate)}
                              </span>
                            </div>

                            <p className="mt-1.5 line-clamp-2 font-medium leading-snug text-ink">
                              {event.title}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                              <MapPin size={13} aria-hidden="true" className="shrink-0" />
                              <span className="truncate">{event.venue || event.district}</span>
                            </p>

                            {percent === null ? (
                              <p className="mt-2 text-xs text-stone-500">
                                {taken} registered · no seat limit set
                              </p>
                            ) : (
                              <div className="mt-2.5">
                                <div
                                  className="h-1.5 overflow-hidden rounded-full bg-stone-200"
                                  role="progressbar"
                                  aria-valuenow={percent}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-label={`${taken} of ${capacity} seats taken`}
                                >
                                  <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
                                </div>
                                <p className="mt-1 text-xs tabular-nums text-stone-500">
                                  {taken} of {capacity} seats taken
                                </p>
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-4 rounded-3xl border border-hairline bg-white px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-stone-400">
                    <Layers size={22} aria-hidden="true" />
                  </div>
                  <p className="mt-4 font-display text-lg font-semibold text-ink">
                    No events yet
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-[15px] text-stone-600">
                    Create your first event and registrations will show up here.
                  </p>
                  <Link
                    to="/club/create-event"
                    className="press mt-6 inline-flex items-center gap-2 rounded-2xl border border-hairline px-5 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Create event
                  </Link>
                </div>
              )}
            </section>

            {/* Side column */}
            <div className="space-y-6">
              <section className="rounded-3xl border border-hairline bg-white p-6">
                <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                  Capacity
                </h2>
                <dl className="mt-4 divide-y divide-hairline">
                  <div className="flex items-baseline justify-between py-3">
                    <dt className="text-sm text-stone-500">Registrations</dt>
                    <dd className="font-display text-lg font-semibold tabular-nums text-ink">
                      {summary.registrations}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between py-3">
                    <dt className="text-sm text-stone-500">Seats offered</dt>
                    <dd className="font-display text-lg font-semibold tabular-nums text-ink">
                      {summary.capacity > 0 ? summary.capacity : "—"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between py-3">
                    <dt className="text-sm text-stone-500">Fill rate</dt>
                    <dd className="font-display text-lg font-semibold tabular-nums text-ink">
                      {summary.fillRate === null ? "—" : `${summary.fillRate}%`}
                    </dd>
                  </div>
                </dl>
                {summary.capacity === 0 && summary.events > 0 ? (
                  <p className="mt-3 text-sm text-stone-500">
                    Set a seat limit on your events to see a fill rate.
                  </p>
                ) : null}
              </section>

              <section className="rounded-3xl border border-hairline bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-paper text-ink">
                    <AlertCircle size={19} aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                    Something wrong?
                  </h2>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
                  If an event is not showing up, or a registrant cannot get
                  through, tell us and we will look at it.
                </p>
                <Link
                  to="/contact"
                  className="press mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-hairline px-5 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
                >
                  Contact support
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDashboard;
