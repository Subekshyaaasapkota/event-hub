import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit3,
  Trash2,
  ChevronLeft,
  Share2,
  Info,
  Building2,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Zap,
  Eye,
  ExternalLink,
  Globe,
} from "lucide-react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toast } from "react-hot-toast";
import ClubSidebar from "./ClubSidebar";
import useEvents from "../../hooks/useEvents";

// Normalize poster URLs
const normalizePoster = (poster) => {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
  return `${BASE_URL}${poster}`;
};

const AdminEventManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchEventById, deleteEvent } = useEvents();
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
  const loadEvent = async () => {
  setLoading(true);
  setError(null);
  const result = await fetchEventById(id);
  if (result.success) {
  setEvent(result.data);
  } else {
  setError(result.message || "Failed to load event");
  }
  setLoading(false);
  };
  loadEvent();
  }, [id, fetchEventById]);

  const formatDate = (dateString) => {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  });
  };

  const formatTime = (dateString) => {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleTimeString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  });
  };

  const handleEdit = () => {
  navigate(`/club/create-event?id=${event._id}`);
  };

  const handleDelete = () => {
  setConfirmDialog({
  isOpen: true,
  title: "Delete Event",
  message: "Are you sure? This action cannot be undone.",
  onConfirm: async () => {
  try {
  const result = await deleteEvent(event._id);
  if (!result.success) {
  toast.error(result.message || "Failed to delete event.");
  return;
  }
  toast.success("Event deleted successfully.");
  navigate("/club/my-events");
  } catch (error) {
  toast.error(error.message || "Failed to delete event.");
  } finally {
  setConfirmDialog({ isOpen: false });
  }
  },
  });
  };

  if (loading) {
  return (
  <div className="min-h-screen flex bg-paper">
  <ClubSidebar />
  <main className="flex-1 flex items-center justify-center">
  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
  </main>
  </div>
  );
  }

  if (error || !event) {
  return (
  <div className="min-h-screen flex bg-paper">
  <ClubSidebar />
  <main className="flex-1 p-10 flex items-center justify-center">
  <div className="bg-rose-50 border border-rose-200 rounded-3xl p-12 max-w-2xl text-center">
  <div className="text-rose-500 mb-4 flex justify-center">
  <AlertCircle size={48} />
  </div>
  <h3 className="text-2xl font-black text-slate-900 mb-2">Error</h3>
  <p className="text-slate-600 font-bold mb-6">{error}</p>
  <button
  onClick={() => navigate("/club/my-events")}
  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
  >
  Back to Events
  </button>
  </div>
  </main>
  </div>
  );
  }

  const totalCapacity = event.participantCount || 100;
  const currentParticipants = event.currentParticipants || 0;
  const availableSeats = totalCapacity - currentParticipants;
  const occupancyPercent = totalCapacity
  ? Math.round((currentParticipants / totalCapacity) * 100)
  : 0;

  return (
  <div className="min-h-screen flex bg-paper">
  <ClubSidebar />

  <main className="flex-1 p-8 overflow-auto">
  {/* Header */}
  <div className="mb-8 flex items-center justify-between">
  <button
  onClick={() => navigate("/club/my-events")}
  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold"
  >
  <ChevronLeft size={20} /> Back to Events
  </button>
  <div className="flex gap-3">
  <button
  onClick={handleEdit}
  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
  >
  <Edit3 size={18} /> Edit Event
  </button>
  <button
  onClick={handleDelete}
  className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg"
  >
  <Trash2 size={18} /> Delete
  </button>
  </div>
  </div>

  {/* Main Content Grid */}
  <div className="grid lg:grid-cols-12 gap-8">
  {/* Left Column - Event Details */}
  <div className="lg:col-span-8 space-y-8">
  {/* Event Poster */}
  <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white">
  {event.poster ? (
  <img
  src={normalizePoster(event.poster)}
  alt={event.title}
  className="w-full h-full object-cover"
  />
  ) : (
  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-6xl font-black">
  {event.title?.[0]}
  </div>
  )}
  </div>

  {/* Event Title & Tags */}
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
  <div className="flex flex-wrap gap-3">
  <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold uppercase border border-indigo-100">
  {event.category}
  </span>
  <span
  className={`px-4 py-2 rounded-full text-xs font-bold uppercase border ${event.status === "published"
  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
  : event.status === "draft"
  ? "bg-amber-50 text-amber-600 border-amber-100"
  : "bg-slate-50 text-slate-600 border-slate-100"
  }`}
  >
  {event.status}
  </span>
  <span
  className={`px-4 py-2 rounded-full text-xs font-bold uppercase border ${event.isPaid && event.price > 0
  ? "bg-green-50 text-green-600 border-green-100"
  : "bg-emerald-50 text-emerald-600 border-emerald-100"
  }`}
  >
  {event.isPaid && event.price > 0
  ? `Rs. ${event.price}`
  : "Free"}
  </span>
  </div>

  <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
  {event.title}
  </h1>

  {/* Event Meta Info */}
  <div className="grid sm:grid-cols-2 gap-6 py-8 border-y border-slate-100">
  <div className="flex items-start gap-4">
  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
  <Calendar size={20} />
  </div>
  <div>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
  Date
  </p>
  <p className="text-slate-700 font-semibold">
  {formatDate(event.eventDate)}
  </p>
  <p className="text-slate-500 text-sm">
  {formatTime(event.eventDate)}
  </p>
  </div>
  </div>
  <div className="flex items-start gap-4">
  <div
  className={`p-3 rounded-2xl ${event.eventType === "online"
  ? "bg-blue-50 text-blue-600"
  : "bg-indigo-50 text-indigo-600"
  }`}
  >
  {event.eventType === "online" ? (
  <Globe size={20} />
  ) : (
  <MapPin size={20} />
  )}
  </div>
  <div>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
  {event.eventType === "online" ? "Event Type" : "Location"}
  </p>
  {event.eventType === "online" ? (
  <>
  <p className="text-slate-700 font-semibold text-lg">
  Online Event
  </p>
  <p className="text-slate-500 text-sm mt-1">
  Join from anywhere, {event.district}
  </p>
  </>
  ) : (
  <>
  <p className="text-slate-700 font-semibold">
  {event.district}
  </p>
  <p className="text-slate-500 text-sm">{event.venue}</p>
  </>
  )}
  </div>
  </div>
  </div>

  {/* Description */}
  <div>
  <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
  <FileText size={20} className="text-indigo-600" /> Description
  </h2>
  <p className="text-slate-600 leading-relaxed text-lg">
  {event.description || "No description provided."}
  </p>
  </div>

  {/* Tags */}
  {event.tags?.length > 0 && (
  <div>
  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
  Tags
  </h3>
  <div className="flex flex-wrap gap-2">
  {event.tags.map((tag, i) => (
  <span
  key={i}
  className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold"
  >
  #{tag}
  </span>
  ))}
  </div>
  </div>
  )}
  </div>
  </div>

  {/* Right Column - Stats & Actions */}
  <div className="lg:col-span-4 space-y-8">
  {/* Capacity Card */}
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
  <Users size={20} /> Capacity
  </h3>

  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
  <div>
  <p className="text-sm text-slate-500 font-bold">Registered</p>
  <p className="text-2xl font-black text-slate-900">
  {currentParticipants}
  </p>
  </div>
  <div className="text-right">
  <p className="text-sm text-slate-500 font-bold">Total</p>
  <p className="text-2xl font-black text-slate-900">
  {totalCapacity}
  </p>
  </div>
  </div>

  <div className="space-y-3">
  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
  <div
  className={`h-full transition-all ${occupancyPercent > 90
  ? "bg-red-500"
  : occupancyPercent > 70
  ? "bg-orange-500"
  : "bg-indigo-600"
  }`}
  style={{ width: `${occupancyPercent}%` }}
  ></div>
  </div>
  <p className="text-xs text-center text-slate-600 font-bold">
  {occupancyPercent}% Capacity • {availableSeats} seats
  available
  </p>
  </div>

  <Link
  to={`/club/registrations?eventId=${event._id}`}
  className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all text-center flex items-center justify-center"
  >
  <Eye size={18} className="inline mr-2" /> View Registrations
  </Link>
  </div>

  {/* Deadline Card */}
  {event.deadline && (
  <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 space-y-4">
  <div className="flex items-center gap-3">
  <Clock size={20} className="text-amber-600" />
  <h3 className="font-black text-amber-900">
  Registration Deadline
  </h3>
  </div>
  <p className="text-sm font-bold text-amber-700">
  {formatDate(event.deadline)}
  </p>
  </div>
  )}

  {/* Pricing Card */}
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4">
  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
  <DollarSign size={20} /> Pricing
  </h3>
  <div className="bg-slate-50 p-4 rounded-2xl">
  <p className="text-xs text-slate-500 font-bold mb-2">
  Event Type
  </p>
  <p className="text-xl font-black text-slate-900">
  {event.isPaid && event.price > 0
  ? `Paid - Rs. ${event.price}`
  : "Free Event"}
  </p>
  </div>
  </div>

  {/* Status Card */}
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4">
  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
  <Zap size={20} /> Status
  </h3>
  <div
  className={`p-4 rounded-2xl flex items-center gap-3 ${event.status === "published"
  ? "bg-emerald-50"
  : event.status === "draft"
  ? "bg-amber-50"
  : "bg-slate-50"
  }`}
  >
  <CheckCircle
  size={20}
  className={`${event.status === "published"
  ? "text-emerald-600"
  : event.status === "draft"
  ? "text-amber-600"
  : "text-slate-600"
  }`}
  />
  <p className="font-black text-sm uppercase tracking-wider">
  {event.status === "published"
  ? "Published & Visible"
  : event.status === "draft"
  ? "Draft (Not Visible)"
  : event.status}
  </p>
  </div>
  </div>

  {/* Share Card */}
  <button
  onClick={() => {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
  }}
  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
  >
  <Share2 size={18} /> Share Event
  </button>
  </div>
  </div>
  </main>
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

export default AdminEventManagement;
