import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  LayoutGrid,
  List,
  Ticket,
  AlertTriangle,
} from "lucide-react";
import useEvents from "../../hooks/useEvents";
import EventCard from "../../components/common/EventCard";
import { getEventPoster, onPosterError } from "../../utils/imageUrl";

/**
 * Every event this student has registered for.
 *
 * This page was written in a register nobody uses. "Enrollment Registry",
 * "My Enrollments", "Access your participation history, active session nodes
 * and subscription metadata", "Protocol Error Detected", "Enrollment Cache
 * Empty", "Initiate Node Search". None of those describe anything a student
 * does. The empty state told people to search their own registration history
 * with a box that had no state and no handler, so it did nothing at all.
 *
 * There was also a grid and list toggle with no labels and 34px hit areas, a
 * pulse animation on every non-Confirmed registration, a direction prop
 * handed to EventCard that stopped being read when the card was rebuilt, and
 * a header styled with an animation class from a package this project does not
 * have installed.
 *
 * What replaced it: real search, a real filter, the actual registration status
 * in words, and two distinct empty states because "you have never registered
 * for anything" and "none of your registrations match this" are different
 * problems for the person reading them.
 */

const STATUS_STYLE = {
  Confirmed: "bg-green-50 text-green-800 border-green-200",
  Pending: "bg-amber-50 text-amber-900 border-amber-200",
  Cancelled: "bg-stone-100 text-stone-700 border-stone-300",
  Failed: "bg-red-50 text-red-800 border-red-200",
};

const chipClass = (status) =>
  `inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[13px] font-medium ${
    STATUS_STYLE[status] ?? "bg-stone-100 text-stone-700 border-stone-300"
  }`;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const RegisteredEvents = () => {
  const { fetchMyRegistrations, myRegistrations, loading, error } = useEvents();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");

  useEffect(() => {
    fetchMyRegistrations();
  }, [fetchMyRegistrations]);

  // A registration whose event has since been deleted has no card to show.
  const registrations = useMemo(
    () => (myRegistrations ?? []).filter((reg) => reg?.event?._id),
    [myRegistrations]
  );

  const counts = useMemo(() => {
    const now = new Date();
    let upcoming = 0;

    for (const reg of registrations) {
      if (new Date(reg.event.eventDate) >= now) upcoming += 1;
    }

    return { total: registrations.length, upcoming, past: registrations.length - upcoming };
  }, [registrations]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const now = new Date();

    return registrations.filter((reg) => {
      const event = reg.event;
      const when = new Date(event.eventDate);

      if (filter === "upcoming" && when < now) return false;
      if (filter === "past" && when >= now) return false;

      if (!needle) return true;

      return [event.title, event.category, event.district, event.venue]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [registrations, query, filter]);

  const filtering = query.trim() !== "" || filter !== "all";

  return (
    <>
      <header className="border-b border-hairline pb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          My registrations
        </h1>
        <p className="mt-2 text-[15px] text-stone-600">
          {counts.total === 0
            ? "Events you have signed up for will be listed here."
            : `${counts.total} event${counts.total === 1 ? "" : "s"}, ${counts.upcoming} still to come.`}
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-700" aria-hidden="true" />
          <div>
            <p className="font-medium text-red-900">We could not load your registrations.</p>
            <p className="mt-1 text-[15px] text-red-800">{String(error)}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2" role="group" aria-label="Filter registrations">
          {FILTERS.map((option) => {
            const active = filter === option.key;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.key)}
                className={`press min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-hairline bg-white text-stone-600 hover:bg-stone-100 hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <label htmlFor="registration-search" className="sr-only">
              Search your registrations
            </label>
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              id="registration-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or place"
              className="min-h-[44px] w-full rounded-xl border border-hairline bg-white pl-10 pr-10 text-[15px] text-ink placeholder:text-stone-400 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="press absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-ink"
              >
                <X size={18} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="flex gap-1 rounded-xl border border-hairline bg-white p-1">
            {[
              { key: "grid", label: "Grid view", Icon: LayoutGrid },
              { key: "list", label: "List view", Icon: List },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                aria-pressed={view === key}
                aria-label={label}
                title={label}
                onClick={() => setView(key)}
                className={`press flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-200 ${
                  view === key
                    ? "bg-ink text-paper"
                    : "text-stone-500 hover:bg-stone-100 hover:text-ink"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((n) => (
            <div key={n} className="h-72 animate-pulse rounded-3xl border border-hairline bg-white" />
          ))}
        </div>
      ) : counts.total === 0 ? (
        <div className="mt-8 rounded-3xl border border-hairline bg-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
            <Ticket size={28} className="text-stone-500" aria-hidden="true" />
          </div>
          <h2 className="mt-6 font-display text-xl font-semibold text-ink">
            Nothing registered yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-stone-600">
            Once you sign up for an event it will appear here, along with its confirmation status.
          </p>
          <Link
            to="/events"
            className="press mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-ink px-5 text-sm font-medium text-paper transition-opacity duration-200 hover:opacity-90 active:opacity-80"
          >
            Find an event
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-hairline bg-white p-10 text-center">
          <h2 className="font-display text-xl font-semibold text-ink">No matches</h2>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-stone-600">
            {filter === "upcoming"
              ? "You have no upcoming registrations."
              : filter === "past"
              ? "You have no past registrations."
              : `Nothing matches "${query.trim()}".`}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="press mt-6 inline-flex min-h-[44px] items-center rounded-xl border border-hairline px-5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-100"
          >
            Clear filters
          </button>
        </div>
      ) : view === "grid" ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((reg) => (
            <li key={reg._id} className="relative">
              <span className={`absolute left-4 top-4 z-10 ${chipClass(reg.status)}`}>
                {reg.status}
              </span>
              <EventCard {...reg.event} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-8 space-y-4">
          {visible.map((reg) => {
            const event = reg.event;
            return (
              <li key={reg._id}>
                <Link
                  to={`/event/${event._id}`}
                  className="press flex items-center gap-5 rounded-2xl border border-hairline bg-white p-4 transition-colors duration-200 hover:border-stone-300 hover:bg-stone-50"
                >
                  <img
                    src={getEventPoster(event)}
                    onError={(img) => onPosterError(event, img)}
                    alt=""
                    className="h-20 w-28 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{event.title}</p>
                    <p className="mt-1 truncate text-[13px] text-stone-600">
                      {[event.category, event.district, formatDate(event.eventDate)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className={chipClass(reg.status)}>{reg.status}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && counts.total > 0 ? (
        <p aria-live="polite" className="mt-6 text-[13px] text-stone-500">
          {filtering
            ? `Showing ${visible.length} of ${counts.total}.`
            : `${counts.total} shown.`}
        </p>
      ) : null}
    </>
  );
};

export default RegisteredEvents;
