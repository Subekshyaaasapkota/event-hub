import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ROLES from "../../routes/roles.js";
import { LayoutDashboard, LogOut, User, Building2, Shield, ChevronDown } from "lucide-react";
import { getImageUrl } from "../../utils/imageUrl";
import MobileTabBar from "./MobileTabBar";
import ConfirmDialog from "./ConfirmDialog";

const PRIMARY_LINKS = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// Tailwind cannot see class names that are built at runtime, so every possible
// class string has to be written out in full here.
//
// These were remapped off the old indigo/purple palette and each text colour
// moved up a shade. red-600 on red-50 and indigo-600 on indigo-50 were both
// around 4.5:1 at best, and the role label is the one piece of text a user
// needs to be certain about.
const DASHBOARD_THEMES = {
  admin: {
    text: "text-red-800",
    bg: "bg-red-50",
    hoverBg: "hover:bg-red-100",
    border: "border-red-200",
    hoverText: "hover:text-red-900",
  },
  pending: {
    text: "text-amber-900",
    bg: "bg-amber-50",
    hoverBg: "hover:bg-amber-100",
    border: "border-amber-300",
    hoverText: "hover:text-amber-950",
  },
  club: {
    text: "text-ink",
    bg: "bg-stone-100",
    hoverBg: "hover:bg-stone-200",
    border: "border-stone-300",
    hoverText: "hover:text-ink",
  },
  student: {
    text: "text-ink",
    bg: "bg-stone-50",
    hoverBg: "hover:bg-stone-100",
    border: "border-stone-300",
    hoverText: "hover:text-ink",
  },
  register: {
    text: "text-emerald-800",
    bg: "bg-emerald-50",
    hoverBg: "hover:bg-emerald-100",
    border: "border-emerald-200",
    hoverText: "hover:text-emerald-900",
  },
};

const NavLink = ({ to, children, pathname }) => {
  const active = pathname === to;
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`underline-grow py-1 text-[15px] font-medium ${
        active ? "text-ink" : "text-stone-600 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  // Remembers which URL failed rather than a plain boolean. Comparing the failed
  // URL against the current one means a new avatar is tried again automatically,
  // with no effect resetting state on account change.
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState(null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape closes the menu and returns focus to the trigger. Without the second
  // half, dismissing with the keyboard drops focus onto <body> and a keyboard
  // user has to tab all the way back to the top of the page to carry on.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // A different account's avatar URL should not inherit the previous failure.
  const avatarUrl = user?.profilePicture ? getImageUrl(user.profilePicture) : null;

  // Centralized Role Check
  const userRoles = user?.roles || [];

  const isAdmin = userRoles.includes(ROLES.ADMIN);
  const isClub = userRoles.includes(ROLES.CLUB);
  const isStudent = userRoles.includes(ROLES.STUDENT) || userRoles.length === 0;

  // Check if club registration is pending
  const isClubPending =
    user?.club && !user.club.isVerified && user.club.status === "Pending";
  const isClubApproved = user?.club && user.club.isVerified;

  // Reflects the account's actual standing. A student with a club application
  // in review is not just a "Student", and saying so was the confusing part.
  const roleLabel = isAdmin
    ? "Administrator"
    : isClubApproved
      ? "Club Member"
      : isClubPending
        ? "Club Application Pending"
        : user?.club?.status === "Rejected"
          ? "Club Application Rejected"
          : "Student";

  const getDashboardLink = () => {
    if (isAdmin) return "/admin/dashboard";
    if (isClubApproved) return "/club/dashboard";
    if (isClubPending) return "/club/verification";
    if (isStudent) return "/dashboard";
    return "/";
  };

  const getDashboardIcon = () => {
    if (isAdmin) return <Shield size={16} aria-hidden="true" />;
    if (isClub) return <Building2 size={16} aria-hidden="true" />;
    if (isStudent) return null;
    return <LayoutDashboard size={16} aria-hidden="true" />;
  };

  const getDashboardText = () => {
    if (isAdmin) return "Admin Panel";
    if (isClubPending) return "Verification Pending";
    if (isClubApproved) return "Club Portal";
    if (isStudent) return user.name;
    return "Dashboard";
  };

  const dashboardTheme = isAdmin
    ? DASHBOARD_THEMES.admin
    : isClubPending
      ? DASHBOARD_THEMES.pending
      : isClubApproved
        ? DASHBOARD_THEMES.club
        : isStudent
          ? DASHBOARD_THEMES.student
          : DASHBOARD_THEMES.register;

  // Initials fallback. Previously the <img> and the initial span each toggled
  // the other's display through nextSibling.style, which broke silently if
  // anything ever appeared between them. State does not have that failure mode.
  const showAvatarImage = Boolean(avatarUrl) && brokenAvatarUrl !== avatarUrl;
  const initials = (user?.name || "?").trim().charAt(0).toUpperCase();

  // One shell, so the loading state cannot drift away from the real header.
  const shell = (children) => (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/eventhub-logo.svg"
            alt=""
            width="28"
            height="28"
            className="h-7 w-7 shrink-0"
          />
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            EventHub
          </span>
        </Link>
        {children}
      </div>
    </nav>
  );

  // Don't render the account area while checking auth, but keep the header
  // height stable so the page below does not jump when auth resolves.
  if (loading) {
    return shell(
      <div
        className="h-11 w-11 animate-pulse rounded-full bg-stone-200"
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      {shell(
        <>
          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            {PRIMARY_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} pathname={location.pathname}>
                {link.label}
              </NavLink>
            ))}

            {!user ? (
              <div className="flex items-center gap-4">
                <NavLink to="/login" pathname={location.pathname}>
                  Login
                </NavLink>
                <Link
                  to="/signup"
                  className="press inline-flex min-h-[44px] items-center rounded-xl bg-ink px-5 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-stone-800"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                {/* --- ROLE BASED PORTALS --- */}
                <Link
                  to={getDashboardLink()}
                  className={`press flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors duration-200 ${dashboardTheme.text} ${dashboardTheme.bg} ${dashboardTheme.border} ${dashboardTheme.hoverBg} ${dashboardTheme.hoverText}`}
                >
                  {getDashboardIcon()}
                  <span className="max-w-[10rem] truncate">{getDashboardText()}</span>
                </Link>

                {/* Club Registration Button.
                    Shown to any signed-in user who has neither an approved club nor an
                    application still in review. This used to require !isStudent, which
                    meant the button never appeared, because every new account is a Student
                    and Students are exactly who needs to apply. */}
                {!isAdmin && !isClubPending && !isClubApproved && (
                  <Link
                    to="/club/register"
                    className={`press flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors duration-200 ${DASHBOARD_THEMES.register.text} ${DASHBOARD_THEMES.register.bg} ${DASHBOARD_THEMES.register.border} ${DASHBOARD_THEMES.register.hoverBg} ${DASHBOARD_THEMES.register.hoverText}`}
                  >
                    <Building2 size={16} aria-hidden="true" />
                    <span>Register Club</span>
                  </Link>
                )}

                {/* User Avatar & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  {/*
                    The chevron badge is what tells you the avatar opens a menu.
                    Without it the control reads as a photograph, which is why
                    the menu was hard to find. It sits on a paper-coloured ring
                    so it stays legible against a dark photo.
                  */}
                  <span className="relative flex h-11 w-11 shrink-0">
                    <button
                      ref={triggerRef}
                      type="button"
                      onClick={() => setOpen((v) => !v)}
                      aria-controls="account-menu"
                      aria-expanded={open}
                      aria-label={`Account menu for ${user.name}`}
                      className="press flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-hairline bg-stone-100 text-ink transition-colors duration-200 hover:bg-stone-200"
                    >
                      {showAvatarImage ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={() => setBrokenAvatarUrl(avatarUrl)}
                        />
                      ) : (
                        <span aria-hidden="true" className="text-base font-semibold">
                          {initials}
                        </span>
                      )}
                    </button>

                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-paper bg-ink text-paper"
                    >
                      <ChevronDown size={10} strokeWidth={3} />
                    </span>
                  </span>

                  {open && (
                    <div
id="account-menu"
                    aria-label="Account"
                    className="absolute right-0 z-[60] mt-3 w-60 origin-top-right overflow-hidden rounded-2xl border border-hairline bg-white py-2 shadow-2xl motion-safe:animate-[rise_180ms_cubic-bezier(0.22,1,0.36,1)_both]"
                    >
                      <div className="border-b border-hairline bg-stone-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                          {roleLabel}
                        </p>
                        <p className="truncate text-sm font-semibold text-ink">
                          {user.name}
                        </p>
                        {user.club && (
                          <p className="mt-1 text-xs font-medium text-stone-600">
                            {user.club.name}
                            {!user.club.isVerified && (
                              <span
                                className={`ml-1 ${
                                  user.club.status === "Rejected"
                                    ? "text-red-800"
                                    : "text-amber-900"
                                }`}
                              >
                                ({user.club.status === "Rejected" ? "Rejected" : "Pending"})
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex min-h-[44px] items-center gap-2.5 px-4 text-sm text-stone-700 transition-colors duration-200 hover:bg-stone-100 hover:text-ink"
                      >
                        <User size={16} aria-hidden="true" /> Profile Settings
                      </Link>

                      {/* Show club registration link in dropdown if not registered and not a student */}
                      {!user.club && !isAdmin && !isStudent && (
                        <Link
                          to="/club/register"
                          onClick={() => setOpen(false)}
                          className={`flex min-h-[44px] items-center gap-2.5 px-4 text-sm transition-colors duration-200 ${DASHBOARD_THEMES.register.text} hover:bg-emerald-50`}
                        >
                          <Building2 size={16} aria-hidden="true" /> Register Organization
                        </Link>
                      )}

                      {/* Show verification status link if pending */}
                      {isClubPending && (
                        <Link
                          to="/club/verification"
                          onClick={() => setOpen(false)}
                          className="flex min-h-[44px] items-center gap-2.5 px-4 text-sm text-amber-900 transition-colors duration-200 hover:bg-amber-50"
                        >
                          <LayoutDashboard size={16} aria-hidden="true" />
                          Check Verification Status
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingLogout(true);
                          setOpen(false);
                        }}
                        className="flex min-h-[44px] w-full items-center gap-2.5 px-4 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50"
                      >
                        <LogOut size={16} aria-hidden="true" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/*
        The tab bar has to sit OUTSIDE the <nav>. The nav is fixed and carries
        backdrop-blur-md, and a backdrop-filter on an ancestor turns it into the
        containing block for position: fixed descendants. Nested inside, the
        bar's bottom-0 resolved against the 64px header instead of the viewport,
        which pinned it to the top of the page.
      */}
      <MobileTabBar />

      <ConfirmDialog
        isOpen={confirmingLogout}
        onClose={() => setConfirmingLogout(false)}
        onConfirm={logout}
        type="danger"
        title="Sign out?"
        message="You will need to sign in again to see your registrations and profile."
        confirmText="Sign out"
        cancelText="Cancel"
      />
    </>
  );
};

export default Navbar;
