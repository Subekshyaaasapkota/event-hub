import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const EventCalendar = ({ events }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
  setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
  setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  const totalDays = daysInMonth(month, year);
  const startDay = firstDayOfMonth(month, year);

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
  days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= totalDays; i++) {
  days.push(i);
  }

  // Function to check if a date has events or deadlines
  const getDayData = (day) => {
  if (!day) return { dayEvents: [], dayDeadlines: [] };
  const dateStr = new Date(year, month, day).toDateString();

  const dayEvents = (events || []).filter(e => e.eventDate && new Date(e.eventDate).toDateString() === dateStr);
  const dayDeadlines = (events || []).filter(e => e.deadline && new Date(e.deadline).toDateString() === dateStr);

  return { dayEvents, dayDeadlines };
  };

  return (
  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-indigo-100/50 p-8 md:p-12">
  <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
  <CalendarIcon size={24} />
  </div>
  <div>
  <h3 className="text-2xl font-black text-slate-800">{monthNames[month]} {year}</h3>
  <p className="text-slate-400 text-sm font-medium">Event Roadmap</p>
  </div>
  </div>

  <div className="flex items-center gap-3">
  <button
  onClick={prevMonth}
  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all font-bold"
  >
  <ChevronLeft size={20} />
  </button>
  <button
  onClick={() => setCurrentDate(new Date())}
  className="px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
  >
  Today
  </button>
  <button
  onClick={nextMonth}
  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all font-bold"
  >
  <ChevronRight size={20} />
  </button>
  </div>
  </div>

  {/* Weekdays */}
  <div className="grid grid-cols-7 mb-4">
  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
  <div key={d} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 py-4">
  {d}
  </div>
  ))}
  </div>

  {/* Calendar Grid */}
  <div className="grid grid-cols-7 gap-2 md:gap-4">
  {days.map((day, idx) => {
  if (day === null) return <div key={`empty-${idx}`} className="aspect-square"></div>;

  const { dayEvents, dayDeadlines } = getDayData(day);
  const dateObj = new Date(year, month, day);
  const isToday = new Date().toDateString() === dateObj.toDateString();
  const hasEvent = dayEvents.length > 0;
  const hasDeadline = dayDeadlines.length > 0;

  let bgColor = "bg-white";
  let textColor = "text-slate-700";
  let borderColor = "border-slate-50";

  if (isToday) {
  bgColor = "bg-blue-50";
  textColor = "text-blue-700";
  borderColor = "border-blue-200";
  } else if (hasEvent) {
  bgColor = "bg-emerald-50";
  textColor = "text-emerald-700";
  borderColor = "border-emerald-200";
  } else if (hasDeadline) {
  bgColor = "bg-rose-50";
  textColor = "text-rose-700";
  borderColor = "border-rose-200";
  }

  return (
  <div
  key={day}
  className={`relative aspect-square rounded-2xl md:rounded-3xl border ${borderColor} flex flex-col items-center justify-center group transition-all ${bgColor} hover:scale-105 hover:shadow-lg transition-transform duration-300 cursor-default`}
  >
  <span className={`text-sm md:text-lg font-black ${textColor}`}>
  {day}
  </span>

  {/* Indicators */}
  <div className="flex gap-1 mt-1.5">
  {dayEvents.length > 0 && (
  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
  )}
  {dayDeadlines.length > 0 && (
  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
  )}
  </div>

  {/* Hover Tooltip */}
  {(dayEvents.length > 0 || dayDeadlines.length > 0) && (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 md:w-64 bg-slate-900 text-white rounded-2xl p-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 shadow-2xl">
  <div className="space-y-3">
  {dayEvents.map(e => (
  <div
  key={e._id || e.id}
  onClick={(ev) => {
  ev.stopPropagation();
  navigate(`/event/${e._id || e.id}`);
  }}
  className="group/item cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors border-l-4 border-emerald-500 flex justify-between items-center"
  >
  <div className="min-w-0">
  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Event Date</p>
  <p className="text-sm font-bold truncate leading-tight pr-2">{e.title}</p>
  </div>
  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity">
  View
  </span>
  </div>
  ))}
  {dayDeadlines.map(e => (
  <div
  key={e._id || e.id}
  onClick={(ev) => {
  ev.stopPropagation();
  navigate(`/event/${e._id || e.id}`);
  }}
  className="group/item cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors border-l-4 border-rose-500 flex justify-between items-center"
  >
  <div className="min-w-0">
  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Reg. Deadline</p>
  <p className="text-sm font-bold truncate leading-tight pr-2">{e.title}</p>
  </div>
  <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-1 rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity">
  View
  </span>
  </div>
  ))}
  </div>
  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
  </div>
  )}
  </div>
  );
  })}
  </div>

  {/* Legend */}
  <div className="mt-12 flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-slate-50">
  <div className="flex items-center gap-2">
  <div className="w-4 h-4 rounded-md bg-blue-50 border border-blue-200"></div>
  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Day</span>
  </div>
  <div className="flex items-center gap-2">
  <div className="w-4 h-4 rounded-md bg-emerald-50 border border-emerald-200"></div>
  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Planned Event</span>
  </div>
  <div className="flex items-center gap-2">
  <div className="w-4 h-4 rounded-md bg-rose-50 border border-rose-200"></div>
  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Registration Deadline</span>
  </div>
  </div>
  </div>
  );
};

export default EventCalendar;
