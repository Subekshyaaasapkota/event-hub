import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  ArrowLeft,
  PieChart,
  Eye,
  Clock,
  MapPin,
  Award,
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import useAuth from "../../hooks/useAuth";
import useOrganizer from "../../hooks/useOrganizer";
import ClubSidebar from "./ClubSidebar";

const EventAnalytics = () => {
  const { loading: authLoading } = useAuth();
  const {
  fetchOrganizerEvents,
  fetchClubRegistrations,
  orgEvents,
  registrations,
  loading: eventsLoading,
  } = useOrganizer();

  useEffect(() => {
  fetchOrganizerEvents();
  fetchClubRegistrations();
  }, [fetchOrganizerEvents, fetchClubRegistrations]);

  // Analytics Computations
  const totalEvents = orgEvents?.length || 0;
  const activeEvents = orgEvents?.filter((e) => new Date(e.eventDate) > new Date()).length || 0;
  const totalRegistrations = registrations?.length || 0;
  const avgRegistrationsPerEvent =
  totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0;
  
  // Calculate exact registration counts from registrations array
  const registrationCountByEvent = useMemo(() => {
  const counts = {};
  if (registrations) {
  registrations.forEach(reg => {
  if (reg.event && reg.event._id) {
  counts[reg.event._id] = (counts[reg.event._id] || 0) + 1;
  }
  });
  }
  return counts;
  }, [registrations]);

  const totalCapacity = orgEvents?.reduce((sum, e) => sum + (e.participantCount || 50), 0) || 0;
  const overallFillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  // Most popular events based on actual registrations
  const sortedEvents = useMemo(() => {
  if (!orgEvents) return [];
  return [...orgEvents].sort((a, b) => {
  const aCount = registrationCountByEvent[a._id] || 0;
  const bCount = registrationCountByEvent[b._id] || 0;
  return bCount - aCount;
  });
  }, [orgEvents, registrationCountByEvent]);

  // Registration Trend Data (Last 7 Days)
  const trendData = useMemo(() => {
  if (!registrations) return [];
  
  const last7Days = [...Array(7)].map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return d.toISOString().split('T')[0];
  });

  const countsByDay = registrations.reduce((acc, reg) => {
  const date = new Date(reg.createdAt);
  if (isNaN(date.getTime())) return acc;
  const day = date.toISOString().split('T')[0];
  acc[day] = (acc[day] || 0) + 1;
  return acc;
  }, {});

  return last7Days.map(day => ({
  name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
  registrations: countsByDay[day] || 0,
  fullDate: day
  }));
  }, [registrations]);

  // Detailed Insights
  const peakDay = useMemo(() => {
  if (trendData.length === 0) return "N/A";
  const max = [...trendData].sort((a, b) => b.registrations - a.registrations)[0];
  return max.registrations > 0 ? max.name + "s" : "N/A";
  }, [trendData]);

  const topDistrict = useMemo(() => {
  if (!registrations || registrations.length === 0) return "N/A";
  const districts = registrations.reduce((acc, reg) => {
  const dist = reg.user?.district || "Unknown";
  acc[dist] = (acc[dist] || 0) + 1;
  return acc;
  }, {});
  const sorted = Object.entries(districts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : "N/A";
  }, [registrations]);

  const topEvents = sortedEvents.slice(0, 5);

  if (authLoading) {
  return (
  <div className="h-screen flex items-center justify-center bg-[#FDFDFF]">
  <div className="flex flex-col items-center gap-4">
  <Activity size={48} className="text-indigo-600 animate-spin" />
  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Analytics...</p>
  </div>
  </div>
  );
  }

  return (
  <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
  <ClubSidebar />

  <div className="flex-1 p-8 lg:p-12 overflow-auto">
  {eventsLoading ? (
  <div className="h-full flex flex-col items-center justify-center">
  <Activity size={48} className="text-indigo-600 animate-spin mb-4" />
  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Analytics Data...</p>
  </div>
  ) : (
  <>
  {/* Header */}
  <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
  <div>
  <div className="flex items-center gap-3 mb-2">
  <Link to="/club/dashboard" className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 text-slate-500 transition-colors">
  <ArrowLeft size={20} />
  </Link>
  <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
  <BarChart3 className="text-indigo-600" size={32} />
  Event Analytics
  </h1>
  </div>
  <p className="text-slate-500 font-bold ml-14">
  Comprehensive overview of your event performance and audience engagement.
  </p>
  </div>
  
  <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
  <Activity size={20} />
  </div>
  <div>
  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Overall Status</p>
  <p className="font-bold text-slate-900 text-sm">Performing Above Average</p>
  </div>
  </div>
  </header>

  {/* Top KPI Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
  {[
  { label: "Total Registrations", value: totalRegistrations, icon: Users, color: "indigo" },
  { label: "Average Fill Rate", value: `${overallFillRate}%`, icon: PieChart, color: "emerald" },
  { label: "Total Events", value: totalEvents, icon: Calendar, color: "amber" },
  { label: "Active Events", value: activeEvents, icon: TrendingUp, color: "rose" },
  ].map((stat, i) => {
  const colors = {
  indigo: "from-indigo-50 to-indigo-100/50 text-indigo-600 bg-indigo-100",
  emerald: "from-emerald-50 to-emerald-100/50 text-emerald-600 bg-emerald-100",
  amber: "from-amber-50 to-amber-100/50 text-amber-600 bg-amber-100",
  rose: "from-rose-50 to-rose-100/50 text-rose-600 bg-rose-100"
  }[stat.color];
  
  const [bgGradient, textColor, iconBg] = colors.split(" text-").join("|").split(" bg-").join("|").split("|");
  
  return (
  <div key={i} className={`bg-gradient-to-br ${bgGradient} rounded-[2rem] p-6 border border-white/60 shadow-sm hover:shadow-lg transition-all`}>
  <div className="flex items-center gap-4 mb-4">
  <div className={`p-3 rounded-xl ${iconBg}`}>
  <stat.icon size={24} className={textColor} />
  </div>
  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
  </div>
  <h3 className="text-4xl font-black text-slate-900 ml-1">{stat.value}</h3>
  </div>
  );
  })}
  </div>

  {/* Two Column Layout */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Main Chart Area Placeholder */}
  <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-6">
  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
  <TrendingUp size={20} className="text-indigo-600" /> Registration Trends
  </h3>
  <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-indigo-500/20">
  <option>Last 30 Days</option>
  <option>All Time</option>
  </select>
  </div>
  
  <div className="h-64 w-full">
  <ResponsiveContainer width="100%" height="100%">
  <BarChart data={trendData}>
  <defs>
  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="#4f46e5" stopOpacity={1}/>
  <stop offset="100%" stopColor="#9333ea" stopOpacity={1}/>
  </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
  <XAxis 
  dataKey="name" 
  axisLine={false} 
  tickLine={false} 
  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
  dy={10}
  />
  <YAxis 
  axisLine={false} 
  tickLine={false} 
  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
  />
  <Tooltip 
  cursor={{fill: '#f8fafc'}}
  contentStyle={{
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  padding: '12px'
  }}
  />
  <Bar 
  dataKey="registrations" 
  fill="url(#barGradient)" 
  radius={[6, 6, 0, 0]} 
  barSize={32}
  >
  {trendData.map((entry, index) => (
  <Cell key={`cell-${index}`} fillOpacity={entry.registrations > 0 ? 1 : 0.3} />
  ))}
  </Bar>
  </BarChart>
  </ResponsiveContainer>
  </div>
  
  <div className="grid grid-cols-3 gap-4">
  {[
  { label: "Peak Reg. Day", value: peakDay },
  { label: "Most Active Dist.", value: topDistrict },
  { label: "Avg Reg./Event", value: avgRegistrationsPerEvent }
  ].map((item, i) => (
  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{item.label}</p>
  <p className="font-bold text-slate-800">{item.value}</p>
  </div>
  ))}
  </div>
  </div>

  {/* Top Events Sidebar */}
  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
  
  <div className="relative z-10 flex items-center gap-3 mb-8">
  <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
  <Award size={20} className="text-indigo-300" />
  </div>
  <h3 className="font-black tracking-tight text-xl">Top Events</h3>
  </div>

  <div className="space-y-4 relative z-10">
  {topEvents.length > 0 ? (
  topEvents.map((event, idx) => (
  <div key={event._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
  <div className="flex items-center gap-3 mb-2">
  <div className="w-6 h-6 rounded-full bg-indigo-500/40 text-xs font-black flex items-center justify-center border border-indigo-400/50">
  {idx + 1}
  </div>
  <h4 className="font-bold text-sm truncate flex-1">{event.title}</h4>
  </div>
  <div className="pl-9 flex items-center justify-between text-xs">
  <span className="text-indigo-200 font-medium flex items-center gap-1.5">
  <Users size={12} /> {registrationCountByEvent[event._id] || 0} Reg.
  </span>
  <span className="text-emerald-300 font-black">
  {Math.round(((registrationCountByEvent[event._id] || 0) / (event.participantCount || 50)) * 100)}% Filled
  </span>
  </div>
  </div>
  ))
  ) : (
  <div className="text-center py-8 text-indigo-200/60 font-medium text-sm">
  No events to display
  </div>
  )}
  </div>
  </div>
  </div>
  </>
  )}
  </div>
  </div>
  );
};

export default EventAnalytics;
