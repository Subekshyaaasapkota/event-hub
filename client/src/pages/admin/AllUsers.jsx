// src/pages/admin/AllUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import SegmentedControl from "../../components/common/SegmentedControl";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DetailDialog from "../../components/common/DetailDialog";
import {
  Users,
  Search,
  Trash2,
  Mail,
  Calendar,
  AlertCircle,
  Building,
  Map,
  Info,
  X,
} from "lucide-react";
import useAdmin from "../../hooks/useAdmin";
import { getImageUrl } from "../../utils/imageUrl";

/**
 * Roles come from the User model enum: Student, Club, Admin.
 *
 * Kept in one place because the page derives the same answer three times. It
 * used to derive it twice with slightly different code, and a user with an
 * empty roles array was counted as a student by the filter and by the count but
 * shown by getRoleBadge, which tested includes() on the array without the
 * Array.isArray guard. Anything that reads as Admin wins, so a user who is both
 * a club officer and an admin is never filed as a club.
 */
const roleOf = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  if (roles.includes("Admin")) return "admin";
  if (roles.includes("Club")) return "club";
  return "student";
};

const ROLE_LABEL = { admin: "Admin", club: "Club", student: "Student" };

/**
 * Role chips are tinted rather than the old purple/indigo/emerald on near-white,
 * which put text at roughly 3:1 against its own background. These are all past
 * 4.5:1 at the size used.
 */
const ROLE_STYLE = {
  admin: "border-ink bg-ink text-paper",
  club: "border-stone-300 bg-stone-100 text-stone-800",
  student: "border-stone-200 bg-stone-50 text-stone-700",
};

const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium leading-5 ${ROLE_STYLE[role]}`}
  >
    {ROLE_LABEL[role]}
  </span>
);

/** Shown wherever the record genuinely has no value, rather than inventing one. */
const NO_VALUE = "Not provided";

/** Stable identity for the "no users yet" case, so memos do not thrash. */
const EMPTY = [];

const AdminAllUsers = () => {
  const { users, loading, error, fetchUsers, deleteUser } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // useAdmin already falls back to [] when the slice has no users yet, but that
  // fallback would make a fresh array identity on every render and defeat both
  // memos below, so the empty case is pinned to a module-level constant.
  const list = useMemo(() => users || EMPTY, [users]);

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${user.name || "this account"}`,
      // The server refuses when the account has registrations or still owns
      // events and clubs, and it refuses to remove the last admin. Saying so up
      // front is better than letting someone confirm and then be told no.
      message:
        "This removes the account permanently. It only works if the account has no registrations and does not own events or clubs, and it is refused for the last admin. Anything the account created will be left as it is.",
      onConfirm: async () => {
        try {
          await deleteUser(user._id || user.id);
          toast.success("User removed.");
          // Close the detail sheet too, otherwise it keeps showing a record that
          // no longer exists.
          setSelectedUser(null);
        } catch (err) {
          toast.error(err.message || "Failed to delete user.");
        } finally {
          setConfirmDialog({ isOpen: false });
        }
      },
    });
  };

  const counts = useMemo(
    () => ({
      all: list.length,
      student: list.filter((u) => roleOf(u) === "student").length,
      club: list.filter((u) => roleOf(u) === "club").length,
      admin: list.filter((u) => roleOf(u) === "admin").length,
    }),
    [list],
  );

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return list.filter((user) => {
      if (roleFilter !== "all" && roleOf(user) !== roleFilter) return false;
      if (!query) return true;

      // district is not on the User model. The old search matched on it, so
      // typing a district always returned nothing and looked like the search
      // was broken. Only fields that exist are searched now.
      return [user.name, user.email, user.college].some((field) =>
        field?.toLowerCase().includes(query),
      );
    });
  }, [list, roleFilter, searchTerm]);

  const joinedDate = (value) => {
    if (!value) return NO_VALUE;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return NO_VALUE;
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeUser = selectedUser
    ? list.find((u) => (u._id || u.id) === (selectedUser._id || selectedUser.id)) ||
      selectedUser
    : null;

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          Users
        </h1>
        <p className="mt-1 text-[15px] leading-relaxed text-stone-600">
          Everyone with an account on EventHub.
        </p>

        {error ? (
          <div className="mt-5 flex items-start gap-2.5 rounded-[12px] bg-red-50 px-4 py-3 text-[14px] leading-relaxed text-red-700 ring-1 ring-red-100">
            <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600"
            size={17}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search name, email, or college"
            aria-label="Search users by name, email, or college"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-[12px] border border-hairline bg-white pl-10 pr-3 text-[15px] text-ink outline-none transition-shadow placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-ink/25"
          />
        </div>

        <SegmentedControl
          ariaLabel="Filter users by role"
          className="shrink-0"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "student", label: "Students", count: counts.student },
            { value: "club", label: "Clubs", count: counts.club },
            { value: "admin", label: "Admins", count: counts.admin },
          ]}
        />
      </div>

      {/* Table on wide screens, stacked cards below it. A five-column table
          cannot be read on a phone without horizontal scrolling, and the action
          buttons were in the last column, so they sat off screen. */}
      <div className="overflow-hidden rounded-[16px] border border-hairline bg-white">
        <div className="hidden md:block">
          <table className="w-full text-left">
            <caption className="sr-only">
              Registered users, with role and contact details
            </caption>
            <thead>
              <tr className="border-b border-hairline bg-paper/60">
                {["User", "Contact", "College", "Role", ""].map((h, i) => (
                  <th
                    key={h || i}
                    scope="col"
                    className={`px-5 py-3 text-[13px] font-medium text-stone-600 ${
                      i === 4 ? "w-24 text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-5 py-6">
                        <div className="h-4 w-full max-w-xs animate-pulse rounded bg-hairline/70" />
                      </td>
                    </tr>
                  ))
                : filteredUsers.map((u) => {
                    const id = u._id || u.id;
                    return (
                      <tr key={id} className="transition-colors hover:bg-paper/60">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar user={u} />
                            <div className="min-w-0">
                              <span className="block truncate text-[15px] font-medium text-ink">
                                {u.name || "Unnamed user"}
                              </span>
                              <span className="block truncate font-mono text-[12px] text-stone-600">
                                {id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[14px] text-stone-600">
                          <span className="flex items-center gap-1.5">
                            <Mail size={14} aria-hidden="true" className="shrink-0 text-stone-400" />
                            <span className="truncate">{u.email || NO_VALUE}</span>
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[13px]">
                            <Calendar size={13} aria-hidden="true" className="shrink-0 text-stone-400" />
                            {joinedDate(u.createdAt)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[14px] text-ink">
                          <span className="flex items-center gap-1.5">
                            <Building size={14} aria-hidden="true" className="shrink-0 text-stone-400" />
                            {u.college || NO_VALUE}
                          </span>
                          {u.district ? (
                            <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-stone-600">
                              <Map size={13} aria-hidden="true" className="shrink-0" />
                              {u.district}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-3">
                          <RoleBadge role={roleOf(u)} />
                        </td>
                        <td className="px-5 py-3">
                          {/* Always visible, not on hover. The old row used
                              opacity-0 group-hover:opacity-100, so on touch there
                              was no way to reach either button, and while
                              tabbing through the table focus landed on
                              something invisible. */}
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedUser(u)}
                              className="grid h-9 w-9 place-items-center rounded-[10px] text-stone-600 transition-colors hover:bg-hairline/60 active:bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                            >
                              <Info size={17} aria-hidden="true" />
                              <span className="sr-only">
                                View details for {u.name || "user"}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="grid h-9 w-9 place-items-center rounded-[10px] text-red-700 transition-colors hover:bg-red-50 active:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
                            >
                              <Trash2 size={17} aria-hidden="true" />
                              <span className="sr-only">
                                Delete {u.name || "user"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Phone layout */}
        <ul className="divide-y divide-hairline md:hidden">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="px-4 py-4">
                  <div className="h-10 w-2/3 animate-pulse rounded bg-hairline/70" />
                </li>
              ))
            : filteredUsers.map((u) => (
                <li key={u._id || u.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Avatar user={u} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-[15px] font-medium text-ink">
                          {u.name || "Unnamed user"}
                        </span>
                        <RoleBadge role={roleOf(u)} />
                      </div>
                      <span className="mt-0.5 block truncate text-[14px] text-stone-600">
                        {u.email || NO_VALUE}
                      </span>
                      {u.college ? (
                        <span className="mt-0.5 block truncate text-[13px] text-stone-600">
                          {u.college}
                        </span>
                      ) : null}
                      <span className="mt-0.5 block text-[13px] text-stone-600">
                        Joined {joinedDate(u.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-hairline text-[14px] font-medium text-ink transition-colors active:bg-hairline/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                    >
                      <Info size={16} aria-hidden="true" />
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u)}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-red-200 text-[14px] font-medium text-red-600 transition-colors active:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
        </ul>

        {!loading && filteredUsers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users
              className="mx-auto mb-4 text-stone-300"
              size={44}
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <p className="text-[15px] text-stone-600">
              {list.length === 0
                ? "No users have registered yet."
                : "No users match this search."}
            </p>
          </div>
        ) : null}
      </div>

      <DetailDialog
        isOpen={Boolean(activeUser)}
        onClose={() => setSelectedUser(null)}
        title={activeUser?.name || "Unnamed user"}
        subtitle={activeUser?.email || NO_VALUE}
        header={<Avatar user={activeUser} size="lg" />}
        footer={
          activeUser ? (
            <button
              type="button"
              onClick={() => handleDeleteUser(activeUser)}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[12px] bg-red-600 text-[15px] font-medium text-white transition-colors hover:bg-red-700 active:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <Trash2 size={17} aria-hidden="true" />
              Delete account
            </button>
          ) : null
        }
      >
        {activeUser ? (
          /* A description list, because these are label/value pairs and screen
             readers announce each term together with its definition. */
          <dl className="space-y-5">
            <DetailRow label="Role">
              <RoleBadge role={roleOf(activeUser)} />
            </DetailRow>

            <DetailRow label="Email">
              {activeUser.email || NO_VALUE}
            </DetailRow>

            <DetailRow label="College">
              {activeUser.college || NO_VALUE}
            </DetailRow>

            <DetailRow label="District">
              {activeUser.district || NO_VALUE}
            </DetailRow>

            <DetailRow label="Joined">
              {joinedDate(activeUser.createdAt)}
            </DetailRow>

            {/* "GEN-NODE" was invented. If the record has no id there is
                nothing honest to show, so say so. */}
            <DetailRow label="Account ID">
              <span className="font-mono text-[13px]">
                {activeUser._id || activeUser.id || NO_VALUE}
              </span>
            </DetailRow>

            <DetailRow label="About">
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-stone-600">
                {activeUser.bio || "No biography provided."}
              </p>
            </DetailRow>

            <DetailRow label="Interested in">
              {activeUser.interestedSkills?.length ? (
                <ul className="flex flex-wrap gap-1.5">
                  {activeUser.interestedSkills.map((skill, i) => (
                    <li
                      key={`${skill}-${i}`}
                      className="rounded-full bg-hairline/70 px-2.5 py-1 text-[13px] text-ink"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[14px] text-stone-600">
                  Nothing listed yet.
                </span>
              )}
            </DetailRow>

            {/* The old detail sheet had no way to remove a user from inside it,
                so an admin had to close it, then find the row again. */}
            {activeUser.club?.name ? (
              <DetailRow label="Club">
                {activeUser.club.name}
              </DetailRow>
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
        confirmText="Delete user"
        type="danger"
      />
    </div>
  );
};

const Avatar = ({ user, size = "md" }) => {
  const initials = user?.name?.trim()?.charAt(0).toUpperCase() || "?";
  const dimensions = size === "lg" ? "h-14 w-14 text-[19px]" : "h-9 w-9 text-[15px]";

  if (!user?.profilePicture) {
    return (
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-stone-200 font-medium text-stone-700 ${dimensions}`}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={getImageUrl(user.profilePicture)}
      alt=""
      className={`shrink-0 rounded-full object-cover ring-1 ring-hairline ${dimensions}`}
    />
  );
};

const DetailRow = ({ label, children }) => (
  <div>
    <dt className="text-[13px] font-medium text-stone-600">{label}</dt>
    <dd className="mt-1 text-[15px] leading-relaxed text-ink">{children}</dd>
  </div>
);

export default AdminAllUsers;