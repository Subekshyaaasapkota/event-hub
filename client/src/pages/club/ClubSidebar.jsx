import React, { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  ListOrdered,
  UserCircle,
  LogOut,
  Settings,
  PieChart,
  Calendar,
  Clock,
  MapPin,
  Home,
  Users,
} from "lucide-react";
import useOrganizer from "../../hooks/useOrganizer";
import useAuth from "../../hooks/useAuth";

const ClubSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orgEvents, fetchOrganizerEvents } = useOrganizer();
  const { logout } = useAuth();

  const handleLogout = () => {
  logout();
  navigate("/");
  };

  useEffect(() => {
  // Fetch organizer events
  fetchOrganizerEvents();
  }, [fetchOrganizerEvents]);

  const upcomingEvents = useMemo(() => {
  if (orgEvents && orgEvents.length > 0) {
  const now = new Date();
  return orgEvents
  .filter((event) => new Date(event.eventDate) > now)
  .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
  .slice(0, 5);
  }
  return [];
  }, [orgEvents]);

  const navItems = [
  { name: "Dashboard", path: "/club/dashboard", icon: LayoutDashboard },
  { name: "Create Event", path: "/club/create-event", icon: CalendarPlus },
  { name: "Event List", path: "/club/my-events", icon: ListOrdered },
  { name: "Registrations", path: "/club/registrations", icon: Users },
  { name: "Analytics", path: "/club/analytics", icon: PieChart },
  ];

  return (
  <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
  <div className="p-8">
  <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
  EventHub
  </h2>
  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
  CLUB CONSOLE
  </p>
  </div>

  <nav className="flex-1 px-4 space-y-2">

  {navItems.map((item) => {
  const isActive = location.pathname === item.path;
  return (
  <Link
  key={item.path}
  to={item.path}
  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
  isActive
  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
  : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
  }`}
  >
  <item.icon
  size={20}
  className={
  isActive
  ? "text-white"
  : "group-hover:scale-110 transition-transform"
  }
  />
  <span className="text-sm font-bold tracking-tight">
  {item.name}
  </span>
  </Link>
  );
  })}
  </nav>

  {/* Upcoming Events */}
  {upcomingEvents.length > 0 && (
  <div className="px-4 pb-4">
  <p className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
  Upcoming
  </p>
  <div className="space-y-1">
  {upcomingEvents.map((event) => (
  <Link
  key={event._id}
  to={`/events/${event._id}`}
  className="block px-6 py-2 rounded-xl text-xs font-bold text-slate-500 truncate hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
  title={event.title}
  >
  {event.title}
  </Link>
  ))}
  </div>
  </div>
  )}

  {/* Footer Actions */}
  <div className="p-4 border-t border-slate-50 space-y-2">
  <Link
  to="/"
  className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  >
  <Home
  size={20}
  className="group-hover:scale-110 transition-transform"
  />
  <span className="text-sm font-bold tracking-tight">
  Portal View
  </span>
  </Link>
  <button
  onClick={handleLogout}
  className="w-full flex items-center gap-4 px-6 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm group"
  >
  <LogOut size={20} className="group-hover:scale-110 transition-transform" />
  <span>Sign Out</span>
  </button>
  </div>
  </div>
  );
};

export default ClubSidebar;
