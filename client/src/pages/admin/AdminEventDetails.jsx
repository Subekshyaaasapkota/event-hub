// src/pages/admin/AdminEventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Globe,
  ExternalLink,
  ChevronLeft,
  Info,
  Building2,
  Mail,
  CheckCircle2,
  User,
  Tag,
  Shield,
  Edit,
  Trash2,
  XCircle,
  AlertCircle,
  Download,
  Printer,
  Share2,
  Eye,
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

const AdminEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminData, fetchEvents, deleteEvent } = useAdmin();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
  isOpen: false,
  title: "",
  message: "",
  onConfirm: null,
  });

  useEffect(() => {
  // Fetch events if not already loaded
  if (!adminData.events || adminData.events.length === 0) {
  fetchEvents();
  }
  }, [fetchEvents, adminData.events]);

  useEffect(() => {
  const fetchEvent = async () => {
  try {
  setLoading(true);
  // Wait for events to be loaded
  if (adminData.events && adminData.events.length > 0) {
  // Find the specific event from adminData
  const foundEvent = adminData.events.find((e) => e._id === id);

  if (foundEvent) {
  setEvent(foundEvent);
  } else {
  setError("Event not found");
  }
  } else if (!adminData.loading && adminData.events) {
  setError("No events found");
  }
  } catch (err) {
  setError(err.message || "Failed to load event details");
  } finally {
  setLoading(false);
  }
  };

  fetchEvent();
  window.scrollTo(0, 0);
  }, [id, adminData.events, adminData.loading]);

  const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  });
  };

  const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  });
  };

  if (loading)
  return (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
  );

  if (error)
  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
  <div className="bg-red-50 text-red-500 p-6 rounded-2xl border border-red-100 font-medium">
  {error}
  </div>
  <button
  onClick={() => navigate("/admin/events")}
  className="flex items-center gap-2 text-indigo-600 font-semibold hover:underline"
  >
  <ChevronLeft size={20} /> Back to Events
  </button>
  </div>
  );

  if (!event) return null;

  const isEventExpired = new Date(event.eventDate) < new Date();

  return (
  <div className="min-h-screen bg-slate-50/50">
  <main className="flex-1">
  {/* Admin Header */}
  <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-6 py-4">
  <div className="flex items-center justify-between">
  <div className="flex items-center gap-4">
  <button
  onClick={() => navigate("/admin/events")}
  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
  >
  <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-indigo-50 transition-all">
  <ChevronLeft size={18} />
  </div>
  <span className="font-medium text-sm">Back to Events</span>
  </button>
  <div className="h-6 w-px bg-slate-200"></div>
  <div className="flex items-center gap-2">
  <Shield size={14} className="text-indigo-600" />
  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
  Admin View
  </span>
  </div>
  </div>

  <div className="flex items-center gap-3">
  <button
  onClick={() => window.print()}
  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
  title="Print Event Details"
  >
  <Printer size={18} />
  </button>
  <button
  onClick={async () => {
  await navigator.clipboard.writeText(window.location.href);
  toast.success("Link copied to clipboard!");
  }}
  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
  title="Share Event"
  >
  <Share2 size={18} />
  </button>
  </div>
  </div>
  </div>
  </div>

  <div className="max-w-7xl mx-auto px-6 py-10">
  <div className="grid lg:grid-cols-12 gap-8">
  {/* Left Column - Event Details */}
  <div className="lg:col-span-8 space-y-6">
  {/* Event Status Banner */}
  <div
  className={`rounded-2xl p-4 ${
  isEventExpired
  ? "bg-gray-50 border border-gray-200"
  : "bg-emerald-50 border border-emerald-100"
  }`}
  >
  <div className="flex items-center gap-3">
  {isEventExpired ? (
  <AlertCircle size={20} className="text-gray-600" />
  ) : (
  <CheckCircle2 size={20} className="text-emerald-600" />
  )}
  <div>
  <p
  className={`text-sm font-bold ${isEventExpired ? "text-gray-700" : "text-emerald-700"}`}
  >
  {isEventExpired ? "Event Has Expired" : "Event is Active"}
  </p>
  <p className="text-xs text-slate-500 mt-0.5">
  {isEventExpired
  ? "This event date has passed"
  : "This event is currently active and visible to all users"}
  </p>
  </div>
  </div>
  </div>

  {/* Event Image */}
  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200">
  <img
  src={
  normalizePoster(event.poster) ||
  "https://via.placeholder.com/1200x600?text=No+Image"
  }
  alt={event.title}
  className="w-full h-full object-cover"
  />
  <div className="absolute top-4 right-4">
  <span
  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
  isEventExpired
  ? "bg-gray-500 text-white"
  : "bg-emerald-500 text-white"
  }`}
  >
  {isEventExpired ? "Expired" : "Active"}
  </span>
  </div>
  </div>

  {/* Event Info Card */}
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
  <div className="flex flex-wrap gap-2 mb-4">
  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
  {event.category || "General"}
  </span>
  <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
  Free Event
  </span>
  </div>

  <h1 className="text-3xl font-black text-slate-900 mb-4">
  {event.title}
  </h1>

  <div className="grid sm:grid-cols-2 gap-5 pb-6 border-b border-slate-100">
  <div className="flex items-start gap-3">
  <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
  <Calendar size={18} />
  </div>
  <div>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
  Event Date & Time
  </p>
  <p className="text-slate-800 font-semibold text-sm">
  {formatDateTime(event.eventDate)}
  </p>
  </div>
  </div>

  <div className="flex items-start gap-3">
  <div
  className={`p-2 rounded-xl ${
  event.eventType === "online"
  ? "bg-blue-50 text-blue-600"
  : "bg-indigo-50 text-indigo-600"
  }`}
  >
  {event.eventType === "online" ? (
  <Globe size={18} />
  ) : (
  <MapPin size={18} />
  )}
  </div>
  <div>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
  {event.eventType === "online"
  ? "Event Type"
  : "District"}
  </p>
  {event.eventType === "online" ? (
  <p className="text-slate-800 font-semibold text-sm">
  Online Event
  </p>
  ) : (
  <p className="text-slate-800 font-semibold text-sm">
  {event.district || "N/A"}
  </p>
  )}
  </div>
  </div>

  {event.eventType === "physical" && (
  <>
  <div className="flex items-start gap-3">
  <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
  <MapPin size={18} />
  </div>
  <div>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
  District
  </p>
  <p className="text-slate-800 font-semibold text-sm">
  {event.district || "N/A"}
  </p>
  </div>
  </div>

  {event.venue && (
  <div className="flex items-start gap-3">
  <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
  <MapPin size={18} />
  </div>
  <div>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
  Venue
  </p>
  <p className="text-slate-800 font-semibold text-sm">
  {event.venue}
  </p>
  </div>
  </div>
  )}
  </>
  )}

  <div className="flex items-start gap-3">
  <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
  <Building2 size={18} />
  </div>
  <div>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
  Organizing Club
  </p>
  <p className="text-slate-800 font-semibold text-sm">
  {event.organizer?.name || "N/A"}
  </p>
  </div>
  </div>

  <div className="flex items-start gap-3">
  <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
  <User size={18} />
  </div>
  <div>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
  Created By
  </p>
  <p className="text-slate-800 font-semibold text-sm">
  {event.createdBy?.name || "Unknown"}
  </p>
  </div>
  </div>

  <div className="flex items-start gap-3">
  <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
  <Clock size={18} />
  </div>
  <div>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
  Registration Deadline
  </p>
  <p className="text-slate-800 font-semibold text-sm">
  {formatDateTime(event.deadline)}
  </p>
  </div>
  </div>
  </div>

  <div className="pt-6">
  <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
  <Info size={18} className="text-indigo-600" /> Description
  </h2>
  <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
  {event.description ||
  "No description provided for this event."}
  </div>
  </div>
  </div>

  {/* Registration Stats */}
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
  <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
  <Users size={18} className="text-indigo-600" /> Registration
  Analytics
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="bg-slate-50 rounded-xl p-4 text-center">
  <p className="text-2xl font-black text-slate-800">
  {event.participantCount || 0}
  </p>
  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
  Total Participants
  </p>
  </div>
  <div className="bg-slate-50 rounded-xl p-4 text-center">
  <p className="text-2xl font-black text-slate-800">
  Unlimited
  </p>
  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
  Capacity
  </p>
  </div>
  </div>
  </div>
  </div>

  {/* Right Column - Admin Actions */}
  <div className="lg:col-span-4 space-y-6">
  {/* Admin Actions Card */}
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
  <Shield size={16} className="text-indigo-600" /> Admin Actions
  </h3>

  <div className="space-y-3">
  <button
  onClick={() => window.open(`/event/${id}`, "_blank")}
  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all group"
  >
  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
  View Public Page
  </span>
  <Eye
  size={16}
  className="text-slate-400 group-hover:text-indigo-600"
  />
  </button>

  <button
  onClick={() => navigate(`/admin/events/edit/${id}`)}
  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all group"
  >
  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
  Edit Event Details
  </span>
  <Edit
  size={16}
  className="text-slate-400 group-hover:text-blue-600"
  />
  </button>

  <button
  onClick={() =>
  setConfirmDialog({
  isOpen: true,
  title: "Delete Event Permanently",
  message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
  onConfirm: async () => {
  try {
  await deleteEvent(id);
  toast.success("Event deleted successfully.");
  navigate("/admin/events");
  } catch (error) {
  toast.error(
  error.message ||
  "Failed to delete event. Please try again.",
  );
  } finally {
  setConfirmDialog({ isOpen: false });
  }
  },
  })
  }
  className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-all group"
  >
  <span className="text-sm font-medium text-red-600">
  Delete Event Permanently
  </span>
  <Trash2 size={16} className="text-red-500" />
  </button>
  </div>

  {isEventExpired && (
  <div className="mt-4 pt-4 border-t border-slate-100">
  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl flex items-center gap-2">
  <AlertCircle size={12} />
  This event has expired. You may delete it if no longer
  needed.
  </p>
  </div>
  )}

  <div className="mt-4 pt-4 border-t border-slate-100">
  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
  Event Metadata
  </p>
  <div className="space-y-1 text-xs text-slate-500">
  <p>Event ID: {event._id}</p>
  <p>
  Created: {formatDate(event.timestamp || event.createdAt)}
  </p>
  <p>Created By ID: {event.createdBy?._id || "N/A"}</p>
  </div>
  </div>
  </div>

  {/* Club Info Card */}
  {event.organizer && (
  <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl text-white">
  <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">
  Organizing Club
  </h3>
  <div className="flex items-center gap-3 mb-4">
  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
  <Building2 size={24} />
  </div>
  <div>
  <h4 className="text-lg font-extrabold">
  {event.organizer.name}
  </h4>
  <div className="flex items-center gap-1 text-xs font-bold text-white/70 uppercase tracking-wider">
  <CheckCircle2 size={12} className="text-green-400" />{""}
  Registered Club
  </div>
  </div>
  </div>

  {event.organizer.email && (
  <div className="flex items-center gap-2 text-sm">
  <Mail size={14} className="opacity-60" />
  <span className="text-white/90">
  {event.organizer.email}
  </span>
  </div>
  )}

  <button
  onClick={() => navigate("/admin/clubs")}
  className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
  >
  View Club Details <ExternalLink size={12} />
  </button>
  </div>
  )}
  </div>
  </div>
  </div>
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

export default AdminEventDetails;
