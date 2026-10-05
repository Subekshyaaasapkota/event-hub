// src/pages/admin/AdminEventDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Calendar,
  MapPin,
  Clock,
  Globe,
  ChevronLeft,
  Building2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Share2,
  Eye,
  Pencil,
  Trash2,
  Users,
  Ban,
  Info,
} from "lucide-react";
import {
  NO_IMAGE_PLACEHOLDER,
  getImageUrlOrPlaceholder,
} from "../../utils/imageUrl";
import useAdmin from "../../hooks/useAdmin";

/**
 * One event, as an admin sees it.
 *
 * This page was carrying several statements that the data could not support.
 *
 * District was rendered twice for every physical event: once by a block that
 * swapped between "Event Type" and "District" depending on eventType, and
 * again by the block below it that only showed for physical events. Both drew
 * from event.district, so the same value appeared in the same grid.
 *
 * A green badge reading "Free Event" was hardcoded. The model has isPaid and
 * price, and a paid event was being described as free to the person deciding
 * whether to allow it.
 *
 * Capacity read "Unlimited" unconditionally, next to a number that was
 * participantCount. That field is capacity, not a count, so the two tiles
 * beside each other were describing the same number twice while calling one of
 * them a total. Worse, the underlying check in registrationService refuses to
 * claim a seat when capacity is zero, so an event with no capacity set accepts
 * nobody. Calling that unlimited is the opposite of true.
 *
 * "This event is currently active and visible to all users" was printed for any
 * event with a future date. Drafts and cancelled events got the same
 * reassurance. The status now comes from the model.
 *
 * The Edit button pointed at /admin/events/edit/:id, which this same component
 * renders. It navigated to itself and changed nothing, so it is gone rather than
 * relabelled. There is no admin event editor to send anyone to.
 */
const deriveStatus = (event, now) => {
  if (event.status === "cancelled") return "cancelled";
  if (event.eventDate && new Date(event.eventDate) < now) return "completed";
  if (event.status === "draft") return "draft";
  if (event.deadline && new Date(event.deadline) < now) return "closed";
  return "open";
};

const STATUS = {
  open: {
    label: "Open for signups",
    icon: CheckCircle2,
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    note: "Accepting registrations",
  },
  closed: {
    label: "Registration closed",
    icon: Clock,
    chip: "border-amber-200 bg-amber-50 text-amber-800",
    note: "The registration deadline has passed",
  },
  draft: {
    label: "Draft",
    icon: Pencil,
    chip: "border-stone-200 bg-stone-100 text-stone-700",
    note: "Not published",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    chip: "border-sky-200 bg-sky-50 text-sky-800",
    note: "The event date has passed",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    chip: "border-red-200 bg-red-50 text-red-800",
    note: "This event was cancelled",
  },
};

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const AdminEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminData, fetchEvents, deleteEvent } = useAdmin();

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    onConfirm: null,
  });

  const events = adminData.events;
  const loading = adminData.loading;
  const error = adminData.error;

  useEffect(() => {
    if (!events?.length) fetchEvents();
  }, [events, fetchEvents]);

  // Selected from the already-loaded list rather than fetched again. One list is
  // fetched for the whole console, so a second request for a single record was
  // both slower and able to disagree with the list the admin came from.
  const event = useMemo(
    () => events?.find((e) => e._id === id),
    [events, id],
  );

  const now = useMemo(() => new Date(), []);
  const status = event ? deriveStatus(event, now) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied.");
    } catch {
      // Clipboard access is refused outside a secure context, and this page can
      // be reached over plain http in development.
      toast.error("Could not copy the link.");
    }
  };

  const confirmDelete = () => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: async () => {
        try {
          await deleteEvent(id);
          toast.success("Event deleted.");
          // Only leave once the server has confirmed. On a refusal the admin
          // stays on the page with the event still there, which is what they
          // need in order to read the reason.
          navigate("/admin/events");
        } catch (err) {
          toast.error(err.message || "Could not delete the event.");
        } finally {
          setConfirmDialog({ isOpen: false, onConfirm: null });
        }
      },
    });
  };

  if (error && !events) {
    return (
      <ErrorPanel message={error} onRetry={fetchEvents} />
    );
  }

  if (loading && !event) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading event</span>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-100" />
        <div className="aspect-video animate-pulse rounded-2xl bg-stone-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-stone-100" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-hairline bg-white px-6 py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-full border border-hairline bg-stone-50 text-stone-400">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <h2 className="mt-3 font-display text-base font-semibold text-ink">
          Event not found
        </h2>
        <p className="mt-1 max-w-sm text-sm text-stone-500">
          It may have been deleted, or the link may be out of date.
        </p>
        <Link
          to="/admin/events"
          className="mt-4 rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-100"
        >
          Back to events
        </Link>
      </div>
    );
  }

  const meta = STATUS[status];
  const registered = event.currentParticipants ?? 0;
  const capacity = event.participantCount ?? 0;
  const isOnline = event.eventType === "online";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/events"
          className="-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-ink"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          All events
        </Link>

        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-white px-3 py-2 text-xs font-medium text-stone-700 transition-colors duration-200 hover:bg-stone-100"
        >
          <Share2 size={14} aria-hidden="true" />
          Copy link
        </button>
      </div>

      <div
        className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${meta.chip}`}
      >
        <meta.icon size={18} aria-hidden="true" className="shrink-0" />
        <div>
          <p className="text-sm font-semibold">{meta.label}</p>
          <p className="mt-0.5 text-xs opacity-80">{meta.note}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <img
          src={getImageUrlOrPlaceholder(event.poster)}
          alt=""
          onError={(e) => {
            // A Cloudinary URL can 404 after a folder is renamed, so fall back too.
            e.target.onerror = null;
            e.target.src = NO_IMAGE_PLACEHOLDER;
          }}
          className="aspect-video w-full bg-stone-100 object-cover"
        />

        <div className="space-y-6 p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-hairline bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                {event.category || "Other"}
              </span>
              {/*
                Reads the model's own fields rather than asserting "Free Event"
                on every record regardless of what it charges.
              */}
              {event.isPaid ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                  Paid
                  {event.price > 0 && (
                    <span className="tabular-nums">
                      {" "}
                      · NPR {event.price.toLocaleString()}
                    </span>
                  )}
                </span>
              ) : (
                <span className="rounded-full border border-hairline bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                  Free
                </span>
              )}
              {event.registrationType === "google_form" && (
                <span className="rounded-full border border-hairline bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                  Offsite signups
                </span>
              )}
            </div>

            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
              {event.title}
            </h2>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 border-y border-hairline py-5 text-sm sm:grid-cols-2">
            <Detail label="Event date and time" icon={Calendar}>
              {formatDateTime(event.eventDate)}
            </Detail>

            <Detail label="Registration deadline" icon={Clock}>
              {formatDateTime(event.deadline)}
            </Detail>

            <Detail label="Format" icon={isOnline ? Globe : MapPin}>
              {isOnline ? "Online" : "In person"}
            </Detail>

            {/*
              One District field, not two. The previous version drew this same
              value twice for physical events.
            */}
            {!isOnline && (
              <Detail label="District" icon={MapPin}>
                {event.district || "Not set"}
              </Detail>
            )}

            {!isOnline && event.venue && (
              <Detail label="Venue" icon={MapPin}>
                {event.venue}
              </Detail>
            )}

            <Detail label="Organising club" icon={Building2}>
              {event.organizer?.name || "Unknown"}
            </Detail>

            <Detail label="Created by" icon={Building2}>
              {event.createdBy?.name || "Unknown"}
            </Detail>

            <Detail label="Created on" icon={Calendar}>
              {formatDate(event.createdAt)}
            </Detail>
          </dl>

          <section>
            <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-ink">
              <Info size={15} aria-hidden="true" className="text-stone-400" />
              Description
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
              {event.description || "No description was provided."}
            </p>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-hairline bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-ink">
              <Users size={15} aria-hidden="true" className="text-stone-400" />
              Registration
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-hairline bg-stone-50 px-4 py-3">
                <p className="font-display text-2xl font-semibold leading-none tabular-nums text-ink">
                  {registered}
                </p>
                <p className="mt-1.5 text-xs text-stone-500">Registered</p>
              </div>
              <div className="rounded-xl border border-hairline bg-stone-50 px-4 py-3">
                <p className="font-display text-2xl font-semibold leading-none tabular-nums text-ink">
                  {capacity > 0 ? capacity : "None"}
                </p>
                <p className="mt-1.5 text-xs text-stone-500">Capacity</p>
              </div>
            </div>

            {/* A seat can only be claimed below capacity, so the fill is the
                number that tells an admin whether anyone can still register. */}
            <CapacityBar registered={registered} capacity={capacity} />

            {capacity === 0 && (
              <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <AlertCircle size={13} aria-hidden="true" className="mt-px shrink-0" />
                <span>
                  No capacity is set, so nobody can register. A seat is only
                  claimed while registered is below capacity.
                </span>
              </p>
            )}

            {event.registrationType === "google_form" &&
              event.googleSheetResponseLink && (
                <a
                  href={event.googleSheetResponseLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-white px-3 py-2 text-xs font-medium text-ink transition-colors duration-200 hover:bg-stone-100"
                >
                  <Share2 size={13} aria-hidden="true" />
                  Open the signup responses
                </a>
              )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-hairline bg-white p-5">
            <h3 className="mb-4 font-display text-sm font-semibold text-ink">
              Actions
            </h3>

            <div className="space-y-2">
              <a
                href={`/event/${event._id}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-100"
              >
                View the public page
                <Eye
                  size={15}
                  aria-hidden="true"
                  className="text-stone-400"
                />
              </a>

              <Link
                to="/admin/events"
                className="flex items-center justify-between rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-100"
              >
                Back to all events
                <ChevronLeft
                  size={15}
                  aria-hidden="true"
                  className="text-stone-400"
                />
              </Link>

              <button
                type="button"
                onClick={confirmDelete}
                className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50"
              >
                Delete this event
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-auto pt-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-stone-500">
                Record
              </p>
              <dl className="space-y-1 text-xs text-stone-500">
                <div className="flex justify-between gap-3">
                  <dt>Event ID</dt>
                  <dd className="truncate font-mono text-stone-700">
                    {event._id}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Created by ID</dt>
                  <dd className="truncate font-mono text-stone-700">
                    {event.createdBy?._id || "Not recorded"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>

      {event.organizer && (
        <section className="rounded-2xl border border-hairline bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-ink">
            <Building2 size={15} aria-hidden="true" className="text-stone-400" />
            Organising club
          </h3>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="font-medium text-ink">{event.organizer.name}</p>
            {event.organizer.email && (
              <a
                href={`mailto:${event.organizer.email}`}
                className="inline-flex items-center gap-1.5 text-sm text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors duration-200 hover:text-ink"
              >
                <Mail size={13} aria-hidden="true" />
                {event.organizer.email}
              </a>
            )}
            {/* Only claims a verified club when the record actually says so. */}
            {event.organizer.isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                <CheckCircle2 size={12} aria-hidden="true" />
                Verified
              </span>
            )}
          </div>
        </section>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, onConfirm: null })}
        onConfirm={confirmDialog.onConfirm}
        title="Delete this event?"
        message={`“${event.title}” will be permanently deleted, along with its registrations. This cannot be undone.`}
        confirmText="Delete event"
        type="danger"
      />
    </div>
  );
};

const Detail = ({ label, icon: Icon, children }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-hairline bg-stone-50 text-stone-500">
      <Icon size={14} aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  </div>
);

const CapacityBar = ({ registered, capacity }) => {
  const pct = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const full = capacity > 0 && registered >= capacity;

  return (
    <div className="mt-4">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuenow={registered}
        aria-valuemin={0}
        aria-valuemax={capacity || 0}
        aria-label="Registration fill"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            full ? "bg-amber-500" : "bg-ink"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-stone-500">
        {capacity > 0 ? (
          <>
            <span className="tabular-nums">{pct}%</span> full
            {full && (
              <span className="text-amber-700">
                {" "}
                · no places left, so signups are closed
              </span>
            )}
          </>
        ) : (
          "Capacity has not been set."
        )}
      </p>
    </div>
  );
};

const ErrorPanel = ({ message, onRetry }) => (
  <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
    <span className="flex size-11 items-center justify-center rounded-full border border-red-200 bg-white text-red-600">
      <AlertCircle size={20} aria-hidden="true" />
    </span>
    <h2 className="mt-3 font-display text-base font-semibold text-red-900">
      Could not load events
    </h2>
    <p className="mt-1 max-w-sm text-sm text-red-800">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700"
    >
      Try again
    </button>
  </div>
);

export default AdminEventDetails;