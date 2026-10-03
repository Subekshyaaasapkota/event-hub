import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Eye,
  AlertCircle,
  Edit3,
  Map as MapIcon,
  Globe,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Normalize poster URLs
const normalizePoster = (poster) => {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
  return `${BASE_URL}${poster}`;
};

/**
 *  Horizontal Event Card Component (Responsive)
 * Displays: title, venue, eventDate, deadline
 * Includes: Edit, View Details, Delete, Map buttons
 * Map button uses location.coordinates to open Google Maps
 */
const HorizontalEventCard = ({
  event,
  onDelete,
  onView,
  onEdit,
  isDeleting = false,
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
  setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
  try {
  await onDelete(event._id);
  setShowDeleteConfirm(false);
  } catch (error) {
  console.error("Delete failed:", error);
  }
  };

  const formatDate = (dateString) => {
  try {
  return new Date(dateString).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  });
  } catch {
  return "N/A";
  }
  };

  const openGoogleMaps = () => {
  let mapUrl;

  // Use googleMapUrl if available, otherwise construct from coordinates
  if (event.googleMapUrl) {
  mapUrl = event.googleMapUrl;
  } else if (event.location?.coordinates?.length === 2) {
  const [longitude, latitude] = event.location.coordinates;
  mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  } else {
  toast.error("Location information not available for this event");
  return;
  }

  window.open(mapUrl, "_blank", "noopener,noreferrer");
  };

  // Check if past deadline
  const isPastDeadline = new Date(event.deadline) < new Date();

  return (
  <div className="flex-shrink-0 w-full max-w-md lg:max-w-lg bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group">
  {/* Image Section - Responsive Height */}
  <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
  {event.poster ? (
  <img
  src={normalizePoster(event.poster)}
  alt={event.title}
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
  onError={(e) => {
  e.target.style.display = "none";
  }}
  />
  ) : (
  <div className="w-full h-full flex items-center justify-center text-slate-400">
  <div className="text-center">
  <div className="text-4xl sm:text-5xl mb-2"></div>
  <p className="text-xs font-bold uppercase tracking-widest">
  No Image
  </p>
  </div>
  </div>
  )}
  </div>

  {/* Content Section - Responsive Padding */}
  <div className="p-4 sm:p-5 space-y-3">
  {/* Title */}
  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight line-clamp-2">
  {event.title}
  </h3>

  {/* Event Details - Compact Layout */}
  <div className="space-y-2 text-xs sm:text-sm">
  {/* Online Event Badge or Venue */}
  {event.eventType === "online" ? (
  <div className="flex items-start gap-2">
  <Globe size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
  <div className="min-w-0">
  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
  Event Type
  </p>
  <p className="font-bold text-blue-700"> Online Event</p>
  </div>
  </div>
  ) : (
  event.venue && (
  <div className="flex items-start gap-2">
  <MapPin
  size={14}
  className="text-amber-600 flex-shrink-0 mt-0.5"
  />
  <div className="min-w-0">
  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
  Venue
  </p>
  <p className="font-bold text-slate-800 truncate">
  {event.venue}
  </p>
  </div>
  </div>
  )
  )}

  {/* Event Date */}
  {event.eventDate && (
  <div className="flex items-start gap-2">
  <Calendar
  size={14}
  className="text-blue-600 flex-shrink-0 mt-0.5"
  />
  <div className="min-w-0">
  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
  Event Date
  </p>
  <p className="font-bold text-slate-800">
  {formatDate(event.eventDate)}
  </p>
  </div>
  </div>
  )}

  {/* Deadline */}
  {event.deadline && (
  <div className="flex items-start gap-2">
  <Clock
  size={14}
  className={`${
  isPastDeadline ? "text-rose-600" : "text-green-600"
  } flex-shrink-0 mt-0.5`}
  />
  <div className="min-w-0">
  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
  Deadline
  </p>
  <p
  className={`font-bold ${
  isPastDeadline ? "text-rose-600" : "text-slate-800"
  }`}
  >
  {formatDate(event.deadline)} {isPastDeadline && "(Closed)"}
  </p>
  </div>
  </div>
  )}
  </div>

  {/* Action Buttons - Fully Responsive */}
  {!showDeleteConfirm ? (
  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
  {/* View Details Button */}
  <button
  onClick={() => onView?.(event)}
  className="flex-1 min-w-fit flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 px-2 py-2 sm:px-3 rounded-lg font-bold text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-tight transition-all active:scale-95"
  title="View event details"
  >
  <Eye size={13} />
  <span>View</span>
  </button>

  {/* Edit Button */}
  <button
  onClick={() => onEdit?.(event)}
  className="flex-1 min-w-fit flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-600 px-2 py-2 sm:px-3 rounded-lg font-bold text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-tight transition-all active:scale-95"
  title="Edit event"
  >
  <Edit3 size={13} />
  <span>Edit</span>
  </button>

  {/* Registrations Button */}
  <button
  onClick={() => navigate(`/club/registrations?eventId=${event._id}`)}
  className="flex-1 min-w-fit flex items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-600 px-2 py-2 sm:px-3 rounded-lg font-bold text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-tight transition-all active:scale-95"
  title="Manage registrations"
  >
  <Users size={13} />
  <span>Users</span>
  </button>

  {/* Map Button - Only show for physical events */}
  {event.eventType !== "online" && (
  <button
  onClick={openGoogleMaps}
  className="flex-1 min-w-fit flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-600 px-2 py-2 sm:px-3 rounded-lg font-bold text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-tight transition-all active:scale-95"
  title="Open location on Google Maps"
  >
  <MapIcon size={13} />
  <span>Map</span>
  </button>
  )}

  {/* Delete Button */}
  <button
  onClick={handleDeleteClick}
  disabled={isDeleting}
  className="flex-1 min-w-fit flex items-center justify-center gap-1 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 px-2 py-2 sm:px-3 rounded-lg font-bold text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-tight transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
  title="Delete event"
  >
  <Trash2 size={13} />
  <span>Delete</span>
  </button>
  </div>
  ) : null}

  {/* Delete Confirmation - Responsive */}
  {showDeleteConfirm && (
  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 sm:p-4 space-y-3">
  <div className="flex gap-2 items-start">
  <AlertCircle
  size={18}
  className="text-rose-600 mt-0.5 flex-shrink-0"
  />
  <p className="text-xs sm:text-sm font-bold text-rose-800">
  Delete this event? This cannot be undone.
  </p>
  </div>
  <div className="flex gap-2">
  <button
  onClick={handleConfirmDelete}
  disabled={isDeleting}
  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-2 py-2 sm:px-3 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-tight transition-all active:scale-95 disabled:opacity-50"
  >
  {isDeleting ? "..." : "Confirm"}
  </button>
  <button
  onClick={() => setShowDeleteConfirm(false)}
  disabled={isDeleting}
  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-2 sm:px-3 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-tight transition-all active:scale-95 disabled:opacity-50"
  >
  Cancel
  </button>
  </div>
  </div>
  )}
  </div>
  </div>
  );
};

export default HorizontalEventCard;
