import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Layers,
  Search,
  PlusCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toast } from "react-hot-toast";
import ClubSidebar from "./ClubSidebar";
import useOrganizer from "../../hooks/useOrganizer";
import HorizontalEventScroll from "../../components/common/HorizontalEventScroll";

const ManageYourEvents = () => {
  const navigate = useNavigate();
  const {
  orgEvents,
  loading,
  error,
  fetchOrganizerEvents,
  deleteOrganizerEvent,
  } = useOrganizer();

  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
  isOpen: false,
  title: "",
  message: "",
  onConfirm: null,
  });
  const hasFetched = useRef(false);
  useEffect(() => {
  // Only fetch once when component mounts
  if (!hasFetched.current && !loading) {
  hasFetched.current = true;
  fetchOrganizerEvents();
  }
  }, [fetchOrganizerEvents, loading]); // Empty dependency array - only run once

  const handleDelete = (id) => {
  setConfirmDialog({
  isOpen: true,
  title: "Delete Event",
  message:
  "Are you sure you want to delete this event? This action cannot be undone.",
  onConfirm: async () => {
  try {
  const result = await deleteOrganizerEvent(id);
  if (!result?.error) {
  toast.success("Event deleted successfully.");
  } else {
  toast.error(result.error || "Delete failed.");
  }
  } catch (error) {
  toast.error(error.message || "Delete failed. Please try again.");
  } finally {
  setConfirmDialog({ isOpen: false });
  }
  },
  });
  };

  // Navigate to event details page
  const handleView = (event) => {
  navigate(`/club/my-events/${event._id}`);
  };

  // Navigate to event edit page with event ID as URL param
  const handleEdit = (event) => {
  navigate(`/club/create-event?id=${event._id}`);
  };

  const filteredEvents = orgEvents?.filter((e) =>
  e.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
  <div className="min-h-screen flex bg-[#F8F9FD]">
  <ClubSidebar />

  <main className="flex-1 p-10 overflow-auto">
  {/* Header Section */}
  <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
  <div>
  <p className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-2 flex items-center gap-2">
  <Calendar size={14} /> Event Management Dashboard
  </p>
  <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
  All{""}
  <span className="text-indigo-600 underline decoration-4 decoration-indigo-100 underline-offset-8">
  Events Data
  </span>
  </h1>
  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-3 opacity-70">
  View and manage all your hosted events activities
  </p>
  </div>

  <div className="flex gap-4">
  <div className="relative group">
  <Search
  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
  size={18}
  />
  <input
  type="text"
  placeholder="Search events..."
  className="bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-8 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-700 shadow-sm w-64 lg:w-80"
  onChange={(e) => setSearchTerm(e.target.value)}
  value={searchTerm}
  />
  </div>
  <Link
  to="/club/create-event"
  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-3"
  >
  <PlusCircle size={18} /> Create New Event
  </Link>
  </div>
  </header>

  {loading ? (
  <div className="grid gap-6">
  {[1, 2, 3].map((i) => (
  <div
  key={i}
  className="h-28 bg-white/50 border border-slate-100 rounded-[2rem] animate-pulse"
  ></div>
  ))}
  </div>
  ) : error ? (
  <div className="bg-rose-50 border border-rose-100 p-12 rounded-[3rem] text-rose-600 flex flex-col items-center text-center gap-4">
  <div className="p-4 bg-rose-100 rounded-full animate-bounce">
  <AlertCircle size={32} />
  </div>
  <h3 className="text-xl font-black uppercase tracking-tight">
  Error: Connection Failed
  </h3>
  <p className="font-bold text-xs max-w-xs">{error}</p>
  <button
  onClick={() => fetchOrganizerEvents()}
  className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
  >
  Try Again
  </button>
  </div>
  ) : filteredEvents?.length > 0 ? (
  <div className="space-y-8">
  {/* Section Title */}
  <div className="flex items-center gap-4">
  <div className="h-1 w-12 bg-linear-to-r from-indigo-600 to-indigo-300 rounded-full"></div>
  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
  Your Events (Card View)
  </h2>
  </div>

  {/* Responsive Grid of Event Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredEvents.map((event) => (
  <div key={event._id} className="flex flex-col">
  <HorizontalEventScroll
  events={[event]}
  onDelete={handleDelete}
  onView={handleView}
  onEdit={handleEdit}
  loading={false}
  error={null}
  isDeleting={false}
  />
  </div>
  ))}
  </div>
  </div>
  ) : (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-32 text-center">
  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-8 border border-slate-100">
  <Layers size={48} />
  </div>
  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
  No Events Found
  </h3>
  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
  {searchTerm
  ? "No events match your search criteria."
  : "You haven't created any events yet. Click 'Create New Event' to get started."}
  </p>
  {searchTerm && (
  <button
  onClick={() => setSearchTerm("")}
  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
  >
  Clear Search
  </button>
  )}
  </div>
  )}
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

export default ManageYourEvents;
