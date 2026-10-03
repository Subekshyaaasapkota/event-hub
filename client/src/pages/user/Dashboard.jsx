import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Zap,
  Award,
  Download,
  BookmarkCheck,
  TrendingUp,
} from "lucide-react";
import useEvents from "../../hooks/useEvents";
import useAuth from "../../hooks/useAuth";
import usePayment from "../../hooks/usePayment";
import { getImageUrl } from "../../utils/imageUrl";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
  fetchEvents,
  fetchMyRegistrations,
  myRegistrations,
  fetchRecommendedEvents,
  recommendedEvents,
  loading: eventsLoading
  } = useEvents();
  const { verifyKhalti } = usePayment();

  const normalizePoster = (poster) => {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
  return `${BASE_URL}${poster}`;
  };

  const verifyPayment = useCallback(
  async (pidx) => {
  try {
  const paymentRes = await verifyKhalti(pidx);
  if (paymentRes.success) {
  toast.success("Payment verified!");
  fetchEvents();
  fetchMyRegistrations();
  }
  } catch (err) {
  console.error(err);
  } finally {
  navigate(location.pathname, { replace: true });
  }
  },
  [
  verifyKhalti,
  fetchEvents,
  fetchMyRegistrations,
  navigate,
  location.pathname,
  ],
  );

  useEffect(() => {
  fetchEvents();
  fetchMyRegistrations();
  fetchRecommendedEvents();

  const query = new URLSearchParams(location.search);
  const pidx = query.get("pidx");
  const status = query.get("status");

  if (pidx && status === "Completed") {
  verifyPayment(pidx);
  }
  }, [
  fetchEvents,
  fetchMyRegistrations,
  fetchRecommendedEvents,
  verifyPayment,
  location.search,
  ]);

  // Logic for Next Event
  const nextEvent = useMemo(() => {
  if (!myRegistrations) return null;
  const upcoming = myRegistrations
  .filter(r => new Date(r.event?.eventDate) > new Date())
  .sort((a, b) => new Date(a.event?.eventDate) - new Date(b.event?.eventDate));
  return upcoming[0]?.event;
  }, [myRegistrations]);

  // Upcoming registrations
  const upcomingRegistrations = useMemo(() => {
  if (!myRegistrations) return [];
  return myRegistrations
  .filter(r => new Date(r.event?.eventDate) > new Date())
  .sort((a, b) => new Date(a.event?.eventDate) - new Date(b.event?.eventDate));
  }, [myRegistrations]);

  // Past registrations
  const pastRegistrations = useMemo(() => {
  if (!myRegistrations) return [];
  return myRegistrations
  .filter(r => new Date(r.event?.eventDate) <= new Date())
  .sort((a, b) => new Date(b.event?.eventDate) - new Date(a.event?.eventDate));
  }, [myRegistrations]);

  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
  if (!nextEvent) return;
  
  const calculateTime = () => {
  const now = new Date().getTime();
  const eventDate = new Date(nextEvent.eventDate).getTime();
  const distance = eventDate - now;

  if (distance < 0) return { days: 0, hours: 0, mins: 0 };

  return {
  days: Math.floor(distance / (1000 * 60 * 60 * 24)),
  hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
  mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  };
  };

  setTimeLeft(calculateTime());
  const timer = setInterval(() => setTimeLeft(calculateTime()), 60000);
  return () => clearInterval(timer);
  }, [nextEvent]);

  // Tailwind cannot generate classes built at runtime, so the full class
  // strings for every stat colour are listed here.
  const STAT_THEMES = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  };

  // Stats
  const stats = [
  {
  label: "Total Registrations",
  value: myRegistrations?.length || 0,
  icon: BookmarkCheck,
  theme: STAT_THEMES.indigo,
  },
  {
  label: "Upcoming Events",
  value: upcomingRegistrations.length,
  icon: Calendar,
  theme: STAT_THEMES.emerald,
  },
  {
  label: "Attended Events",
  value: pastRegistrations.length,
  icon: Award,
  theme: STAT_THEMES.amber,
  },
  ];

  if (eventsLoading) {
  return (
  <div className="flex items-center justify-center py-20">
  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
  </div>
  );
  }

  return (
  <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
  
  {/* Quick Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {stats.map((stat, i) => (
  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex items-center gap-6">
  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${stat.theme}`}>
  <stat.icon size={24} />
  </div>
  <div>
  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
  <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h4>
  </div>
  </div>
  ))}
  </div>

  <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
  
  {/* Next Event Countdown Banner */}
  <div className="xl:col-span-8 group relative overflow-hidden bg-linear-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-10 shadow-2xl shadow-indigo-100 min-h-[350px] flex flex-col justify-between">
  <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-12" />
  
  <div className="relative z-10 space-y-8">
  <div className="space-y-4">
  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Target Event Arrival</p>
  {nextEvent ? (
  <div className="flex items-center gap-8">
  <div className="text-center">
  <h2 className="text-6xl font-black text-white tracking-tighter tabular-nums">{String(timeLeft.days).padStart(2, '0')}</h2>
  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Days</p>
  </div>
  <div className="text-white/20 text-4xl font-light mb-6">:</div>
  <div className="text-center">
  <h2 className="text-6xl font-black text-white tracking-tighter tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</h2>
  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Hours</p>
  </div>
  <div className="text-white/20 text-4xl font-light mb-6">:</div>
  <div className="text-center">
  <h2 className="text-6xl font-black text-white tracking-tighter tabular-nums">{String(timeLeft.mins).padStart(2, '0')}</h2>
  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Mins</p>
  </div>
  </div>
  ) : (
  <h2 className="text-3xl font-black text-white/60 tracking-tighter italic">No Active Nodes In Range</h2>
  )}
  </div>

  <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 flex items-center justify-between gap-6">
  <div className="flex-1 min-w-0">
  <h3 className="text-xl font-black text-white tracking-tight mb-2 truncate">
  {nextEvent?.title || "Initialize New Session Search"}
  </h3>
  <p className="text-[11px] font-bold text-white/70 truncate flex items-center gap-2 uppercase tracking-widest">
  <MapPin size={14} className="text-indigo-300 shrink-0" />
  {nextEvent?.venue || nextEvent?.district || "Explore the market for events"}
  </p>
  </div>
  <button 
  onClick={() => nextEvent && navigate(`/event/${nextEvent._id}`)}
  className="w-16 h-16 bg-white text-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 shrink-0"
  >
  <ArrowRight size={28} />
  </button>
  </div>
  </div>
  </div>

  <div className="xl:col-span-4 flex flex-col gap-6">
  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-between flex-1 relative overflow-hidden group">
  <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-50/50 rounded-br-full blur-2xl" />
  
  <div className="relative z-10 text-center w-full pt-4">
  {/* Centered Avatar */}
  <div className="w-28 h-28 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl mx-auto mb-6 border-4 border-white overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
  {user?.profilePicture ? (
  <img src={getImageUrl(user.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
  ) : (
  user?.name?.charAt(0).toUpperCase()
  )}
  </div>

  <h4 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic mb-1">{user?.name}</h4>
  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">{user?.college || "Global Participant"}</p>

  {/* Interested In Section */}
  <div className="space-y-4">
  <div className="flex items-center justify-center gap-2">
  <div className="h-[1px] w-4 bg-slate-100" />
  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Interested In</p>
  <div className="h-[1px] w-4 bg-slate-100" />
  </div>
  
  <div className="flex flex-wrap justify-center gap-1.5">
  {user?.interestedSkills?.length > 0 ? (
  user.interestedSkills.slice(0, 4).map((skill, i) => (
  <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100">
  {skill}
  </span>
  ))
  ) : (
  <span className="text-[8px] font-bold text-slate-300 uppercase italic">No Interests Defined</span>
  )}
  </div>
  </div>
  </div>

  <button 
  onClick={() => navigate('/profile')} 
  className="w-full mt-10 py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100/50 flex items-center justify-center gap-2 group/btn"
  >
  About Me <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
  </button>
  </div>
  </div>
  </div>

  {/* --- RECOMMENDED FOR YOU (Based on Tags) --- */}
  <section className="space-y-8">
  <div className="flex items-center justify-between px-2">
  <h3 className="text-xl font-black tracking-tight uppercase italic">Recommended <span className="text-indigo-600">For You</span></h3>
  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Based on your interests</p>
  </div>
  
  {recommendedEvents?.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {recommendedEvents.slice(0, 3).map((event, i) => (
  <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group flex flex-col gap-4">
  <div className="aspect-video bg-slate-50 rounded-2xl overflow-hidden shadow-inner shrink-0 group-hover:scale-[1.02] transition-transform duration-500 relative">
  <img src={normalizePoster(event.poster)} className="w-full h-full object-cover" alt="" />
  <div className="absolute top-4 left-4">
  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 shadow-sm">
  {event.category}
  </span>
  </div>
  </div>
  <div className="flex-1 space-y-3">
  <h4 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase line-clamp-1">{event.title}</h4>
  <div className="flex flex-wrap gap-1">
  {event.tags?.slice(0, 3).map((tag, j) => (
  <span key={j} className="text-[7px] font-black text-slate-400 uppercase tracking-widest">#{tag}</span>
  ))}
  </div>
  <button 
  onClick={() => navigate(`/event/${event._id}`)}
  className="w-full py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
  >
  View Node <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
  </button>
  </div>
  </div>
  ))}
  </div>
  ) : (
  <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-[3rem] text-center">
  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">No Matching Nodes Found</p>
  </div>
  )}
  </section>

  {/* --- NEAR EVENT SESSIONS (Upcoming) --- */}
  <section className="space-y-8">
  <div className="flex items-center justify-between px-2">
  <h3 className="text-xl font-black tracking-tight uppercase italic">Upcoming <span className="text-indigo-600">Sessions</span></h3>
  <Link to="/registered-events" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">View Timeline</Link>
  </div>
  
  {upcomingRegistrations.length > 0 ? (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {upcomingRegistrations.slice(0, 2).map((reg, i) => (
  <div key={i} className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm hover:shadow-xl transition-all flex items-center gap-8 group">
  <div className="w-24 h-32 bg-slate-50 rounded-3xl overflow-hidden shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500">
  <img src={normalizePoster(reg.event?.poster)} className="w-full h-full object-cover" alt="" />
  </div>
  <div className="flex-1 min-w-0">
  <div className="flex items-center gap-3 mb-3">
  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-100 italic">Confirmed</span>
  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate italic">{new Date(reg.event?.eventDate).toLocaleDateString()}</span>
  </div>
  <h4 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase truncate">{reg.event?.title}</h4>
  <p className="text-[10px] text-slate-500 font-bold mt-2 truncate flex items-center gap-2 italic uppercase">
  <MapPin size={12} className="text-slate-300" /> {reg.event?.district}
  </p>
  </div>
  </div>
  ))}
  </div>
  ) : (
  <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-16 rounded-[4rem] text-center">
  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">No Upcoming Nodes Scheduled</p>
  </div>
  )}
  </section>

  {/* --- PAST PARTICIPATIONS SECTION --- */}
  <section className="space-y-8">
  <h3 className="text-xl font-black tracking-tight px-2 uppercase">Past Participations</h3>
  <div className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-sm">
  <div className="overflow-x-auto">
  <table className="w-full text-left border-collapse">
  <thead>
  <tr className="bg-slate-50/50">
  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Node Name</th>
  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Status</th>
  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Date</th>
  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Actions</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-slate-50">
  {pastRegistrations?.length > 0 ? (
  pastRegistrations.map((reg, i) => (
  <tr key={i} className="hover:bg-slate-50 transition-colors group">
  <td className="px-8 py-6">
  <div className="flex items-center gap-4">
  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
  <Zap size={18} />
  </div>
  <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate max-w-xs">{reg.event?.title}</span>
  </div>
  </td>
  <td className="px-8 py-6">
  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-md text-[8px] font-black uppercase tracking-widest border border-slate-200 italic">
  Completed
  </span>
  </td>
  <td className="px-8 py-6 text-center text-sm text-slate-500 font-bold tracking-tight italic">
  {new Date(reg.event?.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
  </td>
  <td className="px-8 py-6 text-right">
  <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
  <Download size={18} />
  </button>
  </td>
  </tr>
  ))
  ) : (
  <tr>
  <td colSpan={5} className="px-8 py-20 text-center">
  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">No historical nodes detected.</p>
  </td>
  </tr>
  )}
  </tbody>
  </table>
  </div>
  </div>
  </section>
  </div>
  );
};

export default Dashboard;
