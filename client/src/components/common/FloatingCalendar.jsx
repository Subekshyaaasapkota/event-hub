import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

const FloatingCalendar = ({ events = [] }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const days = [];
  const totalDays = daysInMonth(month, year);
  const startDay = firstDayOfMonth(month, year);
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const getDayData = (day) => {
  if (!day) return { dayEvents: [], dayDeadlines: [] };
  const dateStr = new Date(year, month, day).toDateString();
  const dayEvents = events.filter(
  (e) => e.eventDate && new Date(e.eventDate).toDateString() === dateStr
  );
  const dayDeadlines = events.filter(
  (e) => e.deadline && new Date(e.deadline).toDateString() === dateStr
  );
  return { dayEvents, dayDeadlines };
  };

  return (
  <>
  {/* Backdrop blur overlay */}
  {isOpen && (
  <div
  className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
  onClick={() => setIsOpen(false)}
  />
  )}

  {/* Calendar popup */}
  <div
  className={`fixed bottom-24 right-6 z-50 w-90 bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-indigo-100/50 transition-all duration-300 origin-bottom-right ${
  isOpen
  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
  : "opacity-0 scale-90 translate-y-4 pointer-events-none"
  }`}
  >
  <div className="p-5 max-h-[80vh] overflow-y-auto">
  {/* Header */}
  <div className="flex items-center justify-between mb-5">
  <div className="flex items-center gap-3">
  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
  <CalendarIcon size={18} />
  </div>
  <div>
  <h3 className="text-sm font-black text-slate-800 leading-tight">
  {monthNames[month]} {year}
  </h3>
  <p className="text-[10px] text-slate-400 font-medium">Event Roadmap</p>
  </div>
  </div>
  <div className="flex items-center gap-2">
  <button
  onClick={prevMonth}
  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all"
  >
  <ChevronLeft size={16} />
  </button>
  <button
  onClick={goToday}
  className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
  >
  Today
  </button>
  <button
  onClick={nextMonth}
  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all"
  >
  <ChevronRight size={16} />
  </button>
  </div>
  </div>

  {/* Weekdays */}
  <div className="grid grid-cols-7 mb-2">
  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
  <div
  key={d}
  className="text-center text-[9px] font-black uppercase tracking-widest text-slate-300 py-2"
  >
  {d}
  </div>
  ))}
  </div>

  {/* Calendar grid */}
  <div className="grid grid-cols-7 gap-1.5">
  {days.map((day, idx) => {
  if (day === null)
  return <div key={`empty-${idx}`} className="aspect-square" />;

  const { dayEvents, dayDeadlines } = getDayData(day);
  const dateObj = new Date(year, month, day);
  const isToday = new Date().toDateString() === dateObj.toDateString();
  const hasEvent = dayEvents.length > 0;
  const hasDeadline = dayDeadlines.length > 0;

  let bgColor = "bg-white";
  let textColor = "text-slate-600";
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

  const dayOfWeek = idx % 7;
  let tooltipPositionClass = "left-1/2 -translate-x-1/2";
  let arrowPositionClass = "left-1/2 -translate-x-1/2";
  
  if (dayOfWeek === 0 || dayOfWeek === 1) {
  tooltipPositionClass = "left-0";
  arrowPositionClass = "left-5 -translate-x-1/2";
  } else if (dayOfWeek === 5 || dayOfWeek === 6) {
  tooltipPositionClass = "right-0";
  arrowPositionClass = "right-5 translate-x-1/2";
  }

  return (
  <div
  key={day}
  className={`relative aspect-square rounded-xl border ${borderColor} flex flex-col items-center justify-center group transition-all ${bgColor} hover:scale-105 hover:shadow-md cursor-default`}
  >
  <span className={`text-xs font-black ${textColor}`}>{day}</span>

  {/* Dot indicators */}
  {(hasEvent || hasDeadline) && (
  <div className="flex gap-0.5 mt-1">
  {hasEvent && (
  <div className="w-1 h-1 rounded-full bg-emerald-500" />
  )}
  {hasDeadline && (
  <div className="w-1 h-1 rounded-full bg-rose-500" />
  )}
  </div>
  )}

  {/* Hover tooltip */}
  {(hasEvent || hasDeadline) && (
  <div className={`absolute bottom-full mb-3 w-48 bg-slate-900 text-white rounded-2xl p-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 shadow-2xl ${tooltipPositionClass}`}>
  <div className="space-y-2">
  {dayEvents.map((e) => (
  <div
  key={e._id || e.id}
  onClick={(ev) => {
  ev.stopPropagation();
  navigate(`/event/${e._id || e.id}`);
  setIsOpen(false);
  }}
  className="group/item cursor-pointer hover:bg-white/10 p-1.5 rounded-xl transition-colors border-l-4 border-emerald-500 flex justify-between items-center"
  >
  <div className="min-w-0">
  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">
  Event Date
  </p>
  <p className="text-xs font-bold truncate leading-tight pr-2">
  {e.title}
  </p>
  </div>
  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity">
  View
  </span>
  </div>
  ))}
  {dayDeadlines.map((e) => (
  <div
  key={e._id || e.id}
  onClick={(ev) => {
  ev.stopPropagation();
  navigate(`/event/${e._id || e.id}`);
  setIsOpen(false);
  }}
  className="group/item cursor-pointer hover:bg-white/10 p-1.5 rounded-xl transition-colors border-l-4 border-rose-500 flex justify-between items-center"
  >
  <div className="min-w-0">
  <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">
  Reg. Deadline
  </p>
  <p className="text-xs font-bold truncate leading-tight pr-2">
  {e.title}
  </p>
  </div>
  <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity">
  View
  </span>
  </div>
  ))}
  </div>
  <div className={`absolute top-full border-6 border-transparent border-t-slate-900 ${arrowPositionClass}`} />
  </div>
  )}
  </div>
  );
  })}
  </div>

  {/* Legend */}
  <div className="mt-4 flex flex-wrap items-center justify-center gap-5 pt-4 border-t border-slate-50">
  <div className="flex items-center gap-1.5">
  <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200" />
  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today</span>
  </div>
  <div className="flex items-center gap-1.5">
  <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Event</span>
  </div>
  <div className="flex items-center gap-1.5">
  <div className="w-3 h-3 rounded bg-rose-50 border border-rose-200" />
  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline</span>
  </div>
  </div>
  </div>
  </div>

  {/* FAB trigger button */}
  <button
  onClick={() => setIsOpen((prev) => !prev)}
  className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
  isOpen
  ? "bg-indigo-900 rotate-12 scale-95 shadow-indigo-900/30"
  : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-300"
  }`}
  title="Toggle Event Calendar"
  >
  {isOpen ? (
  <X size={22} className="text-white" />
  ) : (
  <CalendarIcon size={22} className="text-white" />
  )}
  </button>
  </>
  );
};

export default FloatingCalendar;