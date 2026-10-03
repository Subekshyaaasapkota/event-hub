import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  ChevronLeft,
  Share2,
  QrCode,
  Info,
  Building2,
  Mail,
  CheckCircle2,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Github,
  Linkedin,
  Youtube,
} from "lucide-react";
import QRCode from "qrcode";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import CountdownTimer from "../../components/common/CountdownTimer";
import useEvents from "../../hooks/useEvents";
import useAuth from "../../hooks/useAuth";

// Normalize poster URLs
const normalizePoster = (poster) => {
  if (!poster) return null;
  if (poster.startsWith("http")) return poster;
  const BASE_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";
  return `${BASE_URL}${poster}`;
};

const EventDetails = () => {
  const { id } = useParams();
  const { fetchEventById, fetchMyRegistrations, myRegistrations } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
  // Always fetch by ID - clean, simple, always correct
  const loadEvent = async () => {
  setLoading(true);
  setError(null);
  setEvent(null);

  const result = await fetchEventById(id);

  if (result.success) {
  setEvent(result.data);
  } else {
  setError(result.message || "Failed to load event details");
  }

  // If user is logged in, also fetch their registrations to check status
  if (user) {
  await fetchMyRegistrations();
  }

  setLoading(false);
  window.scrollTo(0, 0);
  };

  loadEvent();
  }, [id, user, fetchEventById, fetchMyRegistrations]); // only re-runs when URL id or user changes

  useEffect(() => {
  if (!showQrModal || !event) return;

  const currentUrl = window.location.href;
  QRCode.toDataURL(currentUrl, { width: 300, margin: 2 })
  .then((dataUrl) => setQrDataUrl(dataUrl))
  .catch((err) => {
  console.error("QRCode generation failed:", err);
  setQrDataUrl("");
  });
  }, [showQrModal, event]);

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
  onClick={() => navigate("/events")}
  className="flex items-center gap-2 text-indigo-600 font-semibold hover:underline"
  >
  <ChevronLeft size={20} /> Back to Events
  </button>
  </div>
  );

  if (!event) return null;

  const totalCapacity = event.capacity || event.participantCount || 100;
  const currentParticipants = event.currentParticipants || 0;
  const availableSeats = totalCapacity - currentParticipants;
  const occupancyPercent = totalCapacity
  ? Math.round((currentParticipants / totalCapacity) * 100)
  : 0;

  // Check if user is already registered
  const isAlreadyRegistered = myRegistrations?.some(
  (reg) => (reg.event?._id === id || reg.event === id)
  );

  // Check if deadline has passed
  const isDeadlinePassed = event.deadline && new Date(event.deadline) < new Date();

  return (
  <div className="flex flex-col min-h-screen bg-slate-50/50">
  {/* <Navbar /> */}

  <main className="flex-1">
  <div className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden">
  <div className="absolute inset-0 bg-linear-to-b from-indigo-600/5 to-transparent -z-10"></div>

  <div className="max-w-7xl mx-auto px-6">
  <button
  onClick={() => navigate("/events")}
  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
  >
  <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md transition-all">
  <ChevronLeft size={18} />
  </div>
  <span className="font-medium text-sm">Back to all events</span>
  </button>

  <div className="grid lg:grid-cols-12 gap-12 items-start">
  {/* Left Column */}
  <div className="lg:col-span-8 space-y-8">
  <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
  {event.poster ? (
  <img
  src={normalizePoster(event.poster)}
  alt={event.title}
  className="w-full h-full object-cover"
  />
  ) : (
  <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold">
  {event.title?.[0]}
  </div>
  )}
  <div className="absolute top-6 left-6">
  <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
  <CountdownTimer targetDate={event.eventDate} />
  </div>
  </div>
  </div>

  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
  <div className="flex flex-wrap gap-3 mb-6">
  <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
  {event.category}
  </span>
  <span
  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${event.isPaid && event.price > 0
  ? "bg-green-50 text-green-600 border-green-100"
  : "bg-emerald-50 text-emerald-600 border-emerald-100"
  }`}
  >
  {event.isPaid && event.price > 0
  ? `Rs. ${event.price}`
  : "Free Event"}
  </span>
  </div>

  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
  {event.title}
  </h1>

  <div className="grid sm:grid-cols-2 gap-6 pb-8 border-b border-slate-50">
  <div className="flex items-start gap-4">
  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 mt-1">
  <Calendar size={20} />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
  Date & Time
  </p>
  <p className="text-slate-700 font-semibold">
  {formatDate(event.eventDate)}
  </p>
  <p className="text-slate-500 text-sm italic">
  Starting at {formatTime(event.eventDate)}
  </p>
  </div>
  </div>
  <div className="flex items-start gap-4">
  <div
  className={`p-3 rounded-2xl mt-1 ${event.eventType === "online"
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
  <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
  {event.eventType === "online"
  ? "Event Type"
  : "Location"}
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
  <p className="text-slate-500 text-sm">
  {event.venue || "To be announced"}
  </p>
  {event.googleMapUrl && (
  <a
  href={event.googleMapUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="text-indigo-600 text-xs font-medium hover:underline mt-1 inline-block"
  >
  View on Maps
  </a>
  )}
  </>
  )}
  </div>
  </div>
  </div>

  <div className="pt-8">
  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
  <Info size={20} className="text-indigo-600" /> Description
  </h2>
  <p className="text-slate-600 leading-relaxed">
  {event.description ||
  "No description provided for this event."}
  </p>
  </div>

  {event.tags?.length > 0 && (
  <div className="pt-8">
  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
  Tags
  </h3>
  <div className="flex flex-wrap gap-2">
  {event.tags.map((tag, index) => (
  <span
  key={index}
  className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-medium"
  >
  #{tag}
  </span>
  ))}
  </div>
  </div>
  )}
  </div>
  </div>

  {/* Right Column */}
  <div className="lg:col-span-4 space-y-8 sticky top-24">
  <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
  <div className="space-y-6">
  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
  <div className="flex items-center gap-3">
  <Users size={20} className="text-indigo-600" />
  <div>
  <p className="text-lg font-bold text-slate-800">
  {availableSeats}
  </p>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
  Available Seats
  </p>
  </div>
  </div>
  <div className="text-right">
  <p className="text-lg font-bold text-slate-800">
  {totalCapacity}
  </p>
  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
  Total
  </p>
  </div>
  </div>

  <div className="space-y-2">
  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
  <div
  className={`h-full transition-all duration-1000 rounded-full ${occupancyPercent > 90
  ? "bg-rose-500"
  : occupancyPercent > 70
  ? "bg-orange-500"
  : "bg-indigo-600"
  }`}
  style={{ width: `${occupancyPercent}%` }}
  ></div>
  </div>
  <p className="text-xs text-center text-slate-500 font-medium">
  {occupancyPercent}% of seats already reserved
  </p>
  </div>

  {event.deadline && (
  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
  <Clock size={18} className="text-amber-500 mt-0.5" />
  <div>
  <p className="text-sm font-bold text-amber-600">
  Registration Deadline
  </p>
  <p className="text-xs text-amber-500 font-medium">
  {formatDate(event.deadline)}
  </p>
  </div>
  </div>
  )}

  {/* Registration Fee & Action Section */}
  <div className="pt-8 border-t border-slate-50 space-y-12">
  <div className="flex justify-between items-center">
  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Fee</span>
  <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center justify-center min-w-[120px]">
  <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">
  {event.isPaid && event.price > 0 ? `Rs. ${event.price}` : "Free"}
  </span>
  </div>
  </div>

  <button
  className={`w-full py-6 rounded-full font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 
  ${isAlreadyRegistered && !isDeadlinePassed
  ? "bg-indigo-50 text-indigo-600 border border-indigo-100 cursor-not-allowed shadow-none"
  : isDeadlinePassed || (availableSeats <= 0 && event.registrationType === "system")
  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
  : "bg-linear-to-r from-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95"
  }`}
  onClick={() => {
  if (
  event.registrationType === "google_form" &&
  event.googleFormUrls?.[0]
  ) {
  window.open(event.googleFormUrls[0], "_blank");
  } else {
  navigate(`/register-for-event/${event._id}`);
  }
  }}
  disabled={
  isAlreadyRegistered ||
  isDeadlinePassed ||
  (availableSeats <= 0 &&
  event.registrationType === "system")
  }
  >
  {isAlreadyRegistered
  ? "Registration Completed"
  : isDeadlinePassed
  ? "Registration Closed"
  : event.registrationType === "google_form"
  ? "Register via Link"
  : availableSeats > 0
  ? "Book My Seat Now"
  : "Event Full"}
  </button>

  <div className="flex justify-center gap-10 pt-2">
  <button
  className="flex items-center gap-2.5 text-[9px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.15em]"
  onClick={() => setShowQrModal(true)}
  >
  <QrCode size={16} /> QR Info
  </button>

  <button
  className="flex items-center gap-2.5 text-[9px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.15em]"
  onClick={async () => {
  await navigator.clipboard.writeText(
  window.location.href,
  );
  toast.success("Copied!");
  }}
  >
  <Share2 size={16} /> Share
  </button>
  </div>
  </div>
  </div>
  </div>

  {showQrModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
  <button
  className="absolute top-3 right-3 rounded-full p-2 text-slate-500 hover:bg-slate-100"
  onClick={() => setShowQrModal(false)}
  >
  
  </button>
  <h3 className="text-lg font-bold text-slate-900">
  Share Event via QR
  </h3>
  <p className="text-sm text-slate-500 mt-1">
  Scan this code to open the event page.
  </p>
  {qrDataUrl ? (
  <div className="mt-4 flex flex-col items-center">
  <img
  src={qrDataUrl}
  alt="Event QR code"
  className="h-52 w-52 rounded-lg border border-slate-200"
  />
  <a
  href={qrDataUrl}
  download={`${event.title}-EventHub-qr.png`}
  className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
  >
  Download QR
  </a>
  </div>
  ) : (
  <p className="mt-4 text-sm text-slate-500">
  Generating QR code...
  </p>
  )}
  </div>
  </div>
  )}

  {event.organizer && (
  <div className="bg-indigo-600 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-200 overflow-hidden relative group mt-8 text-white">
  <div className="relative z-10">
  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-10">Organized By</p>

  <div className="flex items-start gap-6 mb-8">
  <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
  <Building2 size={32} />
  </div>
  <div className="flex-1">
  <h4 className="text-xl font-black text-white tracking-tighter mb-2">
  {event.organizer.name}
  </h4>
  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
  <CheckCircle2 size={12} /> Verified Legacy
  </div>
  </div>
  </div>

  <div className="w-full h-px bg-white/10 mb-8" />

  <div className="space-y-4 mb-8">
  {event.organizer.email && (
  <div className="flex items-center gap-4 text-sm font-bold text-white/80">
  <Mail size={18} className="text-white/40" />
  <span>{event.organizer.email}</span>
  </div>
  )}
  {event.organizer.website && (
  <div className="flex items-center gap-4 text-sm font-bold text-white/80">
  <Globe size={18} className="text-white/40" />
  <a href={event.organizer.website} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">{event.organizer.website}</a>
  </div>
  )}
  </div>

  {/* Socials Link Icons */}
  <div className="flex flex-wrap gap-2 pt-4">
  {[
  { icon: Facebook, url: event.organizer.facebook },
  { icon: Instagram, url: event.organizer.instagram },
  { icon: Twitter, url: event.organizer.twitter },
  { icon: Github, url: event.organizer.github },
  { icon: Linkedin, url: event.organizer.linkedin }
  ].filter(s => s.url).map((social, i) => {
  const Icon = social.icon;
  return (
  <a key={i} href={social.url} target="_blank" rel="noreferrer" className="w-11 h-11 bg-white/10 hover:bg-white text-white hover:text-indigo-600 rounded-xl flex items-center justify-center transition-all duration-300 border border-white/5">
  <Icon size={18} />
  </a>
  );
  })}
  </div>

  <button
  onClick={() =>
  navigate(`/events?organizer=${event.organizer._id}`)
  }
  className="w-full mt-10 py-5 bg-white/10 hover:bg-white text-white hover:text-indigo-600 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2"
  >
  View All Their Events <ExternalLink size={14} />
  </button>
  </div>
  </div>
  )}
  </div>
  </div>
  </div>
  </div>
  </main>

  <Footer />
  </div>
  );
};

export default EventDetails;
