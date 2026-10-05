// src/pages/admin/AllClubs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DetailDialog from "../../components/common/DetailDialog";
import {
  Building2,
  MapPin,
  Mail,
  Globe,
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
} from "lucide-react";
import useAdmin from "../../hooks/useAdmin";

/**
 * Club status comes from the RegisterClub enum: Pending, Approved, Rejected.
 *
 * Derived once, case-insensitively. The old code compared `club.status ===
 * "Pending"` in the filter and in three separate places in the card, and
 * compared `.toLowerCase()` in the badge. A record whose status was stored with
 * any other casing therefore counted as pending in the filter, rendered as a
 * rejected card border, and showed no Approve button at all, because the
 * button was behind yet another exact-case check.
 *
 * Anything unrecognised is treated as pending, which is the safe direction: it
 * stays visible in the review queue instead of disappearing from it.
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
 * Social links, paired with the icon per network.
 *
 * Each was a bare lucide icon in a link before, so a screen reader announced
 * six identical "link" elements with nothing to distinguish them. The visible
 * text is hidden and the network is named instead, and each opens in a new tab
 * so the admin does not lose their place in the list.
 */
const SOCIALS = [
  { key: "facebook", Icon: Facebook, label: "Facebook" },
  { key: "instagram", Icon: Instagram, label: "Instagram" },
  { key: "twitter", Icon: Twitter, label: "Twitter" },
  { key: "linkedin", Icon: Linkedin, label: "LinkedIn" },
  { key: "github", Icon: Github, label: "GitHub" },
  { key: "youtube", Icon: Youtube, label: "YouTube" },
];

const NO_VALUE = "Not provided";

const AdminAllClubs = () => {
  const { adminData, fetchClubs, approveClub, rejectClub } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClub, setSelectedClub] = useState(null);
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

  const handleApproveClub = (club) => {
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

  const handleRejectClub = (club) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reject ${club.name || "this club"}`,
      //  Says the owner sees this and can update their application to reapply,
      //  which is what the code does: updateClubProfile edits the existing club
      //  rather than creating a second one. No email is sent on rejection, so the
      //  old copy claiming the user "will be notified" was not true.
      message:
        "The club will not get club features. The owner can see this and update their application to try again.",
      //  Was "warning", which ConfirmDialog does not recognise. It only branches
      //  on "danger", so a rejection that denies someone access looked identical
      //  to an approval that grants it.
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

      return [club.name, club.email, club.district].some((field) =>
        field?.toLowerCase().includes(query),
      );
    });
  }, [clubs, statusFilter, searchTerm]);

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

  // Re-resolved from the list so the sheet never shows a stale record after an
  // approve or reject changes its status.
  const activeClub = selectedClub
    ? clubs.find((c) => (c._id || c.id) === (selectedClub._id || selectedClub.id)) ||
      selectedClub
    : null;

  const filters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          Clubs
        </h1>
        <p className="mt-1 text-[15px] leading-relaxed text-stone-600">
          Every club that has applied, and whether it has been approved.
        </p>

        {adminData?.error ? (
          <div className="mt-5 flex items-start gap-2.5 rounded-[12px] bg-red-50 px-4 py-3 text-[14px] leading-relaxed text-red-700 ring-1 ring-red-100">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <span>{adminData.error}</span>
          </div>
        ) : null}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            size={17}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search name, email, or district"
            aria-label="Search clubs by name, email, or district"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-[12px] border border-hairline bg-white pl-10 pr-3 text-[15px] text-ink outline-none transition-shadow placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-ink/25"
          />
        </div>

        {/*  A radiogroup rather than four buttons, so the label and the count are
            announced as one control. */}
        <div
          role="radiogroup"
          aria-label="Filter clubs by status"
          className="flex shrink-0 overflow-hidden rounded-[12px] border border-hairline bg-white"
        >
          {filters.map((status) => {
            const active = statusFilter === status.value;
            return (
              <button
                key={status.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setStatusFilter(status.value)}
                className={`min-h-[44px] px-3 text-[14px] transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/40 ${
                  active
                    ? "bg-ink font-medium text-paper"
                    : "text-stone-600 hover:bg-hairline/50"
                }`}
              >
                {status.label}
                <span
                  className={`ml-1.5 text-[13px] tabular-nums ${
                    active ? "text-paper/75" : "text-stone-500"
                  }`}
                >
                  {counts[status.value]}
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
              Clear filters
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
                    <dl className="mt-1 space-y-0.5 text-[13px] text-stone-600">
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
                  /* Keeps the footer row in the same place whether or not a
                     description was supplied, so the cards stay aligned. */
                  <div aria-hidden="true" className="mb-4" />
                )}

                {club.website ? (
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 self-start text-[14px] text-ink underline underline-offset-4 transition-colors hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                  >
                    <Globe size={14} aria-hidden="true" />
                    Website
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : null}

                {links.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1">
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

                {/*  mt-auto keeps the action row pinned to the bottom across cards of
                    unequal description length. */}
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
                    {status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveClub(club)}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-ink px-3 text-[14px] font-medium text-paper transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                          <CheckCircle size={15} aria-hidden="true" />
                          Approve
                          <span className="sr-only"> {club.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectClub(club)}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-red-200 px-3 text-[14px] font-medium text-red-700 transition-colors hover:bg-red-50 active:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
                        >
                          <XCircle size={15} aria-hidden="true" />
                          Reject
                          <span className="sr-only"> {club.name}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedClub(club)}
                        className="inline-flex min-h-[44px] items-center rounded-[10px] border border-hairline px-3 text-[14px] font-medium text-ink transition-colors hover:bg-hairline/60 active:bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                      >
                        Details
                        <span className="sr-only"> for {club.name}</span>
                      </button>
                    )}
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
        subtitle={activeClub?.district || NO_VALUE}
        header={<ClubMark club={activeClub} size="lg" />}
        footer={
          activeClub ? (
            statusOf(activeClub) === "pending" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleApproveClub(activeClub)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-ink text-[15px] font-medium text-paper transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                >
                  <CheckCircle size={17} aria-hidden="true" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectClub(activeClub)}
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
          /* A description list, because these are label/value pairs and
             screen readers announce the term with its definition. */
          <dl className="space-y-5">
            <div>
              <dt className="text-[13px] font-medium text-stone-600">Status</dt>
              <dd className="mt-1">
                <StatusChip status={statusOf(activeClub)} />
              </dd>
            </div>

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

            <Row label="District">{activeClub.district || NO_VALUE}</Row>

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

            {activeClub.website || SOCIALS.some(({ key }) => activeClub[key]) ? (
              <Row label="Links">
                <ul className="space-y-1.5">
                  {activeClub.website ? (
                    <li>
                      <a
                        href={activeClub.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                      >
                        <Globe size={15} aria-hidden="true" />
                        Website
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ) : null}
                  {SOCIALS.filter(({ key }) => activeClub[key]).map(
                    ({ key, label }) => (
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
                    ),
                  )}
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

/** Stable identity so the memos above do not thrash on every render. */
const EMPTY = [];

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

export default AdminAllClubs;