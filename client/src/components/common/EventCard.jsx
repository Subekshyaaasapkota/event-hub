import React, { useMemo } from "react";
import { Users, Calendar, MapPin, Clock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";

const EventCard = ({
  _id,
  id,
  title,
  eventDate,
  district,
  deadline,
  poster,
  capacity,
  participantCount,
  currentParticipants,
  eventType = "physical",
}) => {
  const navigate = useNavigate();
  const eventId = _id || id;

  const formatDate = (dateString) => {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
  month: "long",
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

  const totalCapacity = capacity || participantCount || 100;
  const currentParticipantsCount = currentParticipants || 0;
  const availableSeats = totalCapacity - currentParticipantsCount;
  const occupancyPercent = totalCapacity
  ? Math.round((currentParticipantsCount / totalCapacity) * 100)
  : 0;

  const isDeadlinePassed = deadline ? new Date(deadline) < new Date() : false;

  const isEventCompleted = useMemo(() => {
  if (!eventDate) return false;
  const now = new Date();
  const eventDateTime = new Date(eventDate);
  return eventDateTime < new Date(now.getTime() - 24 * 60 * 60 * 1000); // More than 24 hours ago
  }, [eventDate]);

  return (
  <div
  onClick={() => navigate(`/event/${eventId}`)}
  className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-all duration-300 border border-gray-100 cursor-pointer group"
  >
  <div className="relative h-48 w-full overflow-hidden">
  {poster ? (
  <img
  src={poster}
  alt={title}
  className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isEventCompleted ? "grayscale" : ""
  }`}
  />
  ) : (
  <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
  {title?.[0]}
  </div>
  )}

  {/* Event Date Badge */}
  <div className="absolute top-3 left-3 z-10">
  <CountdownTimer targetDate={eventDate} deadline={deadline} />
  </div>

  {/* Urgent Deadline Badge - Now handled by CountdownTimer */}
  {/* {showUrgentDeadline && !isDeadlinePassed && (
  <div className="absolute top-3 right-3 z-10">
  <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg animate-pulse flex items-center gap-1.5">
  <AlertCircle size={12} />
  <span>Closes in {timeUntilDeadline}</span>
  </div>
  </div>
  )} */}

  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>

  <div className="p-6">
  <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
  {title}
  </h3>

  <div className="space-y-3 mb-4">
  {eventType === "online" ? (
  <div className="flex items-center text-sm text-blue-600 gap-2 font-medium p-2 rounded-lg bg-blue-50 border border-blue-100">
  <Globe size={16} className="text-blue-600" />
  <span> Online Event</span>
  </div>
  ) : (
  <div className="flex items-center text-sm text-slate-500 gap-2">
  <MapPin size={16} className="text-indigo-500" />
  <span>{district}</span>
  </div>
  )}
  <div className="flex items-center text-sm text-slate-500 gap-2">
  <Calendar size={16} className="text-indigo-500" />
  <span>
  {formatDate(eventDate)} at {formatTime(eventDate)}
  </span>
  </div>

  {/* Deadline Section */}
  {deadline && (
  <div
  className={`flex items-center text-sm gap-2 font-medium p-1.5 rounded-lg border ${isDeadlinePassed
  ? "bg-gray-50 text-gray-500 border-gray-100"
  : "bg-amber-50 text-amber-600 border-amber-100"
  }`}
  >
  <Clock size={16} />
  <span className="truncate">
  {isDeadlinePassed ? (
  "Registration Closed"
  ) : (
  <>Deadline: {formatDate(deadline)}</>
  )}
  </span>
  </div>
  )}
  </div>

  {/* Capacity Section */}
  <div className="space-y-2 pt-4 border-t border-gray-50">
  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
  <div className="flex items-center gap-1">
  <Users size={14} className="text-slate-400" />
  <span>Available</span>
  </div>
  <span>
  {availableSeats} / {totalCapacity} Spots
  </span>
  </div>
  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
  <div
  className={`h-full transition-all duration-1000 rounded-full ${occupancyPercent > 90
  ? "bg-red-500"
  : occupancyPercent > 70
  ? "bg-orange-500"
  : "bg-indigo-600"
  }`}
  style={{ width: `${occupancyPercent}%` }}
  ></div>
  </div>
  </div>
  </div>
  </div>
  );
};

export default EventCard;
