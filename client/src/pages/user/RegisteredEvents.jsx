import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, Layers, ExternalLink, Activity, BookmarkCheck, LayoutGrid, List
} from "lucide-react";
import useEvents from "../../hooks/useEvents";
import EventCard from "../../components/common/EventCard";

const RegisteredEvents = () => {
  const {
  fetchEvents,
  fetchMyRegistrations,
  myRegistrations,
  loading: eventsLoading,
  error,
  } = useEvents();
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
  fetchEvents();
  fetchMyRegistrations();
  }, [fetchEvents, fetchMyRegistrations]);

  const normalizePoster = (poster) => {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
  return `${BASE_URL}${poster}`;
  };

  return (
  <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
  {/* Header */}
  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-2">
  <div className="space-y-3">
  <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-100 mb-2">
  <BookmarkCheck size={12} /> Enrollment Registry
  </div>
  <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter leading-tight">
  My <span className="text-indigo-600 italic">Enrollments</span>
  </h1>
  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest max-w-lg italic">
  Access your participation history, active session nodes, and subscription metadata.
  </p>
  </div>

  <div className="flex items-center gap-4">
  {/* View Toggles */}
  <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
  <button 
  onClick={() => setViewMode("grid")}
  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
  >
  <LayoutGrid size={18} />
  </button>
  <button 
  onClick={() => setViewMode("list")}
  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
  >
  <List size={18} />
  </button>
  </div>

  <div className="relative group min-w-75">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
  <input 
  type="text" 
  placeholder="Search through logs..." 
  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm text-slate-800 placeholder:text-slate-300 transition-all shadow-sm"
  />
  </div>
  </div>
  </div>

  {eventsLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {[1, 2, 3].map(i => <div key={i} className="h-112.5 bg-white animate-pulse rounded-[3.5rem] border border-slate-100 shadow-sm"></div>)}
  </div>
  ) : error ? (
  <div className="bg-rose-50 border border-rose-100 p-12 rounded-[3.5rem] text-center max-w-xl mx-auto shadow-sm">
  <Activity size={48} className="text-rose-500 mx-auto mb-6" />
  <p className="text-slate-800 font-black uppercase tracking-[0.2em] text-xs mb-2">Protocol Error Detected</p>
  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{error}</p>
  </div>
  ) : myRegistrations?.length > 0 ? (
  viewMode === "grid" ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
  {myRegistrations.map((reg, index) => (
  <div key={reg._id} className="relative group transition-all duration-500 hover:-translate-y-2">
  <div className="absolute top-6 left-6 z-20">
  <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl border border-white/20 backdrop-blur-md ${
  reg.status === "Confirmed" 
  ? "bg-emerald-500 text-white shadow-emerald-200" 
  : "bg-amber-500 text-white shadow-amber-200 animate-pulse"
  }`}>
  {reg.status}
  </div>
  </div>
  <EventCard
  {...reg.event}
  direction={index % 2 === 0 ? "left" : "right"}
  />
  </div>
  ))}
  </div>
  ) : (
  <div className="space-y-6">
  {myRegistrations.map((reg) => (
  <Link
  key={reg._id}
  to={`/event/${reg.event?._id}`}
  className="bg-white border border-slate-100 p-6 rounded-[2.5rem] flex items-center gap-8 group hover:border-indigo-100 transition-all cursor-pointer shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
  >
  <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500">
  <img
  src={normalizePoster(reg.event?.poster)}
  className="w-full h-full object-cover"
  alt={`${reg.event?.title || "Event"} poster`}
  />
  </div>
  <div className="flex-1 min-w-0">
  <div className="flex items-center gap-3 mb-2">
  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100">
  {reg.event?.category}
  </span>
  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic truncate">{reg.event?.district} • {new Date(reg.event?.eventDate).toLocaleDateString()}</span>
  </div>
  <h3 className="text-xl font-black text-slate-800 tracking-tight truncate group-hover:text-indigo-600 transition-colors uppercase">{reg.event?.title}</h3>
  </div>
  <div className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border ${
  reg.status === "Confirmed" 
  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
  : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
  }`}>
  {reg.status}
  </div>
  </Link>
  ))}
  </div>
  )
  ) : (
  <div className="bg-white border border-slate-100 rounded-[4rem] p-24 text-center max-w-2xl mx-auto shadow-sm group relative overflow-hidden">
  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full pointer-events-none" />
  <div className="relative z-10">
  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-10 group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-700 border border-slate-100">
  <Layers size={48} />
  </div>
  <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase italic">Enrollment Cache Empty</h2>
  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-12 leading-relaxed px-12 italic border-t border-slate-50 pt-8 mt-8">
  No active session nodes found in your registry. Initiate a search to synchronize participation metadata.
  </p>
  <Link to="/events" className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95 group-hover:px-12 duration-500">
  Initiate Node Search <ExternalLink size={20} />
  </Link>
  </div>
  </div>
  )}
  </div>
  );
};

export default RegisteredEvents;
