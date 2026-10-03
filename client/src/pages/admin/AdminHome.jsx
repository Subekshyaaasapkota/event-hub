// src/pages/admin/AdminHome.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../../components/admin/SideBar";

const getPageTitle = (pathname) => {
  if (pathname.includes("verification")) return "Club Verification";
  const last = pathname.split("/").filter(Boolean).pop();
  if (!last || last === "dashboard") return "Central Oversight";
  const map = { clubs: "All Clubs", users: "All Users", events: "All Events" };
  return (
  map[last] ??
  last
  .split("-")
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join("")
  );
};

const AdminHome = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
  <div className="flex min-h-screen bg-slate-50">
  <SideBar />

  <div className="flex-1 flex flex-col h-screen overflow-y-auto">
  {/* Top bar */}
  <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
  <span className="text-slate-400">Root</span>
  <span className="text-slate-300">/</span>
  <span className="text-indigo-500">{title}</span>
  </div>
  <div className="flex items-center gap-1.5">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
  Secure
  </span>
  </div>
  </header>

  {/* Page content */}
  <main className="flex-1 px-8 py-8">
  <Outlet />
  </main>

  {/* Footer */}
  <footer className="py-6 px-8 border-t border-slate-200">
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
  Terminal Status:{""}
  <span className="text-emerald-500">Encrypted &amp; Secure</span>
  </p>
  </footer>
  </div>
  </div>
  );
};

export default AdminHome;