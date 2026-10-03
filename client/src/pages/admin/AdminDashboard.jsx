// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Calendar,
  CheckSquare,
  ShieldCheck,
  Building2,
  AlertCircle,
  ArrowUpRight,
  Activity,
  Zap,
  ChevronRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import useAdmin from "../../hooks/useAdmin";
import Footer from "../../components/common/Footer";
import { Link, useNavigate } from "react-router-dom";

/*  Animated counter  */
const useCounter = (target, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
  if (!target) return;
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
  start += step;
  if (start >= target) {
  setCount(target);
  clearInterval(timer);
  } else setCount(start);
  }, 16);
  return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

/*  Stat Card  */
const STAT_STYLES = {
  purple: {
  wrap: "bg-violet-50 border-violet-200",
  icon: "bg-violet-100 border-violet-200 text-violet-600",
  num: "text-violet-700",
  label: "text-violet-500",
  trend: "text-violet-400",
  },
  green: {
  wrap: "bg-emerald-50 border-emerald-200",
  icon: "bg-emerald-100 border-emerald-200 text-emerald-600",
  num: "text-emerald-700",
  label: "text-emerald-500",
  trend: "text-emerald-400",
  },
  blue: {
  wrap: "bg-blue-50 border-blue-200",
  icon: "bg-blue-100 border-blue-200 text-blue-600",
  num: "text-blue-700",
  label: "text-blue-500",
  trend: "text-blue-400",
  },
  amber: {
  wrap: "bg-amber-50 border-amber-200",
  icon: "bg-amber-100 border-amber-200 text-amber-600",
  num: "text-amber-700",
  label: "text-amber-500",
  trend: "text-amber-400",
  },
};

const StatCard = ({ icon: Icon, label, value, color, trend, to }) => {
  const animated = useCounter(value);
  const s = STAT_STYLES[color];

  // These cards lift on hover, which reads as clickable, so they have to
  // actually go somewhere. Rendered as a Link so they are keyboard reachable
  // and open in a new tab with ctrl/cmd-click like every other link.
  const inner = (
  <>
  <div className="flex items-start justify-between mb-4">
  <div
  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.icon}`}
  >
  <Icon size={18} />
  </div>
  <TrendingUp size={12} className={`${s.trend} opacity-60`} />
  </div>
  <p
  className={`text-[10px] font-black tracking-widest uppercase mb-1 ${s.label}`}
  >
  {label}
  </p>
  <p className={`text-4xl font-black leading-none tabular-nums ${s.num}`}>
  {animated}
  </p>
  {trend && (
  <p className={`text-[11px] mt-2 font-medium ${s.trend}`}>{trend}</p>
  )}
  </>
  );

  const className = `relative block border rounded-2xl p-5 transition-all duration-200 ${
  to
  ? "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
  : "hover:-translate-y-0.5 hover:shadow-lg"
  } ${s.wrap}`;

  if (to) {
  return (
  <Link to={to} className={className} aria-label={`${label}: ${value}. ${trend || ""}`}>
  {inner}
  </Link>
  );
  }

  return <div className={className}>{inner}</div>;
};

/*  Skeleton  */
const Skeleton = ({ h = "h-24" }) => (
  <div className={`${h} bg-slate-200 animate-pulse rounded-2xl`} />
);

/*  Section Header  */
const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between mb-5">
  <h2 className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest">
  <Icon size={13} className="text-indigo-500" />
  {title}
  </h2>
  {action}
  </div>
);

const EVENT_ACCENTS = [
  "bg-indigo-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-blue-400",
  "bg-violet-400",
];

/*  Dashboard  */
const AdminDashboard = () => {
  const { adminData, fetchEvents, fetchUsers, fetchClubs } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
  fetchEvents();
  fetchUsers();
  fetchClubs();
  }, [fetchEvents, fetchUsers, fetchClubs]);

  const totalEvents = adminData.events?.length ?? 0;
  const totalUsers = adminData.users?.length ?? 0;
  const totalClubs = adminData.clubs?.length ?? 0;
  const pendingClubs =
  adminData.clubs?.filter((c) => c.status === "Pending")?.length ?? 0;

  const sortedEvents = useMemo(
  () =>
  (adminData.events || [])
  .slice()
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  [adminData.events],
  );
  const latestEvents = sortedEvents.slice(0, 5);

  const shortcuts = [
  {
  label: "Verify Clubs",
  link: "/admin/club/verification",
  icon: CheckSquare,
  desc: `${pendingClubs} pending`,
  highlight: pendingClubs > 0,
  },
  {
  label: "All Clubs",
  link: "/admin/clubs",
  icon: Building2,
  desc: `${totalClubs} registered`,
  highlight: false,
  },
  {
  label: "All Users",
  link: "/admin/users",
  icon: Users,
  desc: `${totalUsers} members`,
  highlight: false,
  },
  {
  label: "All Events",
  link: "/admin/events",
  icon: Calendar,
  desc: `${totalEvents} created`,
  highlight: false,
  },
  {
  label: "Registrations",
  link: "/admin/registrations",
  icon: FileText,
  desc: "View all signups",
  highlight: false,
  },
  ];

  const hour = new Date().getHours();
  const greeting =
  hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
  <div className="min-h-screen text-slate-700 space-y-6">
  {/*  Header  */}
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
  <div>
  <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3">
  <ShieldCheck size={10} />
  Admin Control Panel
  </span>
  <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-snug">
  {greeting},&nbsp;
  <span className="bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
  Administrator
  </span>
  </h1>
  <p className="text-sm text-slate-400 mt-1.5 font-medium">
  Here's what's happening on your platform today.
  </p>
  </div>

  {pendingClubs > 0 && (
  <button
  onClick={() => navigate("/admin/club/verification")}
  className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 hover:bg-amber-100 hover:border-amber-300 transition-all text-left shrink-0 self-start group"
  >
  <div className="w-9 h-9 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
  <AlertCircle size={16} />
  </div>
  <div>
  <p className="text-sm font-bold text-amber-700 leading-none">
  {pendingClubs} Club{pendingClubs !== 1 ? "s" : ""} Awaiting
  Verification
  </p>
  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1 group-hover:gap-1.5 transition-all">
  Tap to review <ChevronRight size={10} />
  </p>
  </div>
  </button>
  )}
  </div>

  {/*  Stats  */}
  {adminData.loading ? (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {[1, 2, 3, 4].map((i) => (
  <Skeleton key={i} />
  ))}
  </div>
  ) : (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard
  icon={Building2}
  label="Total Clubs"
  value={totalClubs}
  color="purple"
  trend="Registered"
  to="/admin/clubs"
  />
  <StatCard
  icon={Users}
  label="Total Users"
  value={totalUsers}
  color="green"
  trend="Platform members"
  to="/admin/users"
  />
  <StatCard
  icon={Calendar}
  label="Total Events"
  value={totalEvents}
  color="blue"
  trend="All time"
  to="/admin/events"
  />
  <StatCard
  icon={CheckSquare}
  label="Pending"
  value={pendingClubs}
  color="amber"
  trend={pendingClubs > 0 ? "Needs attention" : "All clear"}
  to="/admin/club/verification"
  />
  </div>
  )}

  {/*  Latest Events  */}
  {!adminData.loading && (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
  <SectionHeader
  icon={Activity}
  title="Latest Events"
  action={
  <button
  onClick={() => navigate("/admin/events")}
  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all"
  >
  View all <ChevronRight size={11} />
  </button>
  }
  />

  {latestEvents.length > 0 ? (
  <>
  <p className="text-[11px] text-slate-400 -mt-2 mb-4 font-medium">
  Showing {latestEvents.length} of {sortedEvents.length} events
  </p>
  <div className="space-y-1">
  {latestEvents.map((ev, i) => (
  <button
  key={ev._id}
  onClick={() => navigate(`/admin/event/${ev._id}`)}
  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all duration-150 text-left group"
  >
  <span className="text-[11px] font-black text-slate-400 w-5 shrink-0 text-right tabular-nums">
  {String(i + 1).padStart(2, "0")}
  </span>
  <div
  className={`w-1.5 h-1.5 rounded-full shrink-0 ${EVENT_ACCENTS[i % 5]}`}
  />
  <div className="flex-1 min-w-0">
  <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
  {ev.title}
  </p>
  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
  {ev.district || "No location"}
  </p>
  </div>
  <div className="flex flex-col items-end gap-1.5 shrink-0">
  <span className="text-[11px] text-slate-400 font-medium">
  {new Date(ev.createdAt).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  })}
  </span>
  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-500 uppercase tracking-widest">
  {ev.status ?? "Active"}
  </span>
  </div>
  <ChevronRight
  size={13}
  className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0"
  />
  </button>
  ))}
  </div>
  </>
  ) : (
  <p className="text-sm text-slate-400 font-medium">
  No events created yet.
  </p>
  )}
  </div>
  )}

  {/*  Quick Actions  */}
  {!adminData.loading && (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
  <SectionHeader icon={Zap} title="Quick Actions" />
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  {shortcuts.map((item, i) => (
  <button
  key={i}
  onClick={() => navigate(item.link)}
  className={`flex flex-col gap-3 p-4 rounded-xl border text-left group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${
  item.highlight
  ? "bg-amber-50 border-amber-200 hover:border-amber-300 hover:bg-amber-100"
  : "bg-slate-50 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50"
  }`}
  >
  <div className="flex items-center justify-between">
  <div
  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
  item.highlight
  ? "bg-amber-100 border-amber-200 text-amber-600"
  : "bg-white border-slate-200 text-slate-500 group-hover:bg-indigo-100 group-hover:border-indigo-200 group-hover:text-indigo-600"
  }`}
  >
  <item.icon size={16} />
  </div>
  <ArrowUpRight
  size={13}
  className={`transition-all ${
  item.highlight
  ? "text-amber-400 group-hover:text-amber-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
  : "text-slate-300 group-hover:text-indigo-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
  }`}
  />
  </div>
  <div>
  <span
  className={`block text-sm font-bold leading-none mb-1 ${item.highlight ? "text-amber-800" : "text-slate-700"}`}
  >
  {item.label}
  </span>
  <span
  className={`block text-[11px] font-medium ${item.highlight ? "text-amber-500" : "text-slate-400"}`}
  >
  {item.desc}
  </span>
  </div>
  </button>
  ))}
  </div>
  </div>
  )}
  </div>
  );
};

export default AdminDashboard;
