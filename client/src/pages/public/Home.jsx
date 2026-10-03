import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Code2,
  Globe,
  Cpu,
  Star,
} from "lucide-react";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import useEvents from "../../hooks/useEvents";

//  Helpers 
const formatDate = (d) =>
  d
  ? new Date(d).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  })
  : "TBD";

//  Animated Counter Hook 
const useCountUp = (target, duration = 2200, started = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
  if (!started) return;
  let startTime = null;
  const step = (timestamp) => {
  if (!startTime) startTime = timestamp;
  const progress = Math.min((timestamp - startTime) / duration, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  setCount(Math.floor(eased * target));
  if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
};

//  Stats Data 
const STATS_DATA = [
  { target: 120, suffix: "+", label: "Events Hosted", format: false },
  { target: 3500, suffix: "+", label: "Students Registered", format: true },
  { target: 45, suffix: "+", label: "Active Organizers", format: false },
  { target: 12, suffix: "+", label: "Departments", format: false },
];

//  Single Stat Item 
const StatItem = ({ target, suffix, label, format, started }) => {
  const count = useCountUp(target, 2200, started);
  const display = format && count >= 1000
  ? (count / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  : count.toString();

  return (
  <div className="text-center">
  <div className="text-4xl md:text-5xl font-extrabold text-white mb-1 tabular-nums">
  {display}{suffix}
  </div>
  <div className="text-indigo-200 text-sm font-medium">{label}</div>
  </div>
  );
};

//  Stats Section 
const Stats = () => {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
  const observer = new IntersectionObserver(
  ([entry]) => { if (entry.isIntersecting) setStarted(true); },
  { threshold: 0.4 }
  );
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
  }, []);

  return (
  <section ref={ref} className="bg-indigo-600 py-12">
  <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
  {STATS_DATA.map((s, i) => (
  <StatItem key={i} {...s} started={started} />
  ))}
  </div>
  </section>
  );
};

//  Floating Hero Card 
const FloatingCard = ({ icon: Icon, title, sub, color, delay }) => (
  <div
  className="flex items-center gap-3 bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-slate-100 px-4 py-3"
  style={{ animation: `float 4s ease-in-out ${delay} infinite` }}
  >
  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
  <Icon size={18} className="text-white" />
  </div>
  <div>
  <div className="text-slate-800 font-bold text-sm leading-tight">{title}</div>
  <div className="text-slate-400 text-xs">{sub}</div>
  </div>
  </div>
);

//  Event Card 
const EventCard = ({ event }) => {
  const {
  _id, title, eventDate, deadline, district,
  poster, category, organizer, seats, registeredCount,
  } = event;

  const pct =
  seats && registeredCount ? Math.round((registeredCount / seats) * 100) : null;

  return (
  <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-1 transition-all duration-300">
  {/* Poster */}
  <div className="relative h-48 overflow-hidden bg-indigo-50">
  {poster ? (
  <img
  src={poster}
  alt={title}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  />
  ) : (
  <div className="w-full h-full flex items-center justify-center text-indigo-200">
  <Calendar size={48} />
  </div>
  )}
  <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
  {category}
  </span>
  </div>

  {/* Body */}
  <div className="p-5">
  <h3 className="font-bold text-slate-800 text-base leading-snug mb-3 line-clamp-2">
  {title}
  </h3>

  <div className="flex flex-col gap-1.5 mb-4">
  <div className="flex items-center gap-2 text-slate-500 text-xs">
  <Calendar size={13} className="text-indigo-400 shrink-0" />
  <span>{formatDate(eventDate)}</span>
  </div>
  {district && (
  <div className="flex items-center gap-2 text-slate-500 text-xs">
  <MapPin size={13} className="text-indigo-400 shrink-0" />
  <span>{district}</span>
  </div>
  )}
  {deadline && (
  <div className="flex items-center gap-2 text-slate-500 text-xs">
  <Clock size={13} className="text-indigo-400 shrink-0" />
  <span>Register by {formatDate(deadline)}</span>
  </div>
  )}
  </div>

  {pct !== null && (
  <div className="mb-4">
  <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
  <span className="flex items-center gap-1">
  <Users size={10} /> {registeredCount} registered
  </span>
  <span>{pct}% full</span>
  </div>
  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
  <div
  className={`h-full rounded-full transition-all duration-700 ${
  pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-amber-400" : "bg-indigo-500"
  }`}
  style={{ width: `${pct}%` }}
  />
  </div>
  </div>
  )}

  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
  <div className="flex items-center gap-2">
  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs overflow-hidden shrink-0">
  {organizer?.logo ? (
  <img src={organizer.logo} alt="" className="w-full h-full object-cover" />
  ) : (
  organizer?.name?.charAt(0) || "C"
  )}
  </div>
  <span className="text-xs text-slate-500 truncate max-w-[110px]">
  {organizer?.name || "Official Club"}
  </span>
  </div>
  <Link
  to={`/event/${_id}`}
  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
  >
  View <ArrowRight size={13} />
  </Link>
  </div>
  </div>
  </div>
  );
};

//  Home Page 
const Home = () => {
  const { events, fetchEvents, loading, error } = useEvents();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
  fetchEvents();
  }, [fetchEvents]);

  return (
  <div className="flex flex-col min-h-screen bg-[#F8FAFF]">
  {/* <Navbar /> */}

  {/*  Hero  */}
  <section className="relative bg-white pt-24 pb-0 overflow-hidden border-b border-slate-100 min-h-[92vh] flex items-center">

  {/* Radial glow - top right */}
  <div
  className="pointer-events-none absolute -top-40 -right-40 w-175 h-175 rounded-full opacity-25"
  style={{ background: "radial-gradient(circle, #4F46E5 0%, transparent 70%)" }}
  />
  {/* Radial glow - bottom left */}
  <div
  className="pointer-events-none absolute -bottom-40 -left-20 w-125 h-125 rounded-full opacity-10"
  style={{ background: "radial-gradient(circle, #818CF8 0%, transparent 70%)" }}
  />
  {/* Dot grid */}
  <div
  className="pointer-events-none absolute inset-0"
  style={{
  backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
  backgroundSize: "28px 28px",
  opacity: 0.5,
  }}
  />

  <div className="relative max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-10 items-center pb-16 pt-8">

  {/* Left - Text */}
  <div style={{ animation: "slideUp 0.7s ease both" }}>
  <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" style={{ animation: "pulse 2s infinite" }} />
  Nepal's #1 IT Event Platform
  </span>

  <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.07] tracking-tight mb-6">
  Discover Events.
  <br />
  <span className="text-indigo-600 relative inline-block">
  Grow Your Skills.
  <svg viewBox="0 0 320 12" className="absolute -bottom-1 left-0 w-full" fill="none">
  <path d="M2 8 Q80 1 160 8 Q240 15 318 8" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round" />
  </svg>
  </span>
  </h1>

  <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
  Find hackathons, workshops & bootcamps across Nepal - verified, centralized, and built for students.
  </p>

  <div className="flex flex-wrap gap-3 mb-10">
  <Link
  to="/events"
  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
  >
  Browse Events <ArrowRight size={16} />
  </Link>
  {!user && (
  <Link
  to="/signup"
  className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-bold text-sm px-7 py-3.5 rounded-xl transition-all"
  >
  Join Free
  </Link>
  )}
  </div>

  {/* Trust row */}
  {/* <div className="flex items-center gap-3">
  <div className="flex -space-x-2">
  {["A","S","R","N","P"].map((l, i) => (
  <div
  key={i}
  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
  style={{ background: ["#3B82F6","#6366F1","#8B5CF6","#0EA5E9","#10B981"][i] }}
  >
  {l}
  </div>
  ))}
  </div>
  <div>
  <div className="flex items-center gap-0.5">
  {[...Array(5)].map((_, i) => (
  <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
  ))}
  </div>
  <span className="text-slate-400 text-xs">Trusted by 3,500+ students</span>
  </div>
  </div> */}
  </div>

  {/* Right - Illustration */}
  <div
  className="relative hidden md:flex items-center justify-center"
  style={{ animation: "slideUp 0.9s ease both" }}
  >
  {/* Central circle */}
  <div
  className="relative w-80 h-80 rounded-full flex items-center justify-center"
  style={{
  background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
  border: "2px solid #C7D2FE",
  }}
  >
  {/* Dashed spinning ring */}
  <div
  className="absolute w-64 h-64 rounded-full border-2 border-dashed border-indigo-200"
  style={{ animation: "spin 22s linear infinite" }}
  />

  {/* SVG illustration */}
  <svg
  viewBox="0 0 200 200"
  className="w-52 h-52 relative z-10"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  >
  {/* Monitor body */}
  <rect x="38" y="52" width="124" height="84" rx="9" fill="#4338CA" />
  <rect x="46" y="60" width="108" height="68" rx="5" fill="#EEF2FF" />
  {/* Calendar grid on screen */}
  <rect x="54" y="68" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="72" y="68" width="13" height="13" rx="2" fill="#4F46E5" />
  <rect x="90" y="68" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="108" y="68" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="126" y="68" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="54" y="86" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="72" y="86" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="90" y="86" width="13" height="13" rx="2" fill="#4F46E5" />
  <rect x="108" y="86" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="126" y="86" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="54" y="104" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="72" y="104" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="90" y="104" width="13" height="13" rx="2" fill="#C7D2FE" />
  <rect x="108" y="104" width="13" height="13" rx="2" fill="#4F46E5" />
  <rect x="126" y="104" width="13" height="13" rx="2" fill="#C7D2FE" />
  {/* Stand */}
  <rect x="91" y="136" width="18" height="12" rx="2" fill="#4338CA" />
  <rect x="74" y="148" width="52" height="6" rx="3" fill="#4338CA" />
  {/* Avatar head */}
  <circle cx="100" cy="26" r="15" fill="#FDE68A" />
  {/* Avatar body */}
  <rect x="82" y="39" width="36" height="18" rx="8" fill="#4F46E5" />
  {/* Notification badge */}
  <circle cx="150" cy="58" r="8" fill="#EF4444" />
  <text x="146.5" y="62.5" fontSize="8.5" fill="white" fontWeight="bold">2</text>
  </svg>

  {/* Animated dots */}
  <div
  className="absolute w-3.5 h-3.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-200"
  style={{ top: "10%", right: "8%", animation: "bob 5s ease-in-out infinite" }}
  />
  <div
  className="absolute w-2.5 h-2.5 rounded-full bg-indigo-400"
  style={{ bottom: "12%", left: "6%", animation: "bob 7s ease-in-out 1s infinite" }}
  />
  <div
  className="absolute w-2 h-2 rounded-full bg-sky-400"
  style={{ top: "45%", right: "-2%", animation: "bob 6s ease-in-out 0.5s infinite" }}
  />
  </div>

  {/* Floating event cards */}
  <div className="absolute -left-8 top-6">
  <FloatingCard icon={Zap} title="HackFest 2026" sub="148 / 200 seats" color="bg-indigo-500" delay="0s" />
  </div>
  <div className="absolute -right-8 top-20">
  <FloatingCard icon={Code2} title="Open Source Bootcamp" sub="Kathmandu · Jun 1" color="bg-indigo-500" delay="1.4s" />
  </div>
  <div className="absolute -left-6 bottom-14">
  <FloatingCard icon={Globe} title="AI & ML Summit" sub="300 seats available" color="bg-sky-500" delay="0.7s" />
  </div>
  <div className="absolute right-0 bottom-2">
  <FloatingCard icon={Cpu} title="CTF Challenge" sub="Only 5 seats left!" color="bg-violet-500" delay="2s" />
  </div>
  </div>
  </div>

  {/* Wave into stats bar */}
  <svg
  viewBox="0 0 1440 56"
  className="absolute bottom-0 left-0 w-full"
  preserveAspectRatio="none"
  style={{ height: 56 }}
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  >
  <path d="M0 56 L0 28 Q360 0 720 28 Q1080 56 1440 28 L1440 56 Z" fill="#4F46E5" />
  </svg>
  </section>

  {/*  Stats  */}
  <Stats />

  {/*  Featured Events  */}
  <section className="py-16 px-6 max-w-6xl mx-auto w-full">
  <div className="flex items-center justify-between mb-8">
  <div>
  <div className="flex items-center gap-2 mb-2">
  <TrendingUp size={15} className="text-indigo-500" />
  <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Featured</span>
  </div>
  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
  Upcoming Events
  </h2>
  </div>
  <Link
  to="/events"
  className="hidden md:flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition-colors"
  >
  View all <ArrowRight size={15} />
  </Link>
  </div>

  {loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {[1, 2, 3].map((i) => (
  <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
  ))}
  </div>
  ) : error ? (
  <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center">
  <p className="text-red-500 font-medium mb-4">{error}</p>
  <button
  onClick={() => fetchEvents()}
  className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
  >
  Try Again
  </button>
  </div>
  ) : Array.isArray(events) && events.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {events.slice(0, 6).map((event) => (
  <EventCard key={event._id || event.id} event={event} />
  ))}
  </div>
  ) : (
  <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center">
  <Calendar size={40} className="text-indigo-200 mx-auto mb-4" />
  <h3 className="font-bold text-slate-700 text-lg mb-2">No events yet</h3>
  <p className="text-slate-400 text-sm mb-6">Check back soon for upcoming events.</p>
  <Link
  to="/events"
  className="bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors inline-block"
  >
  Explore Events
  </Link>
  </div>
  )}

  {Array.isArray(events) && events.length > 0 && (
  <div className="mt-8 text-center md:hidden">
  <Link to="/events" className="text-indigo-600 font-semibold text-sm flex items-center gap-1.5 justify-center">
  View all events <ArrowRight size={15} />
  </Link>
  </div>
  )}
  </section>

  {/*  CTA Banner  */}
  {!user && (
  <section className="px-6 pb-16 max-w-6xl mx-auto w-full">
  <div className="bg-indigo-600 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
  <div
  className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20"
  style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
  />
  <div className="relative">
  <h3 className="text-white text-2xl font-extrabold mb-2">Ready to get started?</h3>
  <p className="text-indigo-100 text-sm">
  Join thousands of students discovering IT events across Nepal.
  </p>
  </div>
  <div className="flex gap-3 shrink-0 relative">
  <Link
  to="/signup"
  className="bg-white text-indigo-600 font-bold text-sm px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
  >
  Create Account
  </Link>
  <Link
  to="/events"
  className="border border-indigo-400 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
  >
  Browse Events
  </Link>
  </div>
  </div>
  </section>
  )}

  <Footer />

  <style>{`
  @keyframes slideUp {
  from { opacity: 0; transform: translateY(28px); }
  to  { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%  { transform: translateY(-8px); }
  }
  @keyframes bob {
  0%, 100% { transform: translateY(0px); }
  50%  { transform: translateY(-10px); }
  }
  @keyframes spin {
  from { transform: rotate(0deg); }
  to  { transform: rotate(360deg); }
  }
  @keyframes pulse {
  0%, 100% { opacity: 1; }
  50%  { opacity: 0.3; }
  }
  `}</style>
  </div>
  );
};

export default Home;