import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardCheck,
  Building2,
  ShieldCheck,
} from "lucide-react";

/**
 * The admin navigation, defined once.
 *
 * The sidebar and the page header both used to carry their own copy of these
 * labels, so they could disagree. The header derived its title by taking the
 * last path segment and title casing it, which meant `/admin/event/<id>`
 * rendered a raw Mongo id as the page heading. Keeping the list here lets both
 * read from one place and lets the title be looked up rather than guessed.
 */
export const ADMIN_NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/registrations", label: "Registrations", icon: ClipboardCheck },
  { to: "/admin/clubs", label: "Clubs", icon: Building2 },
  {
    to: "/admin/club/verification",
    label: "Verification",
    icon: ShieldCheck,
  },
];

export const getAdminPageTitle = (pathname) => {
  if (pathname.includes("/club/verification")) return "Club verification";

  const exact = ADMIN_NAV_ITEMS.find((item) => item.to === pathname);
  if (exact) return exact.label;

  // Both detail routes sit under /admin and carry an id in the URL, so the
  // segment can never be used as the heading.
  if (
    pathname.startsWith("/admin/event/") ||
    pathname.startsWith("/admin/events/edit/")
  ) {
    return "Event details";
  }

  return "Admin";
};