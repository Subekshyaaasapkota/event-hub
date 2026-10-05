import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Ticket, User, Compass } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useEvents from "../../hooks/useEvents";
import AppSidebar from "../common/AppSidebar";
import FloatingCalendar from "../common/FloatingCalendar";

/**
 * Layout for the three signed-in student pages: the dashboard, the
 * registrations list and the profile.
 *
 * This had its own sidebar, and it was the reason the student view looked like
 * a different website from the club console. A white 288px drawer with an
 * indigo wordmark, a purple gradient avatar, a "Student Pro" label that means
 * nothing, a bell button wired to nothing, and an uppercase italic page title.
 * It also duplicated the whole mobile drawer pattern with no Escape handling
 * and no focus trap, so the drawer trapped keyboard users.
 *
 * It now uses the same AppSidebar as the club and admin consoles, which means
 * the mobile drawer, the overlay and the hamburger all disappear rather than
 * being fixed. The same component, the same nav, the same breakpoints.
 */

const NAV_ITEMS = [
  { to: "/dashboard", label: "Workspace", icon: LayoutDashboard },
  { to: "/registered-events", label: "My Registrations", icon: Ticket },
  { to: "/profile", label: "Profile", icon: User },
];

const UserLayout = () => {
  const { events } = useEvents();
  const { logout } = useAuth();
  const location = useLocation();

  const current = NAV_ITEMS.find((item) => item.to === location.pathname);

  return (
    <div className="min-h-screen flex bg-paper">
      <FloatingCalendar events={events} />

      <AppSidebar
        title="EventHub"
        subtitle="Student"
        logoSrc="/eventhub-logo.svg"
        items={NAV_ITEMS}
        backLabel="Portal view"
        onSignOut={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/*
          h-16 on purpose. The mobile pill row inside AppSidebar is sticky at
          top-16, so a header of any other height leaves a gap or overlaps it.
        */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-hairline bg-paper/90 px-4 backdrop-blur-md sm:px-6">
          <h1 className="truncate font-display text-lg font-semibold tracking-tight text-ink">
            {current?.label ?? "Workspace"}
          </h1>

          <Link
            to="/events"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-paper transition-opacity duration-200 hover:opacity-90 active:opacity-80"
          >
            <Compass size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Explore events</span>
            <span className="sm:hidden">Events</span>
          </Link>
        </header>

        <main className="flex-1 pb-24">
          <div className="mx-auto w-full max-w-5xl px-5 pt-8 sm:px-8 lg:pt-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
