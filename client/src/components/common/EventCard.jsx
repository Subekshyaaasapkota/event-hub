import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Calendar, MapPin, Clock, Globe, ArrowUpRight } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { getImageUrl } from "../../utils/imageUrl";

/**
 * A one-minute clock shared by every card.
 *
 * Deadline and completion state depend on the current time, which makes render
 * impure if Date.now() is called inline. Reading the clock in an effect keeps
 * render pure, and the interval means a card left open across a deadline
 * boundary updates itself instead of lying until the next navigation.
 */
const useMinuteClock = () => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  return now;
};

/**
 * Event card.
 *
 * Redesigned as a single semantic <Link>. It used to be a <div> with an
 * onClick handler plus a navigate() call, so the card was unreachable by
 * keyboard and had no role. Making the whole surface the anchor gives us
 * pointer cursor, tab order, Enter activation, a real accessible name, and the
 * browser's own focus behaviour for free.
 *
 * Hover deliberately avoids transform-scale on the card. The old card scaled to
 * 1.03 and pressed to 0.95, which shifted its siblings in the grid on every
 * hover and made the target feel like it was moving out from under the cursor.
 * The lift is now shadow and border; the only movement is the poster inside a
 * clipped box, which cannot affect layout.
 */
const EventCard = ({
  _id,
  id,
  title,
  eventDate,
  district,
  venue,
  deadline,
  poster,
  category,
  capacity,
  participantCount,
  currentParticipants,
  eventType = "physical",
}) => {
  const eventId = _id || id;

  const formatDate = (dateString) => {
    if (!dateString) return "Date to be announced";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOnline = eventType === "online";

  /*
   * Capacity is optional in the schema. The previous version defaulted it to
   * 100, which invented a number and then drew a progress bar against it, so an
   * event with no capacity data appeared to be a real, tracked figure. When the
   * truth is unknown we now say nothing rather than invent something.
   */
  const capacityTotal = capacity ?? participantCount ?? null;
  const registered = currentParticipants ?? 0;
  const hasCapacity = Number.isFinite(capacityTotal) && capacityTotal > 0;
  const occupancyPercent = hasCapacity
    ? Math.min(100, Math.round((registered / capacityTotal) * 100))
    : 0;
  const seatsLeft = hasCapacity ? Math.max(capacityTotal - registered, 0) : null;

  const now = useMinuteClock();

  const deadlinePassed = deadline ? new Date(deadline).getTime() < now : false;

  // Matches the previous grace period, so an event in progress stays active.
  const isCompleted = eventDate
    ? new Date(eventDate).getTime() < now - 24 * 60 * 60 * 1000
    : false;

  const isClosed = deadlinePassed || isCompleted;

  return (
    <Link
    to={`/event/${eventId}`}
    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-white
      transition-[box-shadow,border-color,transform] duration-200 ease-out
      hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_12px_28px_-12px_rgba(17,17,20,0.22)]
      active:translate-y-0"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-200">
        {poster ? (
          <img
            src={getImageUrl(poster)}
            alt=""
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-500 ease-out
              group-hover:scale-[1.04] ${isCompleted ? "grayscale" : ""}`}
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        ) : (
          // A flat ink field with the category. The old gradient placeholder
          // was decoration standing in for content.
          <div className="flex h-full w-full flex-col justify-between bg-ink-soft p-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
              {category || "Event"}
            </span>
            <Calendar size={22} className="text-stone-500" />
          </div>
        )}

        {/* Bottom scrim so the countdown stays legible on a light poster. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />

        {category && poster ? (
          <span
            className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold
              uppercase tracking-[0.12em] text-ink shadow-sm"
          >
            {category}
          </span>
        ) : null}

        <div className="absolute right-3 top-3">
          <CountdownTimer targetDate={eventDate} deadline={deadline} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.0625rem] font-semibold leading-snug text-ink line-clamp-2">
          {title}
        </h3>

        {/* Flat metadata. Previously each row sat in its own bordered box,
            which nested cards inside a card and added noise without meaning. */}
        <dl className="mt-3.5 flex flex-col gap-2 text-[0.8125rem] text-stone-600">
          <div className="flex items-start gap-2">
            <dt className="sr-only">Date</dt>
            <Calendar size={15} className="mt-0.5 shrink-0 text-stone-400" />
            <dd className="min-w-0">
              {formatDate(eventDate)}
              {formatTime(eventDate) && (
              <span className="text-stone-400"> · {formatTime(eventDate)}</span>
              )}
            </dd>
          </div>

          <div className="flex items-start gap-2">
            <dt className="sr-only">{isOnline ? "Format" : "Location"}</dt>
            {isOnline ? (
              <Globe size={15} className="mt-0.5 shrink-0 text-stone-400" />
            ) : (
              <MapPin size={15} className="mt-0.5 shrink-0 text-stone-400" />
            )}
            <dd className="min-w-0 truncate">
              {isOnline ? "Online event" : district || venue || "Venue to be announced"}
            </dd>
          </div>

          {deadline ? (
            <div className="flex items-start gap-2">
              <dt className="sr-only">Registration deadline</dt>
              <Clock size={15} className="mt-0.5 shrink-0 text-stone-400" />
              <dd className={`min-w-0 truncate ${deadlinePassed ? "text-stone-400" : ""}`}>
                {deadlinePassed
                  ? "Registration closed"
                  : `Register by ${formatDate(deadline)}`}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto pt-4">
          {hasCapacity ? (
            <>
              <div className="mb-1.5 flex items-center justify-between text-[0.6875rem] font-medium text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="text-stone-400" />
                  {registered} registered
                </span>
                <span>{seatsLeft} seats left</span>
              </div>
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-stone-200"
                role="img"
                aria-label={`${occupancyPercent}% of ${capacityTotal} seats filled`}
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                    isClosed
                      ? "bg-stone-400"
                      : occupancyPercent >= 90
                      ? "bg-red-600"
                      : occupancyPercent >= 70
                      ? "bg-amber-600"
                      : "bg-ink"
                  }`}
                  style={{ width: `${Math.max(occupancyPercent, registered > 0 ? 4 : 0)}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-[0.6875rem] text-stone-400">
              {isClosed ? "This event is no longer accepting registrations" : "Open registration"}
            </p>
          )}

          <span
            className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-ink
              transition-colors group-hover:text-indigo-700"
          >
            View details
            <ArrowUpRight
              size={14}
              className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
