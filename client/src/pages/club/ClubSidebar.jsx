import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  ListOrdered,
  Users,
  PieChart,
} from "lucide-react";
import useOrganizer from "../../hooks/useOrganizer";
import useAuth from "../../hooks/useAuth";
import AppSidebar from "../../components/common/AppSidebar";

const NAV_ITEMS = [
  { to: "/club/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/club/create-event", label: "Create event", icon: CalendarPlus },
  { to: "/club/my-events", label: "Your events", icon: ListOrdered },
  { to: "/club/registrations", label: "Registrations", icon: Users },
  { to: "/club/analytics", label: "Analytics", icon: PieChart },
];

const ClubSidebar = () => {
  const navigate = useNavigate();
  const { orgEvents, fetchOrganizerEvents } = useOrganizer();
  const { logout } = useAuth();

  useEffect(() => {
    fetchOrganizerEvents();
  }, [fetchOrganizerEvents]);

  const upcomingEvents = useMemo(() => {
    if (!orgEvents?.length) return [];
    const now = new Date();
    return orgEvents
      .filter((event) => new Date(event.eventDate) > now)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .slice(0, 5);
  }, [orgEvents]);

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const upcomingSection =
    upcomingEvents.length > 0 ? (
      <>
        <p className="px-3 pb-2 pt-7 text-[12px] font-semibold uppercase tracking-wide text-stone-500">
          Coming up
        </p>
        <ul className="space-y-0.5">
          {upcomingEvents.map((event) => (
            <li key={event._id}>
              <Link
                to={`/event/${event._id}`}
                title={event.title}
                className="flex min-h-[44px] items-center rounded-xl px-3 py-2 text-sm text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-ink"
              >
                <span className="line-clamp-2">{event.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </>
    ) : null;

  return (
    <AppSidebar
      title="EventHub"
      subtitle="Club console"
      items={NAV_ITEMS}
      extraSection={upcomingSection}
      backLabel="Portal view"
      onSignOut={handleSignOut}
    />
  );
};

export default ClubSidebar;
