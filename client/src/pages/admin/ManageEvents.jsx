// src/pages/admin/AdminManageEvents.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  ShieldAlert,
  Calendar,
  MapPin,
  Building2,
  User,
  Tag,
  Search,
  Eye,
  Filter,
  X,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
} from "lucide-react";
import useAdmin from "../../hooks/useAdmin";
import Footer from "../../components/common/Footer";

// Normalize poster URLs
const normalizePoster = (poster) => {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
  return `${BASE_URL}${poster}`;
};

const AdminManageEvents = () => {
  const { adminData, fetchEvents, deleteEvent } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;
  const [confirmDialog, setConfirmDialog] = useState({
  isOpen: false,
  title: "",
  message: "",
  onConfirm: null,
  });

  const now = useMemo(() => new Date(), []);

  const isEventCompleted = useMemo(
  () => (event) =>
  event.eventDate ? new Date(event.eventDate) < now : false,
  [now],
  );

  const isDeadlineCompleted = useMemo(
  () => (event) => (event.deadline ? new Date(event.deadline) < now : false),
  [now],
  );

  const getEventStatus = useMemo(
  () => (event) => {
  if (isEventCompleted(event)) return "completed";
  if (isDeadlineCompleted(event)) return "deadline";
  return "active";
  },
  [isEventCompleted, isDeadlineCompleted],
  );

  useEffect(() => {
  console.log("Fetching events...");
  fetchEvents();
  }, [fetchEvents]);

  // Debug log
  useEffect(() => {
  console.log("Events data:", adminData.events);
  console.log("Loading state:", adminData.loading);
  console.log("Error state:", adminData.error);
  }, [adminData]);

  const handleDeleteEvent = (eventId, eventTitle) => {
  setConfirmDialog({
  isOpen: true,
  title: "Delete Event",
  message: ` WARNING: This will permanently delete "${eventTitle}". This action cannot be undone. Are you sure?`,
  onConfirm: async () => {
  try {
  await deleteEvent(eventId);
  toast.success("Event deleted successfully!");
  setConfirmDialog({ isOpen: false });
  } catch (error) {
  console.error("Failed to delete event:", error);
  toast.error(
  error.message || "Failed to delete event. Please try again.",
  );
  setConfirmDialog({ isOpen: false });
  }
  },
  });
  };

  const filteredEvents = useMemo(() => {
  return (
  adminData.events?.filter((event) => {
  const status = getEventStatus(event);
  if (statusFilter !== "all" && status !== statusFilter) {
  return false;
  }

  if (searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  const organizerName = event.organizer?.name || "";
  const createdByName = event.createdBy?.name || "";

  return (
  event.title?.toLowerCase().includes(searchLower) ||
  organizerName.toLowerCase().includes(searchLower) ||
  createdByName.toLowerCase().includes(searchLower) ||
  event.category?.toLowerCase().includes(searchLower) ||
  event.district?.toLowerCase().includes(searchLower) ||
  event.venue?.toLowerCase().includes(searchLower)
  );
  }

  return true;
  }) || []
  );
  }, [adminData.events, searchTerm, statusFilter, getEventStatus]);

  const totalPages = Math.max(
  1,
  Math.ceil(filteredEvents.length / eventsPerPage),
  );
  const pageToShow = Math.min(currentPage, totalPages);

  const paginatedEvents = useMemo(
  () =>
  filteredEvents.slice(
  (pageToShow - 1) * eventsPerPage,
  pageToShow * eventsPerPage,
  ),
  [filteredEvents, pageToShow, eventsPerPage],
  );

  const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  });
  };

  const getStatusBadge = (event) => {
  if (isEventCompleted(event)) {
  return (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100">
  <Clock size={12} /> Completed
  </span>
  );
  }

  if (isDeadlineCompleted(event)) {
  return (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
  <AlertCircle size={12} /> Deadline Passed
  </span>
  );
  }

  return (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
  <Users size={12} /> Active Event
  </span>
  );
  };

  // Show error state
  if (adminData.error) {
  return (
  <div className="min-h-screen flex flex-col bg-[#FDFDFF]">
  <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
  <h2 className="text-xl font-black text-red-700 mb-2">
  Error Loading Events
  </h2>
  <p className="text-red-600 mb-4">{adminData.error}</p>
  <button
  onClick={() => fetchEvents()}
  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition"
  >
  Try Again
  </button>
  </div>
  </main>
  <Footer />
  </div>
  );
  }

  return (
  <div className="min-h-screen flex flex-col bg-[#FDFDFF]">
  <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
  <div>
  <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-2">
  <ShieldAlert size={12} /> Event Management
  </div>
  <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter">
  All <span className="text-indigo-600">Events</span>
  </h1>
  <p className="text-slate-500 text-sm mt-1">
  View and manage all events created by verified clubs
  </p>
  </div>

  {/* Stats */}
  <div className="flex gap-3">
  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
  <p className="text-[10px] font-black uppercase text-slate-400">
  Total Events
  </p>
  <p className="text-2xl font-black text-slate-800">
  {adminData.events?.length || 0}
  </p>
  </div>
  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
  <p className="text-[10px] font-black uppercase text-slate-400">
  Active Events
  </p>
  <p className="text-2xl font-black text-indigo-600">
  {adminData.events?.filter(
  (e) => !isEventCompleted(e) && !isDeadlineCompleted(e),
  ).length || 0}
  </p>
  </div>
  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
  <p className="text-[10px] font-black uppercase text-slate-400">
  Completed Events
  </p>
  <p className="text-2xl font-black text-emerald-600">
  {adminData.events?.filter((e) => isEventCompleted(e)).length ||
  0}
  </p>
  </div>
  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
  <p className="text-[10px] font-black uppercase text-slate-400">
  Deadline Passed
  </p>
  <p className="text-2xl font-black text-amber-600">
  {adminData.events?.filter(
  (e) => isDeadlineCompleted(e) && !isEventCompleted(e),
  ).length || 0}
  </p>
  </div>
  </div>
  </div>

  {/* Search and Filters */}
  <div className="mb-8 space-y-4">
  <div className="flex gap-3">
  <div className="relative flex-1 max-w-md">
  <Search
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
  size={18}
  />
  <input
  type="text"
  placeholder="Search by title, club, category, district, or venue..."
  value={searchTerm}
  onChange={(e) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1);
  }}
  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition bg-white"
  />
  </div>
  <button
  onClick={() => setShowFilters(!showFilters)}
  className={`px-4 py-3 rounded-2xl border transition-all flex items-center gap-2 ${
  showFilters || statusFilter !== "all"
  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
  }`}
  >
  <Filter size={18} />
  <span className="text-sm font-medium">Filters</span>
  {statusFilter !== "all" && (
  <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 rounded-full text-xs">
  1
  </span>
  )}
  </button>
  </div>

  {/* Filter Panel */}
  {showFilters && (
  <div className="bg-white rounded-2xl border border-slate-200 p-4">
  <div className="flex items-center justify-between mb-3">
  <h3 className="text-sm font-black text-slate-700">
  Status Filter
  </h3>
  {statusFilter !== "all" && (
  <button
  onClick={() => setStatusFilter("all")}
  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
  >
  <X size={12} /> Clear
  </button>
  )}
  </div>
  <div className="flex gap-2">
  {[
  {
  value: "all",
  label: "All Events",
  theme: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  {
  value: "active",
  label: "Active",
  theme: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  },
  {
  value: "completed",
  label: "Completed",
  theme: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  {
  value: "deadline",
  label: "Deadline Passed",
  theme: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  ].map((filter) => (
  <button
  key={filter.value}
  onClick={() => {
  setStatusFilter(filter.value);
  setCurrentPage(1);
  }}
  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
  statusFilter === filter.value
  ? filter.theme
  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
  }`}
  >
  {filter.label}
  {filter.value !== "all" && (
  <span className="ml-2 text-xs opacity-75">
  (
  {adminData.events?.filter(
  (e) => getEventStatus(e) === filter.value,
  ).length || 0}
  )
  </span>
  )}
  </button>
  ))}
  </div>
  </div>
  )}
  </div>

  {/* Loading State */}
  {adminData.loading ? (
  <div className="space-y-4">
  {[1, 2, 3, 4].map((i) => (
  <div
  key={i}
  className="h-32 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"
  />
  ))}
  </div>
  ) : filteredEvents.length === 0 ? (
  // Empty State
  <div className="bg-white rounded-3xl p-20 text-center max-w-2xl mx-auto shadow-sm border border-slate-100">
  <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
  <Calendar className="text-slate-300" size={48} />
  </div>
  <h2 className="text-2xl font-black text-slate-800 mb-2">
  No Events Found
  </h2>
  <p className="text-slate-500">
  {searchTerm || statusFilter !== "all"
  ? `No events matching your ${searchTerm ? `search "${searchTerm}"` : "filters"}`
  : "No events have been created yet"}
  </p>
  {(searchTerm || statusFilter !== "all") && (
  <button
  onClick={() => {
  setSearchTerm("");
  setStatusFilter("all");
  }}
  className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
  >
  Clear all filters
  </button>
  )}
  </div>
  ) : (
  <>
  {/* Horizontal Cards Grid */}
  <div className="space-y-4">
  {paginatedEvents.map((event) => (
  <div
  key={event._id}
  className={`bg-white rounded-2xl border transition-all hover:shadow-md ${
  isEventCompleted(event)
  ? "border-slate-200"
  : isDeadlineCompleted(event)
  ? "border-amber-200 shadow-amber-50/50"
  : "border-indigo-200"
  }`}
  >
  <div className="p-5">
  <div className="flex items-start justify-between gap-4">
  {/* Left Section - Event Image & Basic Info */}
  <div className="flex gap-5 flex-1">
  {/* Event Poster/Image */}
  <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md shrink-0 bg-linear-to-br from-indigo-100 to-purple-100">
  {event.poster ? (
  <img
  src={normalizePoster(event.poster)}
  alt={event.title}
  className="w-full h-full object-cover"
  />
  ) : (
  <div className="w-full h-full flex items-center justify-center">
  <Calendar className="text-indigo-400" size={32} />
  </div>
  )}
  </div>

  {/* Event Details */}
  <div className="flex-1 min-w-0">
  <div className="flex items-center gap-3 mb-2 flex-wrap">
  <h3 className="text-lg font-black text-slate-800">
  {event.title}
  </h3>
  {getStatusBadge(event)}
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
  {/* Organizer/Club */}
  <div className="flex items-center gap-2 text-sm">
  <Building2
  size={14}
  className="text-indigo-500 shrink-0"
  />
  <span className="text-slate-600">
  <span className="font-medium text-slate-700">
  Organizer:
  </span>{""}
  {event.organizer?.name || "N/A"}
  </span>
  </div>

  {/* Category */}
  <div className="flex items-center gap-2 text-sm">
  <Tag
  size={14}
  className="text-emerald-500 shrink-0"
  />
  <span className="text-slate-600">
  <span className="font-medium text-slate-700">
  Category:
  </span>{""}
  {event.category || "General"}
  </span>
  </div>

  {/* Created By */}
  <div className="flex items-center gap-2 text-sm">
  <User
  size={14}
  className="text-purple-500 shrink-0"
  />
  <span className="text-slate-600">
  <span className="font-medium text-slate-700">
  Created by:
  </span>{""}
  {event.createdBy?.name || "Unknown"}
  </span>
  </div>

  {/* District */}
  <div className="flex items-center gap-2 text-sm">
  <MapPin
  size={14}
  className="text-red-500 shrink-0"
  />
  <span className="text-slate-600">
  <span className="font-medium text-slate-700">
  District:
  </span>{""}
  {event.district || "N/A"}
  </span>
  </div>

  {/* Venue */}
  {event.venue && (
  <div className="flex items-center gap-2 text-sm">
  <MapPin
  size={14}
  className="text-orange-500 shrink-0"
  />
  <span className="text-slate-600">
  <span className="font-medium text-slate-700">
  Venue:
  </span>{""}
  {event.venue}
  </span>
  </div>
  )}

  {/* Event Date */}
  <div className="flex items-center gap-2 text-sm">
  <Calendar
  size={14}
  className="text-slate-500 shrink-0"
  />
  <span className="text-slate-600">
  <span className="font-medium text-slate-700">
  Event Date:
  </span>{""}
  {formatDateTime(event.eventDate)}
  </span>
  </div>

  {/* Registration Deadline */}
  {event.deadline && (
  <div className="flex items-center gap-2 text-sm">
  <Clock
  size={14}
  className="text-slate-500 shrink-0"
  />
  <span className="text-slate-600">
  <span className="font-medium text-slate-700">
  Deadline:
  </span>{""}
  {formatDateTime(event.deadline)}
  </span>
  </div>
  )}

  {/* Participant Count */}
  <div className="flex items-center gap-2 text-sm">
  <Users
  size={14}
  className="text-blue-500 shrink-0"
  />
  <span className="text-slate-600">
  <span className="font-medium text-slate-700">
  Participants:
  </span>{""}
  {event.participantCount || 0}
  </span>
  </div>
  </div>
  </div>
  </div>

  {/* Right Section - Actions */}
  <div className="flex flex-col items-end gap-2">
  <Link
  to={`/admin/event/${event._id}`}
  className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap"
  >
  <Eye size={14} /> View Details
  </Link>

  <button
  onClick={() =>
  handleDeleteEvent(event._id, event.title)
  }
  className="text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
  title="Delete Event"
  >
  Delete
  </button>
  </div>
  </div>
  </div>
  </div>
  ))}
  </div>

  {/* Pagination Controls */}
  {totalPages > 1 && (
  <div className="mt-6 flex items-center justify-center gap-2">
  <button
  onClick={() =>
  setCurrentPage((prev) => Math.max(prev - 1, 1))
  }
  disabled={currentPage === 1}
  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
  >
  Prev
  </button>
  <span className="text-xs font-bold text-slate-600">
  Page {currentPage} of {totalPages}
  </span>
  <button
  onClick={() =>
  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }
  disabled={currentPage === totalPages}
  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
  >
  Next
  </button>
  </div>
  )}
  </>
  )}
  </main>

  <Footer />

  <ConfirmDialog
  isOpen={confirmDialog.isOpen}
  onClose={() => setConfirmDialog({ isOpen: false })}
  onConfirm={confirmDialog.onConfirm}
  title={confirmDialog.title}
  message={confirmDialog.message}
  type="danger"
  />
  </div>
  );
};

export default AdminManageEvents;
