// src/pages/admin/AdminManageEvents.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Search,
  Eye,
  X,
  AlertCircle,
  Clock,
  Inbox,
  CheckCircle2,
  Ban,
  Pencil,
} from "lucide-react";
import useAdmin from "../../hooks/useAdmin";
import ConfirmDialog from "../../components/common/ConfirmDialog";

/**
 * Every event on the platform, with the controls to delete one and open its
 * detail page.
 *
 * Three things were wrong here beyond the styling.
 *
 * The status logic ignored the model. It called an event Active or Completed
 * purely from comparing today's date against eventDate, so a draft that had
 * not happened yet was reported as an Active Event, and a cancelled event with
 * a future date was reported as Active too. The Events model has carried a
 * status enum since it was written. deriveStatus now reads it, with the dates
 * still deciding what has actually happened.
 *
 * The card labelled participantCount as "Participants". That field is capacity,
 * the ceiling the organiser sets, and it is documented as such in
 * registrationService.js. The live count is currentParticipants, which is the
 * field the server atomically increments when a seat is claimed. So the number
 * an admin was reading as "how many people are coming" was in fact "how many
 * people could come". Both are now shown, as registered out of capacity.
 *
 * The filter panel was redundant. It listed the same five statuses with the same
 * counts that the summary cards above it already showed, behind a button. The
 * cards are now the filters, which removed showFilters and the panel with it.
 *
 * The page also rendered its own full-height container and its own Footer on
 * top of the shell, which padded everything twice.
 */
const normalizePoster = (poster) => {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  const base = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
  return `${base}${poster}`;
};

const STATUS_FILTERS = [
  { value: "all", label: "All events" },
  { value: "active", label: "Open" },
  { value: "deadline", label: "Registration closed" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/*
 * A single status for an event, and the reason it wins that status.
 *
 * Order matters. Cancelled is an explicit human decision and has to outrank
 * everything, or cancelling an event that already happened would silently
 * report it as completed. A past event date then settles it as completed,
 * because that is a fact rather than a label. Draft comes next so unpublished
 * work is never counted as open. Only then does a closed registration deadline
 * apply, and everything else is an event that is genuinely taking signups.
 */
const deriveStatus = (event, now) => {
  if (event.status === "cancelled") return "cancelled";
  if (event.eventDate && new Date(event.eventDate) < now) return "completed";
  if (event.status === "draft") return "draft";
  if (event.deadline && new Date(event.deadline) < now) return "deadline";
  return "active";
};

const STATUS_CHIP = {
  active: {
    label: "Open for signups",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  deadline: {
    label: "Registration closed",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock,
  },
  draft: {
    label: "Draft",
    chip: "border-stone-200 bg-stone-100 text-stone-700",
    icon: Pencil,
  },
  completed: {
    label: "Completed",
    chip: "border-sky-200 bg-sky-50 text-sky-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    chip: "border-red-200 bg-red-50 text-red-700",
    icon: Ban,
  },
};

/*
 * Verification is a separate axis from the lifecycle statuses above, so it gets
 * its own filter row rather than being folded into STATUS_FILTERS. An event can
 * be "Open for signups" and still awaiting review, which is the normal state of
 * every freshly created event, so mixing the two would hide that.
 */
const VERIFICATION_FILTERS = [
  { value: "pending", label: "Awaiting review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const VERIFICATION_CHIP = {
  pending: {
    label: "Awaiting review",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    chip: "border-red-200 bg-red-50 text-red-700",
    icon: Ban,
  },
};

// Events created before verification existed have no field on them. They were
// publicly visible back then, so treating a missing value as pending would hide
// the whole existing catalogue from this list until someone re-approved it.
const verificationOf = (event) => event.verificationStatus || "approved";

const formatDateTime = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const PER_PAGE = 5;

const AdminManageEvents = () => {
  const { adminData, fetchEvents, deleteEvent, setEventVerification } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // Opens on the review queue rather than everything. The page a moderator
  // visits is the one holding work for them.
  const [verificationFilter, setVerificationFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Frozen on purpose. A list whose statuses quietly reorder themselves while
  // someone is reading them is harder to act on than one that is briefly stale.
  const now = useMemo(() => new Date(), []);

  const events = useMemo(() => adminData.events || [], [adminData.events]);

  useEffect(() => {
  // "all" rather than letting the service default to pending: the whole list is
  // fetched once and the verification filter narrows it client-side, the same way
  // the lifecycle filter already works here. Filtering server-side too would mean
  // the counts below could only be counted within whatever was last fetched.
  fetchEvents({ verificationStatus: "all" });
  }, [fetchEvents]);

  // One pass for every count. This was four separate filters over the same
  // array before, recomputed on each render.
  const counts = useMemo(() => {
    const acc = { all: events.length };
    for (const key of STATUS_FILTERS) acc[key.value] ??= 0;
    for (const event of events) acc[deriveStatus(event, now)] += 1;
    return acc;
  }, [events, now]);

  const verificationCounts = useMemo(() => {
    const acc = { all: events.length };
    for (const { value } of VERIFICATION_FILTERS) acc[value] ??= 0;
    for (const event of events) acc[verificationOf(event)] += 1;
    return acc;
  }, [events]);

  const filteredEvents = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      if (verificationFilter !== "all" && verificationOf(event) !== verificationFilter) {
        return false;
      }
      if (statusFilter !== "all" && deriveStatus(event, now) !== statusFilter) {
        return false;
      }
      if (!needle) return true;

      return [
        event.title,
        event.organizer?.name,
        event.createdBy?.name,
        event.category,
        event.district,
        event.venue,
      ].some((field) => field?.toLowerCase().includes(needle));
    });
  }, [events, searchTerm, statusFilter, verificationFilter, now]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PER_PAGE));

  // Deleting the last row on page 3 used to leave the pager reading "Page 3 of
  // 2", because the slice was clamped but the label and the disabled state
  // were not. Everything below reads this one value.
  const page = Math.min(currentPage, totalPages);
  const visibleEvents = filteredEvents.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );

const applyFilter = (value) => {
  setStatusFilter(value);
  setCurrentPage(1);
  };

  const applyVerificationFilter = (value) => {
  setVerificationFilter(value);
  setCurrentPage(1);
  };

  // Approve and Reject are both a one-click decision with no confirmation. The
  // confirmation dialog is for deletion because that destroys registrations;
  // approval is reversible from the same list, so making it take two clicks only
  // slows down reviewing a queue. Rejection is not destructive either.
  const handleVerification = async (eventId, decision, title) => {
  try {
    await setEventVerification(eventId, decision);
    toast.success(
    decision === "approve"
      ? `“${title}” is approved and now visible to users.`
      : `“${title}” was rejected and stays hidden from users.`,
    );
  } catch (error) {
    toast.error(error.message || "Could not update this event.");
  }
  };

  const clearAll = () => {
  setStatusFilter("all");
  setVerificationFilter("all");
  setSearchTerm("");
  setCurrentPage(1);
  };

  const handleDeleteEvent = (eventId, title) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete event",
      message: `"${title}" will be permanently deleted, along with its registrations. This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteEvent(eventId);
          toast.success("Event deleted.");
        } catch (error) {
          toast.error(error.message || "Could not delete the event.");
        } finally {
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
        }
      },
    });
  };

  const activeFilterLabel = STATUS_FILTERS.find(
    (f) => f.value === statusFilter,
  )?.label;

  const activeVerificationLabel = VERIFICATION_FILTERS.find(
    (f) => f.value === verificationFilter,
  )?.label;

  if (adminData.error) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-full border border-red-200 bg-white text-red-600">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <h2 className="mt-3 font-display text-base font-semibold text-red-900">
          Could not load events
        </h2>
        <p className="mt-1 max-w-sm text-sm text-red-800">{adminData.error}</p>
        <button
          type="button"
          onClick={() => fetchEvents({ verificationStatus: "all" })}
          className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="flex flex-col gap-3 rounded-2xl border border-hairline bg-white p-4 sm:flex-row sm:items-center"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Verification
        </span>
        <div className="flex flex-wrap gap-2">
          {VERIFICATION_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => applyVerificationFilter(filter.value)}
              aria-pressed={verificationFilter === filter.value}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                verificationFilter === filter.value
                  ? "border-ink bg-ink text-paper"
                  : "border-hairline bg-white text-stone-700 hover:bg-stone-100"
              }`}
            >
              {filter.label}
              <span className="tabular-nums opacity-70">
                {verificationCounts[filter.value] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUS_FILTERS.map((filter) => (
          <StatusTile
            key={filter.value}
            label={filter.label}
            value={counts[filter.value] ?? 0}
            selected={statusFilter === filter.value}
            onClick={() => applyFilter(filter.value)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="event-search" className="sr-only">
            Search events
          </label>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            id="event-search"
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search title, club, category, district or venue"
            className="w-full rounded-xl border border-hairline bg-white py-2.5 pl-10 pr-10 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-stone-400 focus:border-stone-300"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition-colors duration-200 hover:bg-stone-100 hover:text-ink"
            >
              <X size={14} aria-hidden="true" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>

        {statusFilter !== "all" && (
          <button
            type="button"
            onClick={() => applyFilter("all")}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors duration-200 hover:bg-stone-100"
          >
            {activeFilterLabel}
            <X size={12} aria-hidden="true" />
            <span className="sr-only">Clear filter</span>
          </button>
        )}

        <p className="shrink-0 text-xs text-stone-500 sm:ml-auto">
          Showing {filteredEvents.length} of {events.length} events
          {verificationFilter !== "all" && ` · ${activeVerificationLabel}`}
        </p>
      </div>

      {adminData.loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-hairline bg-stone-100"
            />
          ))}
        </div>
      ) : visibleEvents.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-hairline bg-white px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-full border border-hairline bg-stone-50 text-stone-400">
            <Inbox size={20} aria-hidden="true" />
          </span>
          <h2 className="mt-3 font-display text-base font-semibold text-ink">
            {events.length === 0
              ? "No events yet"
              : verificationFilter === "pending" && filteredEvents.length === 0
                ? "Nothing waiting on you"
                : "Nothing matches"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-stone-500">
            {events.length === 0
              ? "Events created by clubs will appear here as soon as the first one is submitted for review."
              : verificationFilter === "pending" && filteredEvents.length === 0
                ? "Every event has been reviewed. Switch to Approved or Rejected to see past decisions."
                : `No events match ${searchTerm ? `“${searchTerm}”` : `${activeVerificationLabel.toLowerCase()}${statusFilter !== "all" ? `, ${activeFilterLabel.toLowerCase()}` : ""}`}.`}
          </p>
          {(searchTerm || statusFilter !== "all" || verificationFilter !== "all") && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-100"
            >
              Clear search and filters
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {visibleEvents.map((event, index) => (
            <EventRow
              key={event._id}
              event={event}
              status={deriveStatus(event, now)}
              delay={index * 50}
              onDelete={() => handleDeleteEvent(event._id, event.title)}
              onApprove={() => handleVerification(event._id, "approve", event.title)}
              onReject={() => handleVerification(event._id, "reject", event.title)}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Event pages"
          className="flex items-center justify-center gap-3 pt-1"
        >
          <PagerButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </PagerButton>
          <span className="text-xs font-medium text-stone-600">
            Page {page} of {totalPages}
          </span>
          <PagerButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={page === totalPages}
          >
            Next
          </PagerButton>
        </nav>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null })
        }
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete event"
        type="danger"
      />
    </div>
  );
};

/*
 * The summary cards double as the status filter, so they are buttons with
 * aria-pressed rather than links to somewhere that does not exist. Tapping the
 * count you care about should narrow the list, which is what an admin scanning
 * six numbers is actually asking for.
 */
const StatusTile = ({ label, value, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${
      selected
        ? "border-ink bg-ink text-paper"
        : "border-hairline bg-white text-ink hover:border-stone-300"
    }`}
  >
    <span
      className={`block font-display text-2xl font-semibold leading-none tabular-nums ${
        selected ? "text-paper" : "text-ink"
      }`}
    >
      {value}
    </span>
    <span
      className={`mt-1.5 block text-xs leading-tight ${
        selected ? "text-paper/70" : "text-stone-500"
      }`}
    >
      {label}
    </span>
  </button>
);

const EventRow = ({ event, status, delay, onDelete, onApprove, onReject }) => {
  const meta = STATUS_CHIP[status];
  const poster = normalizePoster(event.poster);
  const registered = event.currentParticipants ?? 0;
  const capacity = event.participantCount ?? 0;
  const verification = verificationOf(event);
  const verificationMeta = VERIFICATION_CHIP[verification];

  return (
    <li
      style={{ animationDelay: `${delay}ms` }}
      className="animate-[rise_460ms_cubic-bezier(0.22,1,0.36,1)_both] rounded-2xl border border-hairline bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex gap-4 sm:flex-1 sm:items-start">
          <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-hairline bg-stone-50">
            {poster ? (
              <img
                src={poster}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-stone-300">
                <Calendar size={22} aria-hidden="true" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="font-display text-base font-semibold text-ink">
                <Link
                  to={`/admin/event/${event._id}`}
                  className="rounded transition-colors duration-150 hover:text-stone-600"
                >
                  {event.title}
                </Link>
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${meta.chip}`}
              >
                <meta.icon size={12} aria-hidden="true" />
                {meta.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${verificationMeta.chip}`}
              >
                <verificationMeta.icon size={12} aria-hidden="true" />
                {verificationMeta.label}
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Organiser" value={event.organizer?.name} />
              <Field label="Category" value={event.category} />
              <Field label="District" value={event.district} />
              <Field label="Venue" value={event.venue} />
              <Field label="Event date" value={formatDateTime(event.eventDate)} />
              <Field label="Deadline" value={formatDateTime(event.deadline)} />
            </dl>

            {event.verificationNote && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <span className="font-medium">Review note:</span>{" "}
                {event.verificationNote}
              </p>
            )}

            <p className="mt-3 text-xs text-stone-500">
              <span className="font-medium text-ink tabular-nums">
                {registered} registered
              </span>
              {capacity > 0 && (
                <span className="tabular-nums"> of {capacity} places</span>
              )}
              {capacity === 0 && (
                <span className="ml-2 text-amber-700">
                  No capacity set, so nobody can register
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-hairline pt-3 sm:w-44 sm:flex-col sm:items-stretch sm:justify-start sm:border-0 sm:pt-0">
          {/* Only the decision that changes state is offered. Offering Approve on
              an approved event would just be a no-op the admin has to reason
              about. */}
          {verification !== "approved" ? (
            <button
              type="button"
              onClick={onApprove}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors duration-200 hover:bg-emerald-100 sm:flex-none"
            >
              <CheckCircle2 size={14} aria-hidden="true" />
              Approve
            </button>
          ) : (
            <button
              type="button"
              onClick={onReject}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 sm:flex-none"
            >
              <Ban size={14} aria-hidden="true" />
              Revoke
            </button>
          )}
          <Link
            to={`/admin/event/${event._id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-hairline bg-white px-3 py-2 text-xs font-medium text-ink transition-colors duration-200 hover:bg-stone-100 sm:flex-none"
          >
            <Eye size={14} aria-hidden="true" />
            Details
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 sm:flex-none"
          >
            <X size={14} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </li>
  );
};

const Field = ({ label, value }) => (
  <div className="flex gap-2 sm:block">
    <dt className="shrink-0 text-xs uppercase tracking-wide text-stone-500 sm:mb-0.5">
      {label}
    </dt>
    <dd className="truncate text-ink">{value || "Not set"}</dd>
  </div>
);

const PagerButton = ({ children, ...rest }) => (
  <button
    type="button"
    {...rest}
    className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors duration-200 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
  >
    {children}
  </button>
);

export default AdminManageEvents;