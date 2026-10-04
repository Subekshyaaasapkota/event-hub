import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  Award,
  BookmarkCheck,
  Calendar,
  Clock,
  Loader2,
  MapPin,
} from "lucide-react";
import useEvents from "../../hooks/useEvents";
import useAuth from "../../hooks/useAuth";
import usePayment from "../../hooks/usePayment";

// Written out in full because Tailwind cannot see classes assembled at runtime.
const STATUS_THEMES = {
  Confirmed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Pending: "bg-amber-50 text-amber-900 border-amber-300",
  Cancelled: "bg-red-50 text-red-800 border-red-200",
  Failed: "bg-red-50 text-red-800 border-red-200",
};

const statusTheme = (status) =>
  STATUS_THEMES[status] || "bg-stone-100 text-stone-700 border-stone-300";

const formatEventDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    fetchEvents,
    fetchMyRegistrations,
    myRegistrations,
    fetchRecommendedEvents,
    recommendedEvents,
    loading: eventsLoading,
  } = useEvents();
  const { verifyKhalti } = usePayment();

  const normalizePoster = (poster) => {
    if (!poster) return null;
    if (poster.startsWith("http")) return poster;
    const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
    return `${BASE_URL}${poster}`;
  };

  const verifyPayment = useCallback(
    async (pidx) => {
      try {
        const paymentRes = await verifyKhalti(pidx);
        if (paymentRes.success) {
          toast.success("Payment verified.");
          fetchEvents();
          fetchMyRegistrations();
        }
      } catch (err) {
        console.error(err);
      } finally {
        navigate(location.pathname, { replace: true });
      }
    },
    [verifyKhalti, fetchEvents, fetchMyRegistrations, navigate, location.pathname],
  );

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
    fetchRecommendedEvents();

    const query = new URLSearchParams(location.search);
    const pidx = query.get("pidx");
    const status = query.get("status");

    if (pidx && status === "Completed") {
      verifyPayment(pidx);
    }
  }, [
    fetchEvents,
    fetchMyRegistrations,
    fetchRecommendedEvents,
    verifyPayment,
    location.search,
  ]);

  const { upcoming, past, nextEvent } = useMemo(() => {
    const all = myRegistrations || [];
    const now = new Date();

    const upcomingList = all
      .filter((reg) => new Date(reg.event?.eventDate) > now)
      .sort((a, b) => new Date(a.event?.eventDate) - new Date(b.event?.eventDate));

    const pastList = all
      .filter((reg) => new Date(reg.event?.eventDate) <= now)
      .sort((a, b) => new Date(b.event?.eventDate) - new Date(a.event?.eventDate));

    return {
      upcoming: upcomingList,
      past: pastList,
      nextEvent: upcomingList[0]?.event || null,
    };
  }, [myRegistrations]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    if (!nextEvent) return undefined;

    const calculate = () => {
      const distance = new Date(nextEvent.eventDate).getTime() - Date.now();
      if (distance < 0) return { days: 0, hours: 0, mins: 0 };
      return {
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        mins: Math.floor((distance % 3600000) / 60000),
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 60000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  const skills = user?.interestedSkills || [];

  // Labelled from what the data can actually support. The old page counted past
  // registrations and called them "Attended Events", which claims something the
  // registration list does not know.
  const stats = [
    { label: "Registrations", value: myRegistrations?.length || 0, icon: BookmarkCheck },
    { label: "Upcoming", value: upcoming.length, icon: Calendar },
    { label: "Past events", value: past.length, icon: Award },
  ];

  if (eventsLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[60vh] items-center justify-center text-stone-500"
      >
        <Loader2 size={24} className="animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading your dashboard</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-24">
      <div className="mx-auto w-full max-w-5xl px-5 pt-10 sm:px-8 lg:pt-14">
        <header className="border-b border-hairline pb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {user?.name ? `Hello, ${user.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="mt-2 text-[15px] text-stone-600">
            Your registrations and what is coming up.
          </p>
        </header>

        {/* Stats */}
        <section aria-label="Summary" className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-3xl border border-hairline bg-white p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paper text-ink">
                <stat.icon size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums leading-none text-ink">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Next event */}
        <section className="mt-6">
          {nextEvent ? (
            <div className="overflow-hidden rounded-3xl border border-hairline bg-white">
              <div className="border-b border-hairline px-6 py-5 sm:px-8">
                <p className="text-sm text-stone-500">Your next event</p>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
                  {nextEvent.title}
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={15} aria-hidden="true" className="text-stone-400" />
                    {formatEventDate(nextEvent.eventDate)}
                  </span>
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <MapPin size={15} aria-hidden="true" className="text-stone-400" />
                    <span className="truncate">
                      {nextEvent.venue || nextEvent.district}
                    </span>
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-6 sm:px-8">
                <div className="flex items-center gap-6">
                  {[
                    { value: timeLeft.days, unit: "days" },
                    { value: timeLeft.hours, unit: "hrs" },
                    { value: timeLeft.mins, unit: "min" },
                  ].map((part) => (
                    <div key={part.unit}>
                      <p className="font-display text-3xl font-semibold tabular-nums leading-none text-ink">
                        {String(part.value).padStart(2, "0")}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">
                        {part.unit}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/event/${nextEvent._id}`}
                  className="press inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 font-semibold text-paper transition-colors duration-200 hover:bg-stone-800"
                >
                  View event
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-hairline bg-white px-6 py-10 text-center">
              <Clock size={22} aria-hidden="true" className="mx-auto text-stone-400" />
              <p className="mt-3 font-display text-lg font-semibold text-ink">
                No upcoming events
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[15px] text-stone-600">
                {myRegistrations?.length
                  ? "Everything you have registered for has already happened."
                  : "Once you register for something, it will show up here."}
              </p>
              <Link
                to="/events"
                className="press mt-6 inline-flex items-center gap-2 rounded-2xl border border-hairline bg-white px-6 py-3 font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
              >
                Browse events
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        {/* Upcoming */}
        {upcoming.length > 0 ? (
          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Coming up
              </h2>
              <Link
                to="/registered-events"
                className="text-sm font-medium text-stone-600 underline underline-offset-4 transition-colors hover:text-ink"
              >
                All registrations
              </Link>
            </div>

            <ul className="mt-4 space-y-3">
              {upcoming.slice(0, 3).map((reg) => (
                <li key={reg._id}>
                  <Link
                    to={`/event/${reg.event?._id}`}
                    className="flex items-center gap-4 rounded-2xl border border-hairline bg-white p-4 transition-colors duration-200 hover:bg-stone-50"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                      {reg.event?.poster ? (
                        <img
                          src={normalizePoster(reg.event.poster)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{reg.event?.title}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {formatEventDate(reg.event?.eventDate)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusTheme(reg.status)}`}
                    >
                      {reg.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Recommended */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Recommended for you
            </h2>
            {skills.length > 0 ? (
              <p className="hidden text-sm text-stone-500 sm:block">
                Based on {skills.slice(0, 2).join(" and ")}
                {skills.length > 2 ? " and more" : ""}
              </p>
            ) : null}
          </div>

          {recommendedEvents?.length > 0 ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedEvents.slice(0, 3).map((event) => (
                <li
                  key={event._id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-hairline bg-white"
                >
                  <div className="aspect-video bg-paper">
                    {event.poster ? (
                      <img
                        src={normalizePoster(event.poster)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {event.category ? (
                      <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        {event.category}
                      </span>
                    ) : null}
                    <h3 className="mt-1.5 line-clamp-2 font-medium leading-snug text-ink">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm text-stone-500">
                      {formatEventDate(event.eventDate)}
                    </p>
                    <Link
                      to={`/event/${event._id}`}
                      className="press mt-4 inline-flex items-center gap-1.5 self-start rounded-xl border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
                    >
                      View event
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-3xl border border-hairline bg-white px-6 py-8 text-center text-[15px] text-stone-500">
              {skills.length > 0
                ? "Nothing matches your interests right now."
                : "Add a few interests to your profile and suggestions will show up here."}
            </p>
          )}
        </section>

        {/* History */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Past events
          </h2>

          {past.length > 0 ? (
            <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-3xl border border-hairline bg-white">
              {past.map((reg) => (
                <li key={reg._id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{reg.event?.title}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {formatEventDate(reg.event?.eventDate)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusTheme(reg.status)}`}
                  >
                    {reg.status}
                  </span>
                  <Link
                    to={`/event/${reg.event?._id}`}
                    className="press shrink-0 rounded-xl border border-hairline px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-3xl border border-hairline bg-white px-6 py-8 text-center text-[15px] text-stone-500">
              Nothing here yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
