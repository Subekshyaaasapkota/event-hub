import React, { useEffect, useMemo, useRef, useState } from "react";
import useFocusTrap from "../../hooks/useFocusTrap";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

/*
 * Floating calendar.
 *
 * The previous version put a hover tooltip on each day cell. That looked fine on
 * a desktop and was completely broken in practice:
 *
 *   - The tooltip was absolutely positioned inside a container with
 *     overflow-y-auto, so the scroll container clipped it. It could not reliably
 *     escape its own parent.
 *   - It appeared on group-hover only, so on touch devices there was no hover to
 *     trigger it and the entire feature was undiscoverable. Nothing was
 *     reachable by keyboard either.
 *   - The arrow used border-6, which is not a real Tailwind width, so it never
 *     rendered.
 *   - Ten labels sat at 9px or 10px, and the weekday and legend rows used
 *     slate-300 on white at roughly 2.6:1.
 *   - The trigger button had no accessible name, no aria-expanded and no way to
 *     close the popup with the keyboard.
 *
 * Now a day is a real button, and selecting one shows its events in a panel
 * below the grid. That works the same for a mouse, a finger and a keyboard, and
 * it removes the clipping problem because nothing is absolutely positioned
 * outside the card any more.
 */

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const idOf = (event) => event?._id || event?.id;

// Long form, so a screen reader does not read "12/3/2026".
const longDate = (date) =>
  date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const FloatingCalendar = ({ events = [] }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
const triggerRef = useRef(null);
  // initialFocus null focuses the panel itself, so its aria-label is announced
  // before any individual day. The trigger ref is passed explicitly because
  // Safari does not focus a button on click.
  //
  // Declared after triggerRef on purpose: reading a const before its
  // initialisation throws at render, which lint and the build both accept.
  const dialogRef = useFocusTrap(isOpen, {
    initialFocus: null,
    returnFocusRef: triggerRef,
  });


  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const today = new Date();
  const todayKey = today.toDateString();

  // Events are bucketed by day once per month change, instead of re-filtering
  // the whole list for every cell in the grid.
  const eventsByDay = useMemo(() => {
    const buckets = new Map();

    events.forEach((event) => {
      const add = (value, kind) => {
        if (!value) return;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return;
        const key = parsed.toDateString();
        if (!buckets.has(key)) buckets.set(key, { events: [], deadlines: [] });
        buckets.get(key)[kind].push(event);
      };
      add(event?.eventDate, "events");
      add(event?.deadline, "deadlines");
    });

    return buckets;
  }, [events]);

  const cells = useMemo(() => {
    const total = new Date(year, month + 1, 0).getDate();
    const leading = new Date(year, month, 1).getDay();
    const list = [];

    for (let i = 0; i < leading; i += 1) list.push(null);
    for (let day = 1; day <= total; day += 1) list.push(day);

    return list;
  }, [month, year]);

  const selectedBucket = selectedDay ? eventsByDay.get(selectedDay) : null;
  const selectedEvents = selectedBucket?.events ?? [];
  const selectedDeadlines = selectedBucket?.deadlines ?? [];
  const selectedCount = selectedEvents.length + selectedDeadlines.length;

  const monthEventCount = useMemo(() => {
    let count = 0;
    eventsByDay.forEach((bucket, key) => {
      const parsed = new Date(key);
      if (parsed.getFullYear() === year && parsed.getMonth() === month) {
        count += bucket.events.length;
      }
    });
    return count;
  }, [eventsByDay, month, year]);

  const step = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  const goToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now.toDateString());
  };

  const open = () => {
    // Set here rather than in an effect, so opening does not cost an extra
    // render pass and the panel is never briefly empty.
    setSelectedDay(todayKey);
    setIsOpen(true);
    // Focus used to be moved here, but this runs before React has re-rendered,
    // so dialogRef.current was still null and the panel never received focus.
    // useFocusTrap moves it on the next frame instead.
  };

  const close = () => {
    setIsOpen(false);
    // Focus return is the hook's job now, so it happens on every close path
    // rather than only the ones that remember to call this.
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const openEvent = (event) => {
    navigate(`/event/${idOf(event)}`);
    setIsOpen(false);
  };

  return (
  <>
  {isOpen && (
  <div
  className="fixed inset-0 z-[70] bg-ink/30 backdrop-blur-[2px]"
  onClick={close}
  aria-hidden="true"
  />
  )}

  <section
  ref={dialogRef}
  id="event-calendar-panel"
  role="dialog"
  aria-modal="true"
  aria-label={`Event calendar, ${MONTH_NAMES[month]} ${year}`}
  tabIndex={-1}
  // The panel stays mounted so the closing transition can play, which means it
  // would otherwise stay in the tab order and the accessibility tree while
  // invisible. inert removes both without unmounting.
  inert={!isOpen}
className={`fixed inset-x-4 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] z-[80] mx-auto max-w-sm origin-bottom rounded-2xl border border-hairline bg-white shadow-[0_24px_60px_-24px_rgba(17,17,20,0.45)] outline-none transition-[opacity,transform] duration-200 ease-out sm:inset-x-auto sm:left-6 md:bottom-24 ${

  isOpen
  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
  : "pointer-events-none translate-y-3 scale-[0.97] opacity-0"
  }`}
  >
  {/*
    Capped against the viewport height so the panel can never slide up behind
    the fixed header on a short screen. dvh rather than vh, because mobile
    browser chrome changes what 100vh actually means.
  */}
  <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto overscroll-contain">
  <div className="flex items-start justify-between gap-3 border-b border-hairline p-5">
  <div className="min-w-0">
  <h2 className="font-display text-base font-semibold text-ink">
  {MONTH_NAMES[month]} {year}
  </h2>
  <p className="mt-0.5 text-xs text-stone-600">
  {monthEventCount === 0
  ? "No events scheduled this month"
  : `${monthEventCount} ${monthEventCount === 1 ? "event" : "events"} this month`}
  </p>
  </div>

  <div className="flex shrink-0 items-center gap-1.5">
  <button
  type="button"
  onClick={() => step(-1)}
  className="press inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-hairline text-stone-600 transition-colors duration-200 hover:bg-stone-50 hover:text-ink"
  aria-label={`Previous month, ${MONTH_NAMES[(month + 11) % 12]}`}
  >
  <ChevronLeft size={17} aria-hidden="true" />
  </button>
  <button
  type="button"
  onClick={goToday}
  className="press cursor-pointer rounded-lg bg-stone-100 px-3 py-2 text-xs font-semibold text-ink transition-colors duration-200 hover:bg-stone-200"
  >
  Today
  </button>
  <button
  type="button"
  onClick={() => step(1)}
  className="press inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-hairline text-stone-600 transition-colors duration-200 hover:bg-stone-50 hover:text-ink"
  aria-label={`Next month, ${MONTH_NAMES[(month + 1) % 12]}`}
  >
  <ChevronRight size={17} aria-hidden="true" />
  </button>
  <button
  type="button"
  onClick={close}
  className="press inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-hairline text-stone-600 transition-colors duration-200 hover:bg-stone-50 hover:text-ink"
  aria-label="Close calendar"
  >
  <X size={16} aria-hidden="true" />
  </button>
  </div>
  </div>

  <div className="p-5">
  <div className="grid grid-cols-7 gap-1">
  {WEEKDAYS.map((day) => (
  <div
  key={day}
  className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-stone-500"
  >
  {day}
  </div>
  ))}
  </div>

  <div className="grid grid-cols-7 gap-1">
  {cells.map((day, index) => {
  if (day === null) {
  return <div key={`pad-${index}`} className="aspect-square" aria-hidden="true" />;
  }

  const date = new Date(year, month, day);
  const key = date.toDateString();
  const bucket = eventsByDay.get(key);
  const eventCount = bucket?.events.length ?? 0;
  const deadlineCount = bucket?.deadlines.length ?? 0;
  const isToday = key === todayKey;
  const isSelected = key === selectedDay;
  const total = eventCount + deadlineCount;

  const describe =
  `${MONTH_NAMES[month]} ${day}, ${year}` +
  (isToday ? ", today" : "") +
  (eventCount ? `, ${eventCount} ${eventCount === 1 ? "event" : "events"}` : "") +
  (deadlineCount
  ? `, ${deadlineCount} registration ${deadlineCount === 1 ? "deadline" : "deadlines"}`
  : "");

  return (
  <button
  key={key}
  type="button"
  onClick={() => setSelectedDay(isSelected ? null : key)}
  aria-pressed={isSelected}
  aria-label={describe}
  className={`press relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border text-sm transition-[background-color,border-color,color] duration-200 ${
  isSelected
  ? "border-ink bg-ink text-white"
  : isToday
  ? "border-stone-400 bg-white text-ink"
  : total > 0
  ? "border-hairline bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
  : "border-transparent bg-transparent text-stone-500 hover:bg-stone-100"
  }`}
  >
  <span className={`font-medium ${isToday && !isSelected ? "underline underline-offset-2" : ""}`}>
  {day}
  </span>

  {total > 0 && (
  <span className="mt-1 flex items-center gap-0.5" aria-hidden="true">
  {eventCount > 0 && (
  <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-600"}`} />
  )}
  {deadlineCount > 0 && (
  <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-rose-600"}`} />
  )}
  </span>
  )}
  </button>
  );
  })}
  </div>

  {/* Selected day detail. This replaces the hover tooltip, so it is reachable
      by touch and by keyboard, and it cannot be clipped. */}
  <div className="mt-4 min-h-[92px] rounded-xl border border-hairline bg-paper p-4">
  {selectedDay === null ? (
  <p className="text-sm text-stone-600">
  Pick a day to see what is on.
  </p>
  ) : (
  <>
  <p className="text-xs font-medium text-stone-500">
  {longDate(new Date(selectedDay))}
  </p>

  {selectedCount === 0 ? (
  <p className="mt-2 text-sm text-stone-600">
  Nothing scheduled.
  </p>
  ) : (
  <ul className="mt-2.5 space-y-1.5">
  {selectedEvents.map((event) => (
  <li key={`event-${idOf(event)}`}>
  <button
  type="button"
  onClick={() => openEvent(event)}
  className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-200 hover:bg-white"
  >
  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
  <span className="min-w-0 flex-1">
  <span className="block text-xs font-medium uppercase tracking-wide text-stone-500">
  Event
  </span>
  <span className="block truncate text-sm font-medium text-ink">
  {event.title}
  </span>
  </span>
  <ChevronRight
  size={15}
  aria-hidden="true"
  className="shrink-0 text-stone-400 transition-transform duration-200 group-hover:translate-x-0.5"
  />
  </button>
  </li>
  ))}
  {selectedDeadlines.map((event) => (
  <li key={`deadline-${idOf(event)}`}>
  <button
  type="button"
  onClick={() => openEvent(event)}
  className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-200 hover:bg-white"
  >
  <span className="h-2 w-2 shrink-0 rounded-full bg-rose-600" aria-hidden="true" />
  <span className="min-w-0 flex-1">
  <span className="block text-xs font-medium uppercase tracking-wide text-stone-500">
  Registration deadline
  </span>
  <span className="block truncate text-sm font-medium text-ink">
  {event.title}
  </span>
  </span>
  <ChevronRight
  size={15}
  aria-hidden="true"
  className="shrink-0 text-stone-400 transition-transform duration-200 group-hover:translate-x-0.5"
  />
  </button>
  </li>
  ))}
  </ul>
  )}
  </>
  )}
  </div>

  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline pt-4">
  <span className="flex items-center gap-1.5 text-xs text-stone-600">
  <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
  Event
  </span>
  <span className="flex items-center gap-1.5 text-xs text-stone-600">
  <span className="h-2 w-2 rounded-full bg-rose-600" aria-hidden="true" />
  Registration deadline
  </span>
  <span className="flex items-center gap-1.5 text-xs text-stone-600">
  <span className="h-2 w-2 rounded-full border border-stone-400 bg-white" aria-hidden="true" />
  Today
  </span>
  </div>
  </div>
  </div>
  </section>

  <button
  ref={triggerRef}
  type="button"
  onClick={() => (isOpen ? close() : open())}
  aria-expanded={isOpen}
  aria-controls="event-calendar-panel"
  aria-label={isOpen ? "Close event calendar" : "Open event calendar"}
className="press fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-4 z-[80] sm:left-6 md:bottom-8 inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-ink text-white shadow-[0_14px_30px_-12px_rgba(17,17,20,0.5)] transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft hover:shadow-[0_18px_36px_-12px_rgba(17,17,20,0.55)] md:bottom-8 md:left-8"

  >
  {isOpen ? (
  <X size={22} aria-hidden="true" />
  ) : (
  <CalendarIcon size={22} aria-hidden="true" />
  )}
  </button>
  </>
  );
};

export default FloatingCalendar;
