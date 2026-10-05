// src/components/admin/ClubDirectory.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../common/ConfirmDialog";
import DetailDialog from "../common/DetailDialog";
import {
  Building2,
  MapPin,
  Mail,
  Globe,
  Phone,
  Search,
  XCircle,
  CheckCircle,
  AlertCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  Calendar,
  RefreshCw,
} from "lucide-react";
import useAdmin from "../../hooks/useAdmin";

/**
 * The club list, shared by the Clubs page and the Club verification queue.
 *
 * These were two pages with two copies of the same fetch, the same filters, the
 * same status derivation and the same approve and reject dialogs. They drifted:
 * one page compared status case-insensitively and the other did not, so a record
 * with unexpected casing was filtered as pending on one page and rendered as
 * rejected on the other. Duplicated logic that has already drifted once is worth
 * collapsing.
 *
 * They remain two routes because they answer different questions. Clubs is
 * "show me everything", verification is "what is waiting for me". That is a
 * default filter and a heading, not a second implementation.
 *
 *  defaultFilter does the second part, so /admin/club/verification opens on
 *  Pending and /admin/clubs opens on All.
 */

/**
 * Club status comes from the RegisterClub enum: Pending, Approved, Rejected.
 *
 * Derived once, case-insensitively, and unknown values are treated as pending.
 * That direction matters: pending keeps a record in the review queue where
 * somebody will look at it, whereas defaulting an unknown value to rejected
 * hides it.
 */
const statusOf = (club) => {
  const status = club?.status?.toLowerCase();
  return status === "approved" || status === "rejected" ? status : "pending";
};

const STATUS_META = {
  pending: {
    label: "Pending",
    chip: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: AlertCircle,
  },
  approved: {
    label: "Approved",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    chip: "border-red-200 bg-red-50 text-red-800",
    Icon: XCircle,
  },
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const StatusChip = ({ status }) => {
  const { label, chip, Icon } = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium leading-5 ${chip}`}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
};

/**
 * The category enum, labelled. Returns the value unchanged for anything
 * unrecognised rather than pretending it is "Other", which would misdescribe a
 * club that was actually categorised in some way this build does not know.
 */
const CATEGORY_LABEL = {
  college_club: "College club",
  national_org: "National organisation",
  international_org: "International organisation",
  niche_community: "Niche community",
  other: "Other",
};

const categoryLabel = (value) =>
  value ? CATEGORY_LABEL[value] || value : "Not specified";

/** Network icons paired with their name, so a link is not an unlabelled icon. */
const SOCIALS = [
  { key: "facebook", Icon: Facebook, label: "Facebook" },
  { key: "instagram", Icon: Instagram, label: "Instagram" },
  { key: "twitter", Icon: Twitter, label: "Twitter" },
  { key: "linkedin", Icon: Linkedin, label: "LinkedIn" },
  { key: "github", Icon: Github, label: "GitHub" },
  { key: "youtube", Icon: Youtube, label: "YouTube" },
];

const NO_VALUE = "Not provided";

/** Stable identity so the memos below do not thrash on every render. */
const EMPTY = [];

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

const ClubDirectory = ({
  title,
  subtitle,
  defaultFilter = "all",
  showRefresh = false,
}) => {
  const { adminData, fetchClubs, approveClub, rejectClub } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(defaultFilter);
  const [selectedClub, setSelectedClub] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "default",
    onConfirm: null,
  });

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const clubs = useMemo(() => adminData?.clubs || EMPTY, [adminData?.clubs]);
  const loading = Boolean(adminData?.loading);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchClubs();
    } catch {
      //  fetchClubs rethrows, and the slice carries the message, which is
      //  already rendered below. Swallowing here just ends the spinner.
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = (club) => {
    setConfirmDialog({
      isOpen: true,
      title: `Approve ${club.name || "this club"}`,
      message:
        "The club gets its club features and the owner is emailed. They can start hosting events once approved.",
      type: "default",
      onConfirm: async () => {
        try {
          await approveClub(club._id || club.id);
          toast.success("Club approved.");
        } catch (error) {
          toast.error(error.message || "Failed to approve club.");
        } finally {
          setConfirmDialog({ isOpen: false });
        }
      },
    });
  };

  const handleReject = (club) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reject ${club.name || "this club"}`,
      //  No email is sent on rejection, so the old copy claiming the user "will
      //  be notified" was not true either.
      //
      //  Reapplying is a fresh submission, not an edit: clubService.applyForClub
      //  deletes a Rejected club and creates a new Pending one, and
      //  updateClubProfile only ever touches editable fields on a club that is
      //  already approved, leaving status alone. So this said the owner could
      //  "update their application", naming a mechanism that cannot requeue
      //  anything. The application form at /club/register is the real way back in.
      message:
        "The club will not get club features. The owner can submit the application again from the club registration form.",
      //  Was "warning", which ConfirmDialog does not recognise. It only branches
      //  on "danger", so a rejection that denies access looked identical to an
      //  approval that grants it.
      type: "danger",
      onConfirm: async () => {
        try {
          await rejectClub(club._id || club.id);
          toast.success("Club rejected.");
        } catch (error) {
          toast.error(error.message || "Failed to reject club.");
        } finally {
          setConfirmDialog({ isOpen: false });
        }
      },
    });
  };

  const counts = useMemo(
    () => ({
      all: clubs.length,
      pending: clubs.filter((c) => statusOf(c) === "pending").length,
      approved: clubs.filter((c) => statusOf(c) === "approved").length,
      rejected: clubs.filter((c) => statusOf(c) === "rejected").length,
    }),
    [clubs],
  );

  const filteredClubs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return clubs.filter((club) => {
      if (statusFilter !== "all" && statusOf(club) !== statusFilter) {
        return false;
      }
      if (!query) return true;

      return [club.name, club.email, club.district, club.contactPerson].some(
        (field) => field?.toLowerCase().includes(query),
      );
    });
  }, [clubs, statusFilter, searchTerm]);

  //  Re-resolved from the list, so the sheet never shows a stale status after an
  //  approve or reject changes it.
  const activeClub = selectedClub
    ? clubs.find(
        (c) => (c._id || c.id) === (selectedClub._id || selectedClub.id),
      ) || selectedClub
    : null;

  return (
    <div className="pb-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-stone-600">
            {subtitle}
          </p>
        </div>

        {showRefresh ? (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 self-start rounded-[12px] border border-hairline bg-white px-3 text-[14px] font-medium text-ink transition-colors hover:bg-hairline/60 active:bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              aria-hidden="true"
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        ) : null}
      </div>

      {adminData?.error ? (
        <div className="mb-5 flex items-start gap-2.5 rounded-[12px] bg-red-50 px-4 py-3 text-[14px] leading-relaxed text-red-700 ring-1 ring-red-100">
          <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{adminData.error}</span>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            size={17}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search name, email, district, or contact"
            aria-label="Search clubs by name, email, district, or contact person"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-[12px] border border-hairline bg-white pl-10 pr-3 text-[15px] text-ink outline-none transition-shadow placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-ink/25"
          />
        </div>

        {/*  A radiogroup rather than four buttons, so the label and the count
            are announced as one control. */}
        <div
          role="radiogroup"
          aria-label="Filter clubs by status"
          className="flex shrink-0 overflow-hidden rounded-[12px] border border-hairline bg-white"
        >
          {FILTERS.map((filter) => {
            const active = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setStatusFilter(filter.value)}
                className={`min-h-[44px] px-3 text-[14px] transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/40 ${
                  active
                    ? "bg-ink font-medium text-paper"
                    : "text-stone-600 hover:bg-hairline/50"
                }`}
              >
                {filter.label}
                <span
                  className={`ml-1.5 text-[13px] tabular-nums ${
                    active ? "text-paper/75" : "text-stone-500"
                  }`}
                >
                  {counts[filter.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-[16px] border border-hairline bg-white"
            />
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="rounded-[16px] border border-hairline bg-white px-6 py-16 text-center">
          <Building2
            className="mx-auto mb-4 text-stone-300"
            size={44}
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <p className="text-[15px] text-stone-600">
            {clubs.length === 0
              ? "No clubs have applied yet."
              : statusFilter === "pending" && counts.pending === 0
                ? "Nothing is waiting for review."
                : "No clubs match this search."}
          </p>
          {clubs.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="mt-4 min-h-[44px] rounded-[10px] px-3 text-[15px] font-medium text-ink underline underline-offset-4 transition-colors hover:bg-hairline/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
            >
              Show all clubs
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredClubs.map((club) => {
            const status = statusOf(club);
            const id = club._id || club.id;
            const links = SOCIALS.filter(({ key }) => club[key]);

            return (
              <article
                key={id}
                className={`flex flex-col rounded-[16px] border bg-white p-5 ${
                  status === "pending"
                    ? "border-amber-200"
                    : status === "approved"
                      ? "border-emerald-200"
                      : "border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <ClubMark club={club} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[17px] font-semibold text-ink">
                      {club.name || "Unnamed club"}
                    </h2>
                    <p className="mt-0.5 truncate text-[13px] text-stone-600">
                      {categoryLabel(club.category)}
                    </p>
                    <dl className="mt-1.5 space-y-0.5 text-[13px] text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <dt className="sr-only">District</dt>
                        <MapPin size={13} aria-hidden="true" className="shrink-0" />
                        <dd className="truncate">{club.district || NO_VALUE}</dd>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <dt className="sr-only">Email</dt>
                        <Mail size={13} aria-hidden="true" className="shrink-0" />
                        <dd className="truncate">{club.email || NO_VALUE}</dd>
                      </div>
                    </dl>
                  </div>
                  <StatusChip status={status} />
                </div>

                {club.description ? (
                  <p className="mt-3 mb-4 line-clamp-2 text-[14px] leading-relaxed text-stone-600">
                    {club.description}
                  </p>
                ) : (
                  /* Holds the footer row at the same height whether or not a
                     description was supplied, so the cards stay aligned. */
                  <div aria-hidden="true" className="mb-4" />
                )}

                {links.length > 0 ? (
                  <ul className="mb-4 flex flex-wrap gap-1">
                    {links.map(({ key, Icon, label }) => (
                      <li key={key}>
                        <a
                          href={club[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid h-9 w-9 place-items-center rounded-[10px] text-stone-600 transition-colors hover:bg-hairline/60 active:bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                        >
                          <Icon size={16} aria-hidden="true" />
                          <span className="sr-only">
                            {club.name || "Club"} on {label}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/*  mt-auto pins this row to the bottom across cards of unequal
                    description length. */}
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-4">
                  <div className="min-w-0 text-[13px] text-stone-500">
                    <p className="truncate">
                      Applied by{" "}
                      <span className="text-stone-700">
                        {club.createdBy?.name || "unknown"}
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5">
                      <Calendar size={12} aria-hidden="true" />
                      {formatDate(club.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {/*  Details is always offered, including on pending clubs
                        where approve and reject sit next to it. The old cards
                        were a bare div with an onClick, so there was no
                        keyboard route to any of it. */}
                    <button
                      type="button"
                      onClick={() => setSelectedClub(club)}
                      className="inline-flex min-h-[44px] items-center rounded-[10px] border border-hairline px-3 text-[14px] font-medium text-ink transition-colors hover:bg-hairline/60 active:bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                    >
                      Details
                      <span className="sr-only"> for {club.name}</span>
                    </button>

                    {status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(club)}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-ink px-3 text-[14px] font-medium text-paper transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                        >
                          <CheckCircle size={15} aria-hidden="true" />
                          Approve
                          <span className="sr-only"> {club.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(club)}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-red-200 px-3 text-[14px] font-medium text-red-700 transition-colors hover:bg-red-50 active:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
                        >
                          <XCircle size={15} aria-hidden="true" />
                          Reject
                          <span className="sr-only"> {club.name}</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <DetailDialog
        isOpen={Boolean(activeClub)}
        onClose={() => setSelectedClub(null)}
        title={activeClub?.name || "Unnamed club"}
        subtitle={categoryLabel(activeClub?.category)}
        header={<ClubMark club={activeClub} size="lg" />}
        footer={
          activeClub ? (
            statusOf(activeClub) === "pending" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleApprove(activeClub)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-ink text-[15px] font-medium text-paper transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                >
                  <CheckCircle size={17} aria-hidden="true" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(activeClub)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-red-200 text-[15px] font-medium text-red-700 transition-colors hover:bg-red-50 active:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
                >
                  <XCircle size={17} aria-hidden="true" />
                  Reject
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedClub(null)}
                className="min-h-[44px] w-full rounded-[12px] bg-ink text-[15px] font-medium text-paper transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
              >
                Done
              </button>
            )
          ) : null
        }
      >
        {activeClub ? (
          /* A description list, so each label is announced with its value. */
          <dl className="space-y-5">
            <div>
              <dt className="text-[13px] font-medium text-stone-600">Status</dt>
              <dd className="mt-1">
                <StatusChip status={statusOf(activeClub)} />
              </dd>
            </div>

            <Row label="Category">
              {categoryLabel(activeClub.category)}
            </Row>

            <Row label="Contact person">
              {activeClub.contactPerson || NO_VALUE}
            </Row>

            <Row label="Email">
              {activeClub.email ? (
                <a
                  href={`mailto:${activeClub.email}`}
                  className="break-all underline underline-offset-4 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                >
                  {activeClub.email}
                </a>
              ) : (
                NO_VALUE
              )}
            </Row>

            <Row label="Phone">
              {activeClub.phone ? (
                <a
                  href={`tel:${activeClub.phone.replace(/\s+/g, "")}`}
                  className="underline underline-offset-4 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                >
                  {activeClub.phone}
                </a>
              ) : (
                NO_VALUE
              )}
            </Row>

            <Row label="District">{activeClub.district || NO_VALUE}</Row>

            <Row label="Website">
              {activeClub.website ? (
                <a
                  href={activeClub.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                >
                  <Globe size={15} aria-hidden="true" />
                  Visit website
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                NO_VALUE
              )}
            </Row>

            <Row label="Established">
              {activeClub.establishedYear || NO_VALUE}
            </Row>

            <Row label="Applied by">
              {activeClub.createdBy?.name || "unknown"}
              {activeClub.createdBy?.email ? (
                <span className="mt-0.5 block break-all text-[13px] text-stone-600">
                  {activeClub.createdBy.email}
                </span>
              ) : null}
            </Row>

            <Row label="Applied">{formatDate(activeClub.createdAt)}</Row>

            <Row label="About">
              <p className="whitespace-pre-wrap leading-relaxed text-stone-600">
                {activeClub.description || "No description provided."}
              </p>
            </Row>

            {links(activeClub).length > 0 ? (
              <Row label="Social">
                <ul className="space-y-1.5">
                  {links(activeClub).map(({ key, label }) => (
                    <li key={key}>
                      <a
                        href={activeClub[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                      >
                        {label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Row>
            ) : null}
          </dl>
        ) : null}
      </DetailDialog>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
};

const links = (club) => SOCIALS.filter(({ key }) => club?.[key]);

const ClubMark = ({ club, size = "md" }) => {
  const dimensions = size === "lg" ? "h-14 w-14" : "h-12 w-12";
  const iconSize = size === "lg" ? 24 : 20;

  if (!club?.logo) {
    return (
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center overflow-hidden rounded-[12px] bg-stone-100 text-stone-500 ${dimensions}`}
      >
        <Building2 size={iconSize} />
      </span>
    );
  }

  return (
    <img
      src={club.logo}
      alt=""
      className={`shrink-0 rounded-[12px] object-cover ring-1 ring-hairline ${dimensions}`}
    />
  );
};

const Row = ({ label, children }) => (
  <div>
    <dt className="text-[13px] font-medium text-stone-600">{label}</dt>
    <dd className="mt-1 text-[15px] leading-relaxed text-ink">{children}</dd>
  </div>
);

export default ClubDirectory;