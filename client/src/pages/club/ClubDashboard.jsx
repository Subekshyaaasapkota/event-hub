import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  PlusCircle,
  Calendar,
  Users,
  BarChart3,
  ArrowRight,
  Layers,
  Activity,
  ListFilter,
  Search,
  MapPin,
  Clock,
  Send,
  Building2,
  TrendingUp,
  Eye,
  Zap,
  AlertCircle,
  CheckCircle2,
  Settings,
  MoreVertical,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import ClubSidebar from "./ClubSidebar";
import useOrganizer from "../../hooks/useOrganizer";

const ClubDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { orgEvents } = useOrganizer();

  // Normalize poster URLs (convert relative paths to full URLs)
  const normalizePoster = (poster) => {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  const BASE_URL =
  import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
  return `${BASE_URL}${poster}`;
  };

  // Calculate active events (events with status 'active' or upcoming)
  const activeEvents =
  orgEvents?.filter((event) => new Date(event.eventDate) > new Date()) || [];

  // Calculate completed deadlines
  const deadlineCompleted =
  orgEvents?.filter((event) => new Date(event.deadline) < new Date())
  .length || 0;

  // Total events created
  const totalEventsCreated = orgEvents?.length || 0;

  const statisticData = [
  {
  label: "Total Events Created",
  value: totalEventsCreated,
  change: "All time",
  icon: Calendar,
  color: "indigo",
  },
  {
  label: "Deadline Completed",
  value: deadlineCompleted,
  change: "Past registration",
  icon: CheckCircle2,
  color: "rose",
  },
  {
  label: "Active Events",
  value: activeEvents.length,
  change: activeEvents.length > 0 ? "Ongoing" : "None",
  icon: Activity,
  color: "emerald",
  },
  {
  label: "Total Registrations",
  value:
  orgEvents?.reduce((sum, e) => sum + (e.currentParticipants || 0), 0) ||
  0,
  change: "Across all",
  icon: Users,
  color: "amber",
  },
  ];
  // authLoading alone is not enough. Once loading finishes the user can still
  // be null, because the token was rejected or the profile request failed, and
  // `user.club` below then throws and the page white-screens. The render
  // harness hit this with an empty session.
  if (authLoading || !user)
  return (
  <div className="h-screen flex items-center justify-center">
  Loading...
  </div>
  );

  // SCENARIO 1: NOT REGISTERED AS CLUB
  if (!user.club) {
  return (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFDFF]">
  <div className="max-w-xl w-full text-center space-y-8 p-12 bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-indigo-50/50">
  <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-500">
  <Building2 size={48} />
  </div>
  <div className="space-y-4">
  <h1 className="text-4xl font-black text-slate-800 tracking-tight">
  Start Hosting{""}
  <span className="text-indigo-600 underline decoration-4 decoration-indigo-200 underline-offset-8">
  Events
  </span>
  </h1>
  <p className="text-slate-500 font-medium leading-relaxed">
  Register your organization to start creating events, managing your
  guests, and growing your community.
  </p>
  </div>
  <Link
  to="/club/register"
  className="inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all hover:scale-105"
  >
  Register My Club <ArrowRight size={16} />
  </Link>
  </div>
  </div>
  );
  }

  // SCENARIO 2: PENDING APPROVAL
  if (!user.club.isVerified && user.club.status === "Pending") {
  return (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFDFF]">
  <div className="max-w-xl w-full text-center space-y-10 p-12 bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-indigo-50/50 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[8rem] -mr-10 -mt-10 animate-pulse"></div>
  <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-600 mx-auto relative z-10">
  <Activity size={48} className="animate-spin-slow" />
  </div>
  <div className="space-y-4 relative z-10">
  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-amber-100">
  Checking Your Application
  </div>
  <h1 className="text-4xl font-black text-slate-800 tracking-tight">
  Almost There!
  </h1>
  <p className="text-slate-500 font-medium leading-relaxed">
  We are currently reviewing your club details. You'll be able to
  manage events as soon as our team approves your request.
  </p>
  </div>
  <div className="grid grid-cols-2 gap-4 text-left">
  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
  Account Status
  </p>
  <p className="font-bold text-amber-600">WAITING FOR APPROVAL</p>
  </div>
  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
  Next Step
  </p>
  <p className="font-bold text-slate-800">CHECK BACK LATER</p>
  </div>
  </div>
  </div>
  </div>
  );
  }

  // SCENARIO 3: FULL DASHBOARD
  return (
  <div className="min-h-screen flex bg-paper">
  <ClubSidebar />

  <div className="flex-1 p-8 lg:p-12 overflow-auto">
  {/* Premium Header with Profile */}
  <header className="mb-12">
  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 lg:p-12 shadow-xl text-white relative overflow-hidden group">
  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full -ml-24 -mb-24"></div>

  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
  <div className="space-y-4 flex-1">
  <div className="flex items-center gap-4">
  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 overflow-hidden">
  {user.club?.logo ? (
  <img
  src={normalizePoster(user.club.logo)}
  alt={user.club?.name}
  className="w-full h-full object-cover"
  />
  ) : (
  <Building2 size={32} />
  )}
  </div>
  <div>
  <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
  {user.club?.name || "Organization"}
  </h2>
  <p className="text-indigo-100 text-sm font-bold flex items-center gap-1">
  <span>Made by</span>
  <span className="font-black text-white">{user.name}</span>
  </p>
  </div>
  </div>
  <p className="text-indigo-100 text-sm font-bold flex items-center gap-2">
  <Activity size={16} className="text-emerald-300" />
  Your club is live • {activeEvents.length} active event
  {activeEvents.length !== 1 ? "s" : ""}
  </p>
  </div>

  <Link
  to="/club/create-event"
  className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
  >
  <PlusCircle size={20} /> Create Event
  </Link>
  </div>
  </div>
  </header>

  {/* Stats Grid with Enhanced Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
  {statisticData.map((stat, i) => {
  const Icon = stat.icon;
  const colorMap = {
  indigo: {
  bg: "from-indigo-50 to-indigo-100/50",
  icon: "text-indigo-600",
  accent: "bg-indigo-100",
  },
  emerald: {
  bg: "from-emerald-50 to-emerald-100/50",
  icon: "text-emerald-600",
  accent: "bg-emerald-100",
  },
  amber: {
  bg: "from-amber-50 to-amber-100/50",
  icon: "text-amber-600",
  accent: "bg-amber-100",
  },
  rose: {
  bg: "from-rose-50 to-rose-100/50",
  icon: "text-rose-600",
  accent: "bg-rose-100",
  },
  };
  const colors = colorMap[stat.color] || colorMap.indigo;

  return (
  <div
  key={i}
  className={`bg-gradient-to-br ${colors.bg} rounded-[2rem] p-6 border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer`}
  >
  <div className="flex items-start justify-between mb-6">
  <div
  className={`${colors.accent} p-4 rounded-xl group-hover:scale-110 transition-transform`}
  >
  <Icon size={24} className={colors.icon} />
  </div>
  <TrendingUp
  size={16}
  className="text-slate-400 group-hover:text-slate-600"
  />
  </div>

  <div className="space-y-2">
  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
  {stat.label}
  </p>
  <div className="flex items-baseline justify-between">
  <h3 className="text-3xl lg:text-4xl font-black text-slate-900">
  {stat.value}
  </h3>
  <span
  className={`text-xs font-bold px-3 py-1.5 rounded-lg ${colors.accent} ${colors.icon}`}
  >
  {stat.change}
  </span>
  </div>
  </div>

  {/* Progress bar visualization */}
  <div className="mt-4 h-1.5 bg-white/40 rounded-full overflow-hidden">
  <div
  className={`h-full bg-gradient-to-r ${stat.color === "indigo" ? "from-indigo-500 to-indigo-600" : stat.color === "emerald" ? "from-emerald-500 to-emerald-600" : stat.color === "amber" ? "from-amber-500 to-amber-600" : "from-rose-500 to-rose-600"} rounded-full`}
  style={{ width: `${Math.min(100, (i + 1) * 25)}%` }}
  ></div>
  </div>
  </div>
  );
  })}
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Enhanced Event Snapshot */}
  <div className="lg:col-span-2 space-y-6">
  <div className="flex items-center justify-between">
  <div>
  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
  <Calendar size={18} className="text-indigo-600" />
  </div>
  My Recent Events
  </h2>
  <p className="text-xs text-slate-500 font-bold mt-1">
  Keep track of your upcoming events
  </p>
  </div>
  <Link
  to="/club/my-events"
  className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 group"
  >
  View All{""}
  <ArrowRight
  size={14}
  className="group-hover:translate-x-1 transition-transform"
  />
  </Link>
  </div>

  {orgEvents && orgEvents.length > 0 ? (
  <div className="space-y-4">
  {orgEvents?.slice(0, 3).map((event, i) => (
  <div
  key={i}
  onClick={() => navigate(`/club/my-events/${event._id}`)}
  className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/30 rounded-[1.75rem] p-6 border border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
  >
  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

  <div className="flex items-start gap-5">
  {/* Enhanced Poster */}
  <div className="w-24 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[1.25rem] overflow-hidden shadow-md group-hover:shadow-lg transition-all shrink-0 relative">
  {event.poster ? (
  <>
  <img
  src={normalizePoster(event.poster)}
  alt={event.title}
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
  />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
  </>
  ) : (
  <div className="w-full h-full flex items-center justify-center text-slate-300">
  <Layers size={28} />
  </div>
  )}
  </div>

  {/* Content */}
  <div className="flex-1 min-w-0">
  <div className="flex items-center gap-2 mb-3 flex-wrap">
  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border border-emerald-200">
  <CheckCircle2 size={12} /> Active
  </span>
  <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border border-indigo-200">
  <Calendar size={12} />{""}
  {new Date(event.eventDate).toLocaleDateString(
  "en-US",
  { month: "short", day: "numeric" },
  )}
  </span>
  </div>

  <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
  {event.title}
  </h4>

  <div className="flex items-center gap-4 text-sm">
  <p className="text-slate-600 font-bold flex items-center gap-1.5 text-xs">
  <MapPin size={14} className="text-slate-400" />
  <span className="truncate">
  {event.venue || event.district}
  </span>
  </p>
  <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs bg-slate-50 px-2.5 py-1 rounded-lg">
  <Users size={14} className="text-slate-400" />
  {event.currentParticipants || 0} /{""}
  {event.participantCount || 50}
  </div>
  </div>

  {/* Capacity Progress */}
  <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
  <div
  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
  style={{
  width: `${Math.round(((event.currentParticipants || 0) / (event.participantCount || 50)) * 100)}%`,
  }}
  ></div>
  </div>
  </div>

  {/* Action Button */}
  <button className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 transform group-hover:scale-110 active:scale-95">
  <ArrowRight size={18} />
  </button>
  </div>
  </div>
  ))}
  </div>
  ) : (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
  <Layers size={32} className="text-slate-300" />
  </div>
  <h4 className="font-black text-slate-900 mb-2">
  No Events Yet
  </h4>
  <p className="text-sm text-slate-500 font-bold mb-6">
  Start by creating your first event
  </p>
  <Link
  to="/club/create-event"
  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
  >
  <PlusCircle size={16} /> Create Your First Event
  </Link>
  </div>
  )}
  </div>

  {/* Enhanced Sidebar */}
  <div className="space-y-6">
  {/* Quick Stats Card */}
  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>

  <div className="relative z-10 space-y-6">
  <div className="space-y-1.5">
  <div className="flex items-center gap-3">
  <div className="w-12 h-12 rounded-xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/50">
  <Zap size={20} />
  </div>
  <h3 className="font-black tracking-tight text-lg">
  Quick Stats
  </h3>
  </div>
  <p className="text-xs text-indigo-200 font-bold pl-15 opacity-75">
  Overview of your event registrations & capacity
  </p>
  </div>

  <div className="space-y-3">
  <div className="flex justify-between items-center pb-3 border-b border-white/10">
  <span className="text-sm font-bold text-indigo-100">
  Total Registrations
  </span>
  <span className="font-black text-lg">
  {orgEvents?.reduce(
  (sum, e) => sum + (e.currentParticipants || 0),
  0,
  ) || 0}
  </span>
  </div>
  <div className="flex justify-between items-center pb-3 border-b border-white/10">
  <span className="text-sm font-bold text-indigo-100">
  Total Capacity
  </span>
  <span className="font-black text-lg">
  {orgEvents?.reduce(
  (sum, e) => sum + (e.participantCount || 0),
  0,
  ) || 0}
  </span>
  </div>
  <div className="flex justify-between items-center">
  <span className="text-sm font-bold text-indigo-100">
  Fill Rate
  </span>
  <span className="font-black text-lg text-emerald-300">
  {orgEvents && orgEvents.length > 0
  ? Math.round(
  (orgEvents.reduce(
  (sum, e) => sum + (e.currentParticipants || 0),
  0,
  ) /
  orgEvents.reduce(
  (sum, e) => sum + (e.participantCount || 50),
  0,
  )) *
  100,
  )
  : 0}
  %
  </span>
  </div>
  </div>
  </div>
  </div>

  {/* Support Card */}
  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-[2rem] p-8 border border-indigo-200 shadow-lg hover:shadow-xl transition-shadow">
  <div className="space-y-4">
  <div className="flex items-center gap-3 mb-4">
  <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
  <AlertCircle size={18} />
  </div>
  <h4 className="font-black text-indigo-900">
  Need Assistance?
  </h4>
  </div>
  <p className="text-sm text-indigo-800 font-bold leading-relaxed">
  Our support team is ready to help you create and manage
  amazing events.
  </p>
  <button
  onClick={() => navigate("/contact")}
  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 text-sm"
  >
  Get Support
  </button>
  </div>
  </div>

  {/* Quick Actions */}
  <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
  <div className="space-y-1.5 mb-4">
  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
  <Settings size={16} /> Quick Actions
  </h4>
  <p className="text-xs text-slate-500 font-bold opacity-75">
  Frequently used management tools for your events
  </p>
  </div>
  <Link
  to="/club/my-events"
  className="block w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-all text-center"
  >
  View All Events
  </Link>
  <Link
  to="/club/analytics"
  className="block w-full px-4 py-3 bg-slate-50 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-100 transition-all text-center"
  >
  Event Analytics
  </Link>
  <Link
  to="/club/registrations"
  className="block w-full px-4 py-3 bg-slate-50 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-100 transition-all text-center"
  >
  Manage Registrations
  </Link>
  </div>
  </div>
  </div>
  </div>
  </div>
  );
};

export default ClubDashboard;
