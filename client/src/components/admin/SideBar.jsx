// src/components/admin/SideBar.jsx
import React from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  CheckSquare,
  ShieldAlert,
  LogOut,
  UserCheck2Icon,
  Home,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "All Events", icon: Calendar, path: "/admin/events" },
  { label: "All Users", icon: Users, path: "/admin/users" },
  { label: "Register User", icon: UserCheck2Icon, path: "/admin/registrations" },
  { label: "All Clubs", icon: Building2, path: "/admin/clubs" },
  {
  label: "Club Verification",
  icon: CheckSquare,
  path: "/admin/club/verification",
  highlight: true,
  },
  ];

  const isActive = (path) => {
  if (path === "/admin/club/verification") {
  return location.pathname === "/admin/club/verification";
  }
  return location.pathname === path;
  };

  return (
  <aside className="w-72 bg-slate-900 h-screen sticky top-0 flex flex-col p-6 text-slate-400">
  {/* Logo */}
  <div className="flex items-center gap-3 px-2 mb-10">
  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
  <ShieldAlert size={24} />
  </div>
  <span className="text-white font-black tracking-tighter text-xl uppercase">
  Core Admin
  </span>
  </div>

  {/* Navigation */}
  <nav className="space-y-1 flex-1">
  {menuItems.map((item) => (
  <NavItem
  key={item.path}
  icon={item.icon}
  label={item.label}
  active={isActive(item.path)}
  highlight={item.highlight}
  onClick={() => navigate(item.path)}
  />
  ))}
  </nav>
  
  {/* Footer Actions */}
  <div className="mt-auto border-t border-slate-800/50 pt-4 space-y-2">
  <Link
  to="/"
  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-slate-200 transition-all group"
  >
  <Home
  size={20}
  className="text-slate-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all"
  />
  <span className="text-sm font-bold tracking-tight">
  Portal View
  </span>
  </Link>
  <button
  onClick={() => {
  localStorage.removeItem("authToken");
  navigate("/login");
  }}
  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
  >
  <LogOut
  size={20}
  className="group-hover:scale-110 transition-all"
  />
  <span className="text-sm font-bold">Sign Out</span>
  </button>
  </div>
  </aside>
  );
};

const NavItem = ({ icon: Icon, label, active, highlight, onClick }) => (
  <button
  onClick={onClick}
  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
  active
  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40"
  : "hover:bg-slate-800 hover:text-slate-200"
  }`}
  >
  <Icon
  size={20}
  className={
  active
  ? "text-white"
  : highlight
  ? "text-amber-500"
  : "text-slate-500 group-hover:text-indigo-400"
  }
  />
  <span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

export default SideBar;
