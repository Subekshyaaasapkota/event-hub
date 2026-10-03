import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Compass,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  User,
  X,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import ROLES from "../../routes/roles";
import { getImageUrl } from "../../utils/imageUrl";

/*
 * Mobile tab bar.
 *
 * Replaces the hamburger, which meant two taps and a full dropdown panel before
 * you could reach anything, and hid the two most common destinations behind a
 * menu icon. A bottom bar puts every primary destination one tap away, in the
 * place a thumb already rests.
 *
 * The account slot opens a sheet rather than linking straight to the profile,
 * because the dropdown this replaced was the only place logout lived on mobile.
 * Profile has no logout control of its own, so moving to a bare tab bar would
 * have locked mobile users into their accounts.
 *
 * Sits at z-60 on purpose: above the navbar and page content, below the calendar
 * panel at z-80, so opening the calendar still covers it.
 *
 * Motion is a colour change, a short indicator scale and a small press. Nothing
 * animates on a loop.
 */

const itemBase =
  "relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 px-1 py-2 transition-colors duration-200";

const Sheet = ({ title, subtitle, avatar, onClose, children }) => (
  <>
  <div
  className="fixed inset-0 z-[70] bg-ink/30 backdrop-blur-[2px]"
  onClick={onClose}
  aria-hidden="true"
  />

  <div
  role="dialog"
  aria-modal="true"
  aria-label={title}
  className="fixed inset-x-0 bottom-0 z-[80] origin-bottom rounded-t-2xl border-t border-hairline bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_50px_-24px_rgba(17,17,20,0.45)] transition-transform duration-200 ease-out motion-safe:animate-[sheet-up_220ms_cubic-bezier(0.22,1,0.36,1)]"
  >
  <div className="flex items-start justify-between gap-3 border-b border-hairline p-5">
  <div className="flex min-w-0 items-center gap-3">
  {avatar}
  <div className="min-w-0">
  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
  {subtitle}
  </p>
  <p className="truncate font-display text-base font-semibold text-ink">
  {title}
  </p>
  </div>
  </div>

  <button
  type="button"
  onClick={onClose}
  className="press inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-hairline text-stone-600 transition-colors duration-200 hover:bg-stone-50 hover:text-ink"
  aria-label="Close"
  >
  <X size={16} aria-hidden="true" />
  </button>
  </div>

  <div className="p-3">{children}</div>
  </div>
  </>
);

const MobileTabBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef(null);

  const roles = user?.roles || [];
  const isAdmin = roles.includes(ROLES.ADMIN);
  const isClubApproved = Boolean(user?.club?.isVerified);
  const isClubPending = Boolean(
  user?.club && !user.club.isVerified && user.club.status === "Pending",
  );
  const isStudent = roles.includes(ROLES.STUDENT) || roles.length === 0;

  const dashboardLink = isAdmin
  ? "/admin/dashboard"
  : isClubApproved
  ? "/club/dashboard"
  : isClubPending
  ? "/club/verification"
  : isStudent
  ? "/dashboard"
  : "/";

  const portalLabel = isAdmin
  ? "Admin"
  : isClubPending
  ? "Status"
  : isClubApproved
  ? "Club"
  : "Portal";

  const PortalIcon = isAdmin || isClubApproved ? LayoutDashboard : User;

  // Five slots either way, so the bar does not change width when signing in and
  // the tap targets stay where the thumb expects them.
  const tabs = user
  ? [
  { to: "/", label: "Home", Icon: Home },
  { to: "/events", label: "Events", Icon: Compass },
  { to: dashboardLink, label: portalLabel, Icon: PortalIcon },
  { to: "/contact", label: "Contact", Icon: Mail },
  { label: "Account", Icon: User, action: () => setSheetOpen(true) },
  ]
  : [
  { to: "/", label: "Home", Icon: Home },
  { to: "/events", label: "Events", Icon: Compass },
  { to: "/about", label: "About", Icon: Info },
  { to: "/contact", label: "Contact", Icon: Mail },
  { to: "/login", label: "Login", Icon: User },
  ];

  // A tab stays lit for a nested route, otherwise opening an event from the
  // list drops the highlight entirely.
  const isCurrent = (to) => {
  if (!to) return false;
  if (to === "/") return location.pathname === "/";
  if (to === dashboardLink) return location.pathname.startsWith(to);
  return location.pathname === to;
  };

  useEffect(() => {
  if (!sheetOpen) return;

  const onKeyDown = (event) => {
  if (event.key === "Escape") setSheetOpen(false);
  };

  document.addEventListener("keydown", onKeyDown);
  document.body.style.overflow = "hidden";

  return () => {
  document.removeEventListener("keydown", onKeyDown);
  document.body.style.overflow = "";
  };
  }, [sheetOpen]);

  const initial = user?.name?.charAt(0).toUpperCase();

  const avatar = user?.profilePicture ? (
  <img
  src={getImageUrl(user.profilePicture)}
  alt=""
  className="h-10 w-10 shrink-0 rounded-full border border-hairline object-cover"
  onError={(e) => {
  e.currentTarget.style.display = "none";
  }}
  />
  ) : (
  <span
  aria-hidden="true"
  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white"
  >
  {initial}
  </span>
  );

  return (
  <>
  <nav
  aria-label="Primary"
  className="fixed inset-x-0 bottom-0 z-[60] border-t border-hairline bg-white/95 backdrop-blur-md md:hidden"
  >
  <ul className="flex items-stretch pb-[env(safe-area-inset-bottom)]">
  {tabs.map(({ to, label, Icon, action }) => {
  const active = isCurrent(to);

  return (
  <li key={label} className="flex-1">
  {action ? (
  <button
  type="button"
  onClick={action}
  aria-expanded={sheetOpen}
  className={`${itemBase} ${active ? "text-ink" : "text-stone-600"}`}
  >
  <span
  aria-hidden="true"
  className={`absolute inset-x-3 top-0 h-0.5 origin-center rounded-full bg-ink transition-transform duration-200 ease-out ${
  active ? "scale-x-100" : "scale-x-0"
  }`}
  />
  <Icon
  size={21}
  aria-hidden="true"
  className={`transition-transform duration-200 ease-out ${active ? "scale-105" : "scale-100"}`}
  />
  <span className="text-xs font-medium leading-none">{label}</span>
  </button>
  ) : (
  <Link
  to={to}
  aria-current={active ? "page" : undefined}
  className={`${itemBase} ${active ? "text-ink" : "text-stone-600"}`}
  >
  <span
  aria-hidden="true"
  className={`absolute inset-x-3 top-0 h-0.5 origin-center rounded-full bg-ink transition-transform duration-200 ease-out ${
  active ? "scale-x-100" : "scale-x-0"
  }`}
  />
  <Icon
  size={21}
  aria-hidden="true"
  className={`transition-transform duration-200 ease-out ${active ? "scale-105" : "scale-100"}`}
  />
  <span className="text-xs font-medium leading-none">{label}</span>
  </Link>
  )}
  </li>
  );
  })}
  </ul>
  </nav>

  {sheetOpen && (
  <div ref={sheetRef}>
  <Sheet
  onClose={() => setSheetOpen(false)}
  subtitle={isAdmin ? "Administrator" : isClubApproved ? "Club member" : "Student"}
  title={user?.name || "Account"}
  avatar={avatar}
  >
  <div className="space-y-1">
  <button
  type="button"
  onClick={() => {
  setSheetOpen(false);
  navigate("/profile");
  }}
  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
  >
  <User size={17} aria-hidden="true" className="text-stone-600" />
  Profile settings
  </button>

  <button
  type="button"
  onClick={() => {
  setSheetOpen(false);
  navigate(dashboardLink);
  }}
  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
  >
  <LayoutDashboard size={17} aria-hidden="true" className="text-stone-600" />
  {isAdmin ? "Admin panel" : isClubPending ? "Verification status" : "Dashboard"}
  </button>

  {!isAdmin && !isClubPending && !isClubApproved && (
  <button
  type="button"
  onClick={() => {
  setSheetOpen(false);
  navigate("/club/register");
  }}
  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-ink transition-colors duration-200 hover:bg-stone-50"
  >
  <Building2 size={17} aria-hidden="true" className="text-stone-600" />
  Register a club
  </button>
  )}

  <button
  type="button"
  onClick={() => {
  setSheetOpen(false);
  logout();
  }}
  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50"
  >
  <LogOut size={17} aria-hidden="true" />
  Log out
  </button>
  </div>
  </Sheet>
  </div>
  )}
  </>
  );
};

export default MobileTabBar;
