import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Ticket,
  Bookmark,
  User,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getImageUrl } from "../../utils/imageUrl";
import FloatingCalendar from "../common/FloatingCalendar";
import useEvents from "../../hooks/useEvents";

const UserLayout = () => {
  const { events } = useEvents();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarLinks = [
  { name: "Workspace", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Registrations", path: "/registered-events", icon: Ticket },
  { name: "Profile", path: "/profile", icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
  <>
  <FloatingCalendar events={events} />
  <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden">
  {/* --- SIDEBAR --- */}
  <aside
  className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
  isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  }`}
  >
  <div className="flex flex-col h-full p-8">
  {/* Logo */}
  <div className="flex items-center gap-3 mb-12">
  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
  <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45" />
  </div>
  <span className="text-xl font-black tracking-tighter text-slate-800">
  EventHub
  </span>
  </div>

  {/* Navigation Links */}
  <nav className="flex-1 space-y-2">
  {sidebarLinks.map((link) => (
  <Link
  key={link.path}
  to={link.path}
  className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold text-sm transition-all ${
  isActive(link.path)
  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
  }`}
  >
  <link.icon size={20} />
  {link.name}
  </Link>
  ))}
  </nav>

  {/* Bottom Profile Section */}
  <div className="pt-8 border-t border-slate-100 space-y-6">
  <button
  onClick={() => navigate("/")}
  className="flex items-center gap-4 px-5 py-2 text-slate-400 hover:text-indigo-600 text-sm font-bold transition-all w-full"
  >
  <ArrowLeft size={18} />
  Back to Home
  </button>

  <div className="flex items-center gap-4 px-2">
  <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black overflow-hidden border-2 border-white shadow-md relative no-shadow">
  {user?.profilePicture ? (
  <img
  src={getImageUrl(user.profilePicture)}
  alt="P"
  className="w-full h-full object-cover relative z-20"
  />
  ) : (
  <span className="relative z-10">
  {user?.name?.charAt(0)}
  </span>
  )}
  </div>
  <div className="flex-1 min-w-0">
  <p className="text-sm font-black truncate text-slate-800">
  {user?.name}
  </p>
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
  Student Pro
  </p>
  </div>
  <button
  onClick={logout}
  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
  title="Logout"
  >
  <LogOut size={18} />
  </button>
  </div>
  </div>
  </div>
  </aside>

  {/* --- CONTENT AREA --- */}
  <div className="flex-1 flex flex-col h-full relative overflow-hidden">
  {/* Header (Top Nav) */}
  <header className="h-20 lg:h-24 px-8 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white/50 backdrop-blur-md">
  <div className="flex items-center gap-4">
  <button
  className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
  onClick={() => setIsSidebarOpen(true)}
  >
  <Menu size={24} />
  </button>
  <h2 className="text-lg font-black tracking-tight lg:text-xl text-slate-800 uppercase italic">
  {sidebarLinks.find((l) => isActive(l.path))?.name ||
  "Dashboard"}
  </h2>
  </div>

  <div className="flex items-center gap-6">
  <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
  <Bell size={20} />
  <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
  </button>
  <Link
  to="/events"
  className="px-5 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95"
  >
  Explore Events
  </Link>
  </div>
  </header>

  {/* --- PAGE CONTENT --- */}
  <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
  {isSidebarOpen && (
  <div
  className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
  onClick={() => setIsSidebarOpen(false)}
  />
  )}
  <Outlet />
  </main>
  </div>

  {/* <style>{`
  .custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
  }
  `}</style> */}
  </div>
  </>
  );
};

export default UserLayout;
