// src/pages/admin/AdminRegistrations.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Calendar,
  Mail,
  Phone,
  Building2,
  ChevronLeft,
  Search,
  Download,
  Clock,
  MapPin,
  ShieldAlert,
  AlertCircle,
  Info,
} from "lucide-react";
import SegmentedControl from "../../components/common/SegmentedControl";
import DetailDialog from "../../components/common/DetailDialog";
import useAdmin from "../../hooks/useAdmin";
import { exportToCsv, stampedFilename } from "../../utils/csv";
import { toast } from "react-hot-toast";

/**
 * Registration status comes from the Registration enum: Confirmed, Pending,
 * Cancelled, Failed.
 *
 * All four are named. The old chip had a single fallback branch for everything
 * that was not Confirmed or Pending, so Cancelled and Failed were both drawn in
 * the same neutral grey as each other and as an unrecognised value. A failed
 * payment and a cancellation are different things to whoever reads this list.
 */
const STATUS_META = {
  Confirmed: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Icon: Users,
  },
  Pending: {
    chip: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: Clock,
  },
  Cancelled: {
    chip: "border-stone-300 bg-stone-100 text-stone-700",
    Icon: ShieldAlert,
  },
  Failed: {
    chip: "border-red-200 bg-red-50 text-red-800",
    Icon: AlertCircle,
  },
};

const statusMeta = (status) =>
  STATUS_META[status] || {
    chip: "border-stone-300 bg-stone-100 text-stone-700",
    Icon: AlertCircle,
  };

const NO_VALUE = "Not provided";
const UNKNOWN_EVENT = "Event no longer available";
const UNKNOWN_USER = "Account no longer available";

const CSV_COLUMNS = [
  { key: "Event Title", label: "Event Title" },
  { key: "Club/Organizer", label: "Club/Organizer" },
  { key: "Event Date", label: "Event Date" },
  { key: "Student Name", label: "Student Name" },
  { key: "Email", label: "Email" },
  { key: "Phone", label: "Phone" },
  { key: "College", label: "College" },
  { key: "Registration Date", label: "Registration Date" },
  { key: "Status", label: "Status" },
];

const formatDate = (value) => {
  if (!value) return NO_VALUE;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return NO_VALUE;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const initialsOf = (name) => name?.trim()?.charAt(0).toUpperCase() || "?";

/**
 * A registration can reference an event or a user that no longer exists. Mongoose
 * populate resolves a missing document to null rather than omitting the key, so
 * reg.user and reg.event are both nullable at runtime despite being required in
 * the schema. Legacy rows can also predate a record being removed by hand.
 *
 * Every read below therefore goes through these two helpers instead of touching
 * reg.user.name or reg.event.title directly, which is what used to throw.
 */
const userOf = (registration) => registration?.user || null;
const eventOf = (registration) => registration?.event || null;

/** Searchable text for one row, assembled once so the filter stays cheap. */
const haystack = (registration) => {
  const user = userOf(registration);
  const event = eventOf(registration);

  return [
    user?.name,
    user?.email,
    user?.college,
    registration?.name,
    registration?.email,
    registration?.college,
    registration?.phone,
    event?.title,
    event?.district,
    event?.organizer?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const AdminRegistrations = () => {
  const { fetchRegistrations, registrations, loading, error } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const list = useMemo(() => registrations || EMPTY, [registrations]);

  /**
   * The event filter, built in one pass.
   *
   * It used to collect ids into a Set and then, for each id, run a second
   * registrations.find to recover the title, so this was quadratic in the row
   * count for a list that can be every registration on the platform.
   *
   * Registrations with no event are still counted and still listed. They used to
   * be dropped by a filter that returned false for a missing event, which meant
   * a registration whose event had been removed disappeared from the page with
   * no trace, while the Total Registrations figure above still counted it. The
   * total and the list now agree, and an orphaned row says so.
   */
  const events = useMemo(() => {
    const byId = new Map();

    for (const registration of list) {
      const event = eventOf(registration);
      if (!event?._id) continue;

      if (!byId.has(event._id)) {
        byId.set(event._id, {
          id: event._id,
          title: event.title || "Untitled event",
          organizer: event.organizer?.name || NO_VALUE,
        });
      }
    }

    return [...byId.values()].sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [list]);

  const counts = useMemo(() => {
    const result = { all: list.length, Confirmed: 0, Pending: 0, Cancelled: 0, Failed: 0 };
    for (const registration of list) {
      if (result[registration.status] !== undefined) {
        result[registration.status] += 1;
      }
    }
    return result;
  }, [list]);

  const filteredRegistrations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return list.filter((registration) => {
      if (statusFilter !== "all" && registration.status !== statusFilter) {
        return false;
      }

      const event = eventOf(registration);
      if (selectedEvent === "orphaned") {
        return !event?._id;
      }
      if (selectedEvent !== "all") {
        if (event?._id !== selectedEvent) return false;
      }

      return !query || haystack(registration).includes(query);
    });
  }, [list, searchTerm, statusFilter, selectedEvent]);

  const selectedEventRecord = events.find((e) => e.id === selectedEvent);

  const handleExport = () => {
    const rows = filteredRegistrations.map((registration) => {
      const user = userOf(registration);
      const event = eventOf(registration);

      return {
        "Event Title": event?.title || UNKNOWN_EVENT,
        "Club/Organizer": event?.organizer?.name || NO_VALUE,
        "Event Date": event?.eventDate ? formatDate(event.eventDate) : NO_VALUE,
        //  The registration's own copy of the details is used where it has one,
        //  because that is what was captured when the person signed up and it
        //  may differ from the account since.
        "Student Name": user?.name || registration.name || UNKNOWN_USER,
        Email: user?.email || registration.email || NO_VALUE,
        Phone: registration.phone || NO_VALUE,
        College: user?.college || registration.college || NO_VALUE,
        "Registration Date": registration.createdAt
          ? formatDate(registration.createdAt)
          : NO_VALUE,
        Status: registration.status || NO_VALUE,
      };
    });

    /* Exports exactly what the table is showing, so a filtered view does not
       silently hand back the full list.

       The per-event filename looks the record up by id. It used to match on
       e._id, but the objects in this list are built with an id property and
       never have an _id, so the lookup was always undefined and every single
       event export was saved as registrations-event.csv. */
    const slug = (value) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const filename =
      selectedEvent === "all"
        ? stampedFilename("all-event-registrations")
        : selectedEvent === "orphaned"
          ? stampedFilename("registrations-without-an-event")
          : `registrations-${slug(selectedEventRecord?.title || "event")}.csv`;

    const result = exportToCsv({
      rows,
      columns: CSV_COLUMNS,
      filename,
      emptyMessage: "No registrations match the current search and filters.",
    });

    if (result.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const activeRegistration = selectedRegistration
    ? list.find((r) => r._id === selectedRegistration._id) || selectedRegistration
    : null;

  /* Registrations pointing at an event that is no longer there. Counted in the
   same pass as everything else rather than by subtracting per-event totals from
   the row count, which was a nested scan over the whole list. */
  const orphanCount = useMemo(
    () => list.filter((registration) => !eventOf(registration)?._id).length,
    [list],
  );

  return (
    <div className="pb-10">
      {error ? (
        /* Not "Access Denied". The error can be a failed request or a missing
           route, not a permissions problem, and labelling it as one sent people
           looking for a role problem they did not have. It offers a retry,
           because most of what can fail here is transient. */
        <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 px-5 py-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-red-800">
                Could not load registrations
              </h2>
              <p className="mt-1 break-words text-[14px] leading-relaxed text-red-700">
                {error}
              </p>
              <button
                type="button"
                onClick={() => fetchRegistrations()}
                className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-red-300 bg-white px-3 text-[14px] font-medium text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold tracking-tight text-ink">
            Registrations
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-stone-600">
            Everyone signed up for an event, and where each registration stands.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={filteredRegistrations.length === 0}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 self-start rounded-[12px] border border-hairline bg-white px-3 text-[14px] font-medium text-ink transition-colors hover:bg-hairline/60 active:bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {/*  Every figure below is derived from the same list the table renders, so
          the numbers and the rows cannot disagree. */}
      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Registrations" value={counts.all} />
        <Stat label="Events with signups" value={events.length} />
        <Stat label="Confirmed" value={counts.Confirmed} />
        <Stat
          label="Pending"
          value={counts.Pending}
          hint={
            counts.Pending > 0
              ? "Holding a seat until the hold expires"
              : undefined
          }
        />
      </dl>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            size={17}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search person, event, or club"
            aria-label="Search registrations by person, event, or club"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-[12px] border border-hairline bg-white pl-10 pr-3 text-[15px] text-ink outline-none transition-shadow placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-ink/25"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/*  Has an aria-label. A select showing "All Events" gives a screen
              reader no clue what the control filters. */}
          <label className="flex items-center gap-2 text-[13px] text-stone-600">
            <span className="shrink-0">Event</span>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="h-11 min-w-0 rounded-[12px] border border-hairline bg-white px-2 text-[14px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
            >
              <option value="all">All events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
              {orphanCount > 0 ? (
                <option value="orphaned">Event no longer available</option>
              ) : null}
            </select>
          </label>

          <SegmentedControl
            ariaLabel="Filter registrations by status"
            className="shrink-0"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "Confirmed", label: "Confirmed", count: counts.Confirmed },
              { value: "Pending", label: "Pending", count: counts.Pending },
              { value: "Cancelled", label: "Cancelled", count: counts.Cancelled },
              { value: "Failed", label: "Failed", count: counts.Failed },
            ].filter(
              (option) =>
                option.value === "all" || option.count > 0,
            )}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[16px] border border-hairline bg-white"
            />
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="rounded-[16px] border border-hairline bg-white px-6 py-16 text-center">
          <Users
            className="mx-auto mb-4 text-stone-300"
            size={44}
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <p className="text-[15px] text-stone-600">
            {list.length === 0
              ? "Nobody has registered for an event yet."
              : "No registrations match this search."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredRegistrations.map((registration) => {
            const user = userOf(registration);
            const event = eventOf(registration);
            const { chip, Icon } = statusMeta(registration.status);
            const isOrphan = !event?._id;

            return (
              <li
                key={registration._id}
                className={`rounded-[16px] border bg-white p-4 ${
                  isOrphan ? "border-amber-300" : "border-hairline"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-200 text-[15px] font-medium text-stone-700"
                    >
                      {initialsOf(user?.name || registration.name)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[16px] font-semibold text-ink">
                        {user?.name || registration.name || UNKNOWN_USER}
                      </h2>

                      <dl className="mt-1 space-y-0.5 text-[13px] text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <dt className="sr-only">Email</dt>
                          <Mail size={13} aria-hidden="true" className="shrink-0" />
                          <dd className="truncate">
                            {user?.email || registration.email || NO_VALUE}
                          </dd>
                        </div>
                        {registration.phone ? (
                          <div className="flex items-center gap-1.5">
                            <dt className="sr-only">Phone</dt>
                            <Phone size={13} aria-hidden="true" className="shrink-0" />
                            <dd className="truncate">{registration.phone}</dd>
                          </div>
                        ) : null}
                        {user?.college || registration.college ? (
                          <div className="flex items-center gap-1.5">
                            <dt className="sr-only">College</dt>
                            <Building2 size={13} aria-hidden="true" className="shrink-0" />
                            <dd className="truncate">
                              {user?.college || registration.college}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="rounded-[12px] bg-paper/70 p-3">
                      <h3 className="truncate text-[15px] font-medium text-ink">
                        {event?.title || UNKNOWN_EVENT}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-stone-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} aria-hidden="true" />
                          {event?.eventDate
                            ? formatDate(event.eventDate)
                            : NO_VALUE}
                        </span>
                        {event?.district ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} aria-hidden="true" />
                            {event.district}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-[13px] text-stone-600">
                        {event?.organizer?.name
                          ? `Organised by ${event.organizer.name}`
                          : "Organiser not recorded"}
                      </p>

                      {/*  Says why the row looks like this, rather than
                          leaving a reader to work out that the event is gone. */}
                      {isOrphan ? (
                        <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-amber-800">
                          <AlertCircle
                            size={13}
                            aria-hidden="true"
                            className="mt-0.5 shrink-0"
                          />
                          The event this registration points at no longer
                          exists. The record is kept because it may carry a
                          payment.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium leading-5 ${chip}`}
                    >
                      <Icon size={12} aria-hidden="true" />
                      {registration.status || "Unknown"}
                    </span>
                    <span className="text-[13px] text-stone-500">
                      {formatDate(registration.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRegistration(registration)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-hairline px-3 text-[14px] font-medium text-ink transition-colors hover:bg-hairline/60 active:bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                    >
                      <Info size={15} aria-hidden="true" />
                      Details
                      <span className="sr-only">
                        {" "}
                        for {user?.name || registration.name || "this registration"}
                      </span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <DetailDialog
        isOpen={Boolean(activeRegistration)}
        onClose={() => setSelectedRegistration(null)}
        title={
          userOf(activeRegistration)?.name ||
          activeRegistration?.name ||
          "Registration"
        }
        subtitle={eventOf(activeRegistration)?.title || UNKNOWN_EVENT}
        footer={
          <button
            type="button"
            onClick={() => setSelectedRegistration(null)}
            className="min-h-[44px] w-full rounded-[12px] bg-ink text-[15px] font-medium text-paper transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
          >
            Done
          </button>
        }
      >
        {activeRegistration ? (
          /*  A description list, so each label is announced with its value. */
          <dl className="space-y-5">
            <div>
              <dt className="text-[13px] font-medium text-stone-600">Status</dt>
              <dd className="mt-1">
                {(() => {
                  const { chip, Icon } = statusMeta(activeRegistration.status);
                  return (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium leading-5 ${chip}`}
                    >
                      <Icon size={12} aria-hidden="true" />
                      {activeRegistration.status || "Unknown"}
                    </span>
                  );
                })()}
              </dd>
            </div>

            <Row label="Registered">
              {formatDate(activeRegistration.createdAt)}
            </Row>

            {/*  Only meaningful for a pending registration. Showing a hold
                expiry for a confirmed or cancelled seat would imply a countdown
                that nothing acts on. */}
            {activeRegistration.status === "Pending" &&
            activeRegistration.holdExpiresAt ? (
              <Row label="Seat held until">
                {formatDate(activeRegistration.holdExpiresAt)}
              </Row>
            ) : null}

            <Row label="Email">
              {userOf(activeRegistration)?.email ||
                activeRegistration.email ||
                NO_VALUE}
            </Row>

            <Row label="Phone">{activeRegistration.phone || NO_VALUE}</Row>

            <Row label="College">
              {userOf(activeRegistration)?.college ||
                activeRegistration.college ||
                NO_VALUE}
            </Row>

            {activeRegistration.remarks ? (
              <Row label="Remarks">
                <p className="whitespace-pre-wrap leading-relaxed text-stone-600">
                  {activeRegistration.remarks}
                </p>
              </Row>
            ) : null}

            <Row label="Event">
              {eventOf(activeRegistration)?.title || UNKNOWN_EVENT}
            </Row>

            <Row label="Event date">
              {eventOf(activeRegistration)?.eventDate
                ? formatDate(eventOf(activeRegistration).eventDate)
                : NO_VALUE}
            </Row>

            <Row label="District">
              {eventOf(activeRegistration)?.district || NO_VALUE}
            </Row>

            <Row label="Organiser">
              {eventOf(activeRegistration)?.organizer?.name || NO_VALUE}
            </Row>

            {/*  Amount and transaction are only rendered when a payment was
                actually recorded. The old CSV wrote a bare Status column and
                nothing about payment, so an admin could not tell a free
                registration from one that took money. */}
            {activeRegistration.paymentInfo?.amount ? (
              <Row label="Payment">
                <span className="tabular-nums">
                  {activeRegistration.paymentInfo.amount}
                </span>
                {activeRegistration.paymentService &&
                activeRegistration.paymentService !== "None" ? (
                  <span className="ml-2 text-[13px] text-stone-600">
                    via {activeRegistration.paymentService}
                  </span>
                ) : null}
                {activeRegistration.paymentInfo.transactionId ? (
                  <span className="mt-0.5 block break-all font-mono text-[13px] text-stone-600">
                    {activeRegistration.paymentInfo.transactionId}
                  </span>
                ) : null}
              </Row>
            ) : null}
          </dl>
        ) : null}
      </DetailDialog>
    </div>
  );
};

/** Stable identity so the memos above do not thrash on every render. */
const EMPTY = [];

const Stat = ({ label, value, hint }) => (
  <div className="rounded-[16px] border border-hairline bg-white px-4 py-3">
    <dt className="text-[13px] text-stone-600">{label}</dt>
    <dd className="mt-0.5 text-[22px] font-semibold tabular-nums text-ink">
      {value}
      {hint ? (
        <span className="mt-0.5 block text-[12px] font-normal leading-snug text-stone-500">
          {hint}
        </span>
      ) : null}
    </dd>
  </div>
);

const Row = ({ label, children }) => (
  <div>
    <dt className="text-[13px] font-medium text-stone-600">{label}</dt>
    <dd className="mt-1 text-[15px] leading-relaxed text-ink">{children}</dd>
  </div>
);

export default AdminRegistrations;