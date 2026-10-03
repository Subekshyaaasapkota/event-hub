import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Mail,
  Phone,
  Building2,
  ChevronLeft,
  Search,
  Filter,
  Download,
  Eye,
  UserCheck,
  Clock,
  MapPin,
  Shield,
  BarChart3,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import useAdmin from "../../hooks/useAdmin";
import { exportToCsv, stampedFilename } from "../../utils/csv";
import { toast } from "react-hot-toast";

const AdminRegistrations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");

  const { fetchRegistrations, registrations, loading, error } = useAdmin();

  useEffect(() => {
  fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
  if (error) {
  toast.error(error);
  }
  }, [error]);

  // Get unique events for filter dropdown
  const uniqueEvents = [
  ...new Set(
  registrations
  .filter((reg) => reg.event && reg.event._id)
  .map((reg) => reg.event._id),
  ),
  ].map((eventId) => {
  const reg = registrations.find((r) => r.event && r.event._id === eventId);
  return {
  id: eventId,
  title: reg.event.title,
  organizer: reg.event.organizer?.name || "Unknown Club",
  };
  });

  // Filter registrations based on search and event filter
  const filteredRegistrations = registrations.filter((reg) => {
  // Skip registrations without valid event data
  if (!reg.event || !reg.event._id) return false;

  const matchesSearch =
  searchTerm === "" ||
  reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  reg.user.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
  reg.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (reg.event.organizer?.name || "")
  .toLowerCase()
  .includes(searchTerm.toLowerCase());

  const matchesEvent =
  selectedEvent === "all" || reg.event._id === selectedEvent;

  return matchesSearch && matchesEvent;
  });

  const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  });
  };

const CSV_COLUMNS = [
{ key: "Event Title", label: "Event Title" },
{ key: "Club/Organizer", label: "Club/Organizer" },
{ key: "Event Date", label: "Event Date" },
{ key: "Student Name", label: "Student Name" },
{ key: "Email", label: "Email" },
{ key: "Phone", label: "Phone" },
{ key: "College", label: "College" },
{ key: "Registration Date", label: "Registration Date" },
{ key: "Status", label: "Status" },
];

const exportToCSV = () => {
const rows = filteredRegistrations.map((reg) => ({
"Event Title": reg.event?.title || "Unknown Event",
"Club/Organizer": reg.event?.organizer?.name || "Unknown",
"Event Date": reg.event?.eventDate ? formatDate(reg.event.eventDate) : "N/A",
"Student Name": reg.user?.name || "Unknown",
Email: reg.user?.email || "N/A",
Phone: reg.phone || "N/A",
College: reg.user?.college || "N/A",
"Registration Date": reg.createdAt ? formatDate(reg.createdAt) : "N/A",
Status: reg.status || "N/A",
}));

// Exports exactly what the table is showing, so a filtered view does not
// silently hand back the full list.
const filename =
selectedEvent === "all"
? stampedFilename("all-event-registrations")
: `registrations-${(uniqueEvents.find((e) => e._id === selectedEvent)?.title || "event")
.replace(/[^a-z0-9]+/gi, "-")
.replace(/^-|-$/g, "")
.toLowerCase()}.csv`;

const result = exportToCsv({
rows,
columns: CSV_COLUMNS,
filename,
emptyMessage: "No registrations match the current search and filters.",
});

if (result.ok) {
toast.success(result.message);
} else {
toast.error(result.message);
}
};

  if (loading) {
  return (
  <div className="min-h-screen flex flex-col bg-slate-50">
  <main className="flex-1 flex items-center justify-center">
  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
  </main>
  </div>
  );
  }

  if (error) {
  return (
  <div className="min-h-screen flex flex-col bg-slate-50">
  <main className="flex-1 p-10 flex items-center justify-center">
  <div className="bg-rose-50 border border-rose-200 rounded-3xl p-12 max-w-2xl text-center">
  <div className="text-rose-500 mb-4 flex justify-center">
  <Shield size={48} />
  </div>
  <h3 className="text-2xl font-black text-slate-900 mb-2">
  Access Denied
  </h3>
  <p className="text-slate-600 font-bold mb-6">{error}</p>
  <button
  onClick={() => navigate("/admin/dashboard")}
  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
  >
  Back to Dashboard
  </button>
  </div>
  </main>
  </div>
  );
  }

  return (
  <div className="min-h-screen flex flex-col bg-slate-50">
  {/* <Navbar /> */}

  <main className="flex-1 p-8 overflow-auto">
  {/* Header */}
  <div className="mb-8 flex items-center justify-between">
  <button
  onClick={() => navigate("/admin/dashboard")}
  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold"
  >
  <ChevronLeft size={20} /> Back to Dashboard
  </button>
  <button
  onClick={exportToCSV}
  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg"
  >
  <Download size={18} /> Export CSV
  </button>
  </div>

  {/* Title and Stats */}
  <div className="mb-8">
  <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
  All Event <span className="text-indigo-600">Registrations</span>
  </h1>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
  <Users size={24} className="text-indigo-600" />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
  Total Registrations
  </p>
  <p className="text-2xl font-black text-slate-900">
  {registrations.length}
  </p>
  </div>
  </div>
  </div>
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
  <Calendar size={24} className="text-emerald-600" />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
  Events with Registrations
  </p>
  <p className="text-2xl font-black text-slate-900">
  {uniqueEvents.length}
  </p>
  </div>
  </div>
  </div>
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
  <UserCheck size={24} className="text-amber-600" />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
  Confirmed
  </p>
  <p className="text-2xl font-black text-slate-900">
  {
  registrations.filter((r) => r.status === "Confirmed")
  .length
  }
  </p>
  </div>
  </div>
  </div>
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
  <BarChart3 size={24} className="text-purple-600" />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
  Avg per Event
  </p>
  <p className="text-2xl font-black text-slate-900">
  {uniqueEvents.length > 0
  ? Math.round(registrations.length / uniqueEvents.length)
  : 0}
  </p>
  </div>
  </div>
  </div>
  </div>
  </div>

  {/* Filters */}
  <div className="mb-8 flex flex-col md:flex-row gap-4">
  <div className="flex-1 relative">
  <Search
  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  size={20}
  />
  <input
  type="text"
  placeholder="Search by name, email, college, event, or club..."
  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-medium"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  />
  </div>
  <select
  className="px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none font-medium"
  value={selectedEvent}
  onChange={(e) => setSelectedEvent(e.target.value)}
  >
  <option value="all">All Events</option>
  {uniqueEvents.map((event) => (
  <option key={event.id} value={event.id}>
  {event.title} ({event.organizer})
  </option>
  ))}
  </select>
  </div>

  {/* Registrations List */}
  {filteredRegistrations.length > 0 ? (
  <div className="space-y-4">
  {filteredRegistrations.map((registration) => (
  <div
  key={registration._id}
  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all"
  >
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
  {/* Student Info */}
  <div className="flex items-start gap-4 flex-1">
  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
  <span className="text-indigo-600 font-black text-lg">
  {registration.user.name.charAt(0).toUpperCase()}
  </span>
  </div>
  <div className="flex-1 min-w-0">
  <h3 className="text-lg font-black text-slate-900 mb-1">
  {registration.user.name}
  </h3>
  <div className="space-y-1 text-sm text-slate-600">
  <div className="flex items-center gap-2">
  <Mail size={14} />
  <span>{registration.user.email}</span>
  </div>
  {registration.phone && (
  <div className="flex items-center gap-2">
  <Phone size={14} />
  <span>{registration.phone}</span>
  </div>
  )}
  {(registration.user.college ||
  registration.college) && (
  <div className="flex items-center gap-2">
  <Building2 size={14} />
  <span>
  {registration.user.college ||
  registration.college}
  </span>
  </div>
  )}
  </div>
  </div>
  </div>

  {/* Event Info */}
  <div className="flex-1">
  <div className="bg-slate-50 rounded-2xl p-4">
  <h4 className="font-bold text-slate-900 mb-2">
  {registration.event?.title || "Unknown Event"}
  </h4>
  <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
  <div className="flex items-center gap-1">
  <Calendar size={14} />
  <span>
  {registration.event?.eventDate
  ? formatDate(registration.event.eventDate)
  : "N/A"}
  </span>
  </div>
  <div className="flex items-center gap-1">
  <MapPin size={14} />
  <span>{registration.event?.district || "N/A"}</span>
  </div>
  </div>
  <div className="text-xs text-slate-500 font-medium">
  Organized by:{""}
  {registration.event?.organizer?.name || "Unknown Club"}
  </div>
  </div>
  </div>

  {/* Status and Actions */}
  <div className="flex flex-col items-end gap-3">
  <span
  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
  registration.status === "Confirmed"
  ? "bg-emerald-100 text-emerald-700"
  : registration.status === "Pending"
  ? "bg-amber-100 text-amber-700"
  : "bg-slate-100 text-slate-700"
  }`}
  >
  {registration.status}
  </span>
  <div className="text-xs text-slate-500 font-medium">
  Registered: {formatDate(registration.createdAt)}
  </div>
  </div>
  </div>
  </div>
  ))}
  </div>
  ) : (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
  <Users size={32} className="text-slate-400" />
  </div>
  <h3 className="text-xl font-black text-slate-900 mb-2">
  No Registrations Found
  </h3>
  <p className="text-slate-600 font-medium">
  {searchTerm || selectedEvent !== "all"
  ? "Try adjusting your search or filter criteria"
  : "No registrations found in the system"}
  </p>
  </div>
  )}
  </main>

  {/* <Footer /> */}
  </div>
  );
};

export default AdminRegistrations;
