import React, { useRef } from "react";
import { AlertCircle } from "lucide-react";
import HorizontalEventCard from "./HorizontalEventCard";

/**
 *  Horizontal Event Scroll Container (Responsive)
 * Displays multiple event cards in a horizontally scrollable container
 */
const HorizontalEventScroll = ({
  events = [],
  onDelete,
  onView,
  onEdit,
  loading = false,
  error = null,
  isDeleting = false,
}) => {
  const scrollContainerRef = useRef(null);

  if (loading) {
  return (
  <div className="space-y-4">
  <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse w-1/3"></div>
  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
  {[1, 2, 3, 4].map((i) => (
  <div
  key={i}
  className="flex-shrink-0 w-full max-w-md lg:max-w-lg h-80 bg-slate-100 rounded-xl animate-pulse"
  ></div>
  ))}
  </div>
  </div>
  );
  }

  if (error) {
  return (
  <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl flex flex-col items-center gap-4 text-center">
  <div className="p-3 bg-rose-100 rounded-full">
  <AlertCircle size={32} className="text-rose-600" />
  </div>
  <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">
  Error Loading Events
  </h3>
  <p className="text-sm font-bold text-rose-700">{error}</p>
  </div>
  );
  }

  if (!events || events.length === 0) {
  return (
  <div className="bg-indigo-50 border border-indigo-100 p-12 rounded-2xl flex flex-col items-center gap-4 text-center">
  <div className="text-5xl"></div>
  <h3 className="text-lg font-black text-indigo-900 uppercase tracking-tight">
  No Events Created Yet
  </h3>
  <p className="text-sm font-bold text-indigo-700 max-w-md">
  Start creating events to see them here in a horizontal scrollable
  layout.
  </p>
  </div>
  );
  }

  return (
  <div className="relative group">
  {/* Scrollable Container */}
  <div
  ref={scrollContainerRef}
  className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 px-2 sm:px-0 scrollbar-hide scroll-smooth snap-x snap-mandatory"
  style={{
  scrollBehavior: "smooth",
  WebkitOverflowScrolling: "touch",
  }}
  >
  {events.map((event) => (
  <div key={event._id} className="snap-start">
  <HorizontalEventCard
  event={event}
  onDelete={onDelete}
  onView={onView}
  onEdit={onEdit}
  isDeleting={isDeleting}
  />
  </div>
  ))}
  </div>

  {/* Scroll Indicator */}
  <div className="mt-4 text-center">
  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
  {events.length} Event{events.length !== 1 ? "s" : ""} Created
  </p>
  </div>
  </div>
  );
};

export default HorizontalEventScroll;
