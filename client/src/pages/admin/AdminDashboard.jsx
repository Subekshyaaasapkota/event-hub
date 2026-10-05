// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo } from "react";
import {
  Users,
  Calendar,
  CheckSquare,
  Building2,
  AlertCircle,
  ChevronRight,
  FileText,
  Inbox,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import useAdmin from "../../hooks/useAdmin";

/**
 * The admin overview, in Operate mode: the first question is "what needs me",
 * not "what does this look like". The order is attention, then scale, then
 * recency, then navigation.
 *
 * What changed and why:
 *
 * The stat cards used to count up from zero over a second before showing the
 * real figure. On a console whose numbers are the product, a figure that is
 * briefly a lie is worse than one that simply appears. They also each carried
 * a TrendingUp arrow and a caption, none of which had a measurement behind
 * it. The captions are now things the data can actually support, like how many
 * clubs are approved, and the arrow is gone.
 *
 * "Active" was being printed for any event with no status field. The Events
 * model has never had that value, so the badge labelled every unknown state as
 * a healthy one. Statuses now come from the model's own enum and anything
 * unrecognised falls through to neutral rather than being renamed.
 *
 * The event rows were buttons driving navigate(). They are links now, so they
 * take middle-click, open in a new tab, and carry an href for a screen reader
 * and for the browser status bar. Same for the shortcuts grid.
 *
 * The greeting is gone. The shell header already names the page, and a
 * time-of-day pleasantry next to it competes with the one thing an admin
 * opened this page to find.
 */
const AdminDashboard = () => {
  const { adminData, fetchEvents, fetchUsers, fetchClubs } = useAdmin();

  useEffect(() => {
    // "all", because this page reports the total number of events and shows the
    // latest few. The service defaults to the pending review queue, which would
    // make "Total events" quietly count only unreviewed events.
    fetchEvents({ verificationStatus: "all" });
    fetchUsers();
    fetchClubs();
  }, [fetchEvents, fetchUsers, fetchClubs]);

  const events = useMemo(() => adminData.events || [], [adminData.events]);
  const clubs = useMemo(() => adminData.clubs || [], [adminData.clubs]);

  const totalEvents = events.length;
  const totalUsers = adminData.users?.length ?? 0;
  const totalClubs = clubs.length;
  const pendingClubs = clubs.filter((c) => c.status === "Pending").length;
  const approvedClubs = clubs.filter((c) => c.status === "Approved").length;

  const latestEvents = useMemo(
    () =>
      events
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [events],
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const shortcuts = [
    {
      label: "Verify clubs",
      link: "/admin/club/verification",
      icon: CheckSquare,
      desc: pendingClubs > 0 ? `${pendingClubs} awaiting` : "None waiting",
      attention: pendingClubs > 0,
    },
    {
      label: "All clubs",
      link: "/admin/clubs",
      icon: Building2,
      desc: `${totalClubs} registered`,
    },
    {
      label: "All users",
      link: "/admin/users",
      icon: Users,
      desc: `${totalUsers} members`,
    },
    {
      label: "All events",
      link: "/admin/events",
      icon: Calendar,
      desc: `${totalEvents} created`,
    },
    {
      label: "Registrations",
      link: "/admin/registrations",
      icon: FileText,
      desc: "Every signup",
    },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm text-stone-600">{today}</p>

      {pendingClubs > 0 && (
        <Link
          to="/admin/club/verification"
          className="group flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 transition-colors duration-200 hover:border-amber-300 hover:bg-amber-100 active:translate-y-px"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-100 text-amber-700">
            <AlertCircle size={16} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-amber-900">
              {pendingClubs} club{pendingClubs !== 1 ? "s" : ""} awaiting
              verification
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-amber-800">
              Review applications
              <ChevronRight
                size={12}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </span>
        </Link>
      )}

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">
          Platform overview
        </h2>

        {adminData.loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[7.5rem] animate-pulse rounded-2xl border border-hairline bg-stone-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Building2}
              label="Total clubs"
              value={totalClubs}
              detail={`${approvedClubs} approved`}
              to="/admin/clubs"
              delay="0ms"
            />
            <StatCard
              icon={Users}
              label="Total users"
              value={totalUsers}
              detail="All accounts"
              to="/admin/users"
              delay="60ms"
            />
            <StatCard
              icon={Calendar}
              label="Total events"
              value={totalEvents}
              detail="All time"
              to="/admin/events"
              delay="120ms"
            />
            <StatCard
              icon={CheckSquare}
              label="Pending"
              value={pendingClubs}
              detail={pendingClubs > 0 ? "Needs review" : "Nothing waiting"}
              to="/admin/club/verification"
              delay="180ms"
              attention={pendingClubs > 0}
            />
          </div>
        )}
      </section>

      <section
        aria-labelledby="events-heading"
        className="overflow-hidden rounded-2xl border border-hairline bg-white"
      >
        <div className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-6">
          <h2
            id="events-heading"
            className="flex items-center gap-2 font-display text-sm font-semibold text-ink"
          >
            <Activity size={15} aria-hidden="true" className="text-stone-400" />
            Latest events
          </h2>
          <Link
            to="/admin/events"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-ink"
          >
            View all
            <ChevronRight size={12} aria-hidden="true" />
          </Link>
        </div>

        {latestEvents.length > 0 ? (
          <>
            <p className="border-b border-hairline px-5 py-2.5 text-xs text-stone-500 sm:px-6">
              Showing {latestEvents.length} of {events.length} events, most
              recent first
            </p>
            <ul>
              {latestEvents.map((ev, i) => (
                <li key={ev._id} className="border-b border-hairline last:border-0">
                  <Link
                    to={`/admin/event/${ev._id}`}
                    className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-stone-50 active:bg-stone-100 sm:px-6"
                  >
                    <span className="w-6 shrink-0 text-right text-xs font-medium tabular-nums text-stone-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink transition-colors duration-150 group-hover:text-stone-600">
                        {ev.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-stone-500">
                        {ev.district || "No location set"}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-xs text-stone-500 sm:block">
                      {new Date(ev.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <EventStatus status={ev.status} />
                    <ChevronRight
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 text-stone-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-stone-500"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No events yet"
            body="Events created by clubs will appear here as soon as the first one is published."
            to="/admin/events"
            actionLabel="Go to events"
          />
        )}
      </section>

      <section aria-labelledby="shortcuts-heading">
        <h2
          id="shortcuts-heading"
          className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-ink"
        >
          <FileText size={15} aria-hidden="true" className="text-stone-400" />
          Jump to
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((item, i) => (
            <Link
              key={item.link}
              to={item.link}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`group animate-[rise_460ms_cubic-bezier(0.22,1,0.36,1)_both] rounded-2xl border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${
                item.attention
                  ? "border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-50"
                  : "border-hairline hover:border-stone-300"
              }`}
            >
              <span className="flex items-center justify-between">
                <span
                  className={`flex size-9 items-center justify-center rounded-xl border transition-colors duration-200 ${
                    item.attention
                      ? "border-amber-200 bg-amber-100 text-amber-700"
                      : "border-hairline bg-stone-50 text-stone-500 group-hover:border-stone-300 group-hover:bg-stone-100 group-hover:text-ink"
                  }`}
                >
                  <item.icon size={16} aria-hidden="true" />
                </span>
                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  className="text-stone-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-stone-500"
                />
              </span>
              <span
                className={`mt-3 block text-sm font-medium ${
                  item.attention ? "text-amber-900" : "text-ink"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`mt-0.5 block text-xs ${
                  item.attention ? "text-amber-800" : "text-stone-500"
                }`}
              >
                {item.desc}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

/*
 * The four figures, as links.
 *
 * These previously counted up from zero over a second before settling on the
 * real number. On a console where the numbers are the entire point, a figure
 * that is briefly untrue is worse than one that simply appears, and it made
 * every screenshot of this page non-deterministic. They also carried a
 * TrendingUp arrow and a caption with nothing behind them. The detail line is
 * now something the data can support, such as how many clubs are approved.
 *
 * The arrival is one short rise, once, with a per-card delay so the row
 * resolves left to right. It uses the rise keyframes from index.css directly
 * rather than .reveal, which needs an observer to add .is-visible and would
 * otherwise leave the cards invisible if that observer never runs. Filling
 * forwards means the reduced-motion rule can collapse the duration and still
 * land on the finished card.
 */
const StatCard = ({
  icon: Icon,
  label,
  value,
  detail,
  to,
  delay = "0ms",
  attention = false,
}) => {
  return (
    <Link
      to={to}
      style={{ animationDelay: delay }}
      className={`group animate-[rise_460ms_cubic-bezier(0.22,1,0.36,1)_both] rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${
        attention
          ? "border-amber-200 bg-amber-50 hover:border-amber-300 hover:shadow-md"
          : "border-hairline bg-white hover:border-stone-300"
      }`}
    >
      <span
        className={`mb-4 flex size-10 items-center justify-center rounded-xl border transition-colors duration-200 ${
          attention
            ? "border-amber-200 bg-amber-100 text-amber-700"
            : "border-hairline bg-stone-50 text-stone-500 group-hover:border-stone-300 group-hover:bg-stone-100 group-hover:text-ink"
        }`}
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <span
        className={`block text-xs font-medium uppercase tracking-wider ${
          attention ? "text-amber-800" : "text-stone-500"
        }`}
      >
        {label}
      </span>
      <span
        className={`mt-1 block font-display text-4xl font-semibold leading-none tabular-nums ${
          attention ? "text-amber-900" : "text-ink"
        }`}
      >
        {value}
      </span>
      <span
        className={`mt-2 block text-xs ${
          attention ? "text-amber-800" : "text-stone-500"
        }`}
      >
        {detail}
      </span>
    </Link>
  );
};

/*
 * Status straight from the Events model enum. An unrecognised value still shows
 * as itself in neutral grey, because a badge that renames whatever it is given
 * will eventually label a broken record as healthy.
 */
const EVENT_STATUS_CHIP = {
  draft: "border-stone-200 bg-stone-100 text-stone-700",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  completed: "border-sky-200 bg-sky-50 text-sky-700",
};

const EventStatus = ({ status }) => {
  if (!status) return null;

  const chip =
    EVENT_STATUS_CHIP[status] ??
    "border-stone-200 bg-stone-50 text-stone-600";

  return (
    <span
      className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${chip}`}
    >
      {status}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, body, to, actionLabel }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    <span className="flex size-11 items-center justify-center rounded-full border border-hairline bg-stone-50 text-stone-400">
      <Icon size={20} aria-hidden="true" />
    </span>
    <p className="mt-3 font-display text-sm font-semibold text-ink">{title}</p>
    <p className="mt-1 max-w-sm text-sm text-stone-500">{body}</p>
    {to && (
      <Link
        to={to}
        className="mt-4 rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-100"
      >
        {actionLabel}
      </Link>
    )}
  </div>
);

export default AdminDashboard;