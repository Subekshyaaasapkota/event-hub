import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Building2,
  MapPin,
  Mail,
  Globe,
  XCircle,
  CheckCircle,
  User,
  Calendar,
  AlertCircle,
  Phone,
  Users,
  CalendarDays,
  RefreshCw,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  ExternalLink,
  ChevronRight,
  X,
  ShieldCheck,
  Zap,
  BookOpen,
} from "lucide-react";
import useAdmin from "../../hooks/useAdmin";
import Footer from "../../components/common/Footer";

const AdminManageClubs = () => {
  const { adminData, fetchClubs, approveClub, rejectClub } = useAdmin();
  const [filter, setFilter] = useState("pending");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
  isOpen: false,
  title: "",
  message: "",
  onConfirm: null,
  });

  const VITE_BASE_API_URL =
  import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";

  useEffect(() => {
  fetchClubs();
  }, [fetchClubs]);

  const handleRefresh = async () => {
  setRefreshing(true);
  await fetchClubs();
  setRefreshing(false);
  };

  const filteredClubs =
  adminData.clubs?.filter((club) => {
  if (filter === "all") return true;
  if (filter === "pending") return club.status === "Pending";
  if (filter === "approved") return club.status === "Approved";
  if (filter === "rejected") return club.status === "Rejected";
  return true;
  }) || [];

  const getCategoryLabel = (category) => {
  const categories = {
  college_club: "College Club",
  national_org: "National Organization",
  international_org: "International Organization",
  niche_community: "Niche Community",
  other: "Other",
  };
  return categories[category] || category || "Not specified";
  };

  const getStatusBadge = (status) => {
  switch (status) {
  case "Approved":
  return (
  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
  Verified
  </span>
  );
  case "Rejected":
  return (
  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
  Rejected
  </span>
  );
  default:
  return (
  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
  <AlertCircle size={10} /> Pending
  </span>
  );
  }
  };

  const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  });
  };

  const handleApprove = (clubId) => {
  setConfirmDialog({
  isOpen: true,
  title: "Approve Club",
  message:
  "Approve this club? They will be notified via email and can start hosting events.",
  onConfirm: async () => {
  try {
  await approveClub(clubId);
  toast.success("Club approved and welcome email sent!");
  setSelectedClub(null);
  } catch (error) {
  toast.error(error.message || "Failed to approve club.");
  } finally {
  setConfirmDialog({ isOpen: false });
  }
  },
  });
  };

  const handleReject = (clubId) => {
  setConfirmDialog({
  isOpen: true,
  title: "Reject Club",
  message: "Reject this club application?",
  onConfirm: async () => {
  try {
  await rejectClub(clubId);
  toast.success("Club request rejected.");
  setSelectedClub(null);
  } catch (error) {
  toast.error(error.message || "Failed to reject club.");
  } finally {
  setConfirmDialog({ isOpen: false });
  }
  },
  });
  };

  return (
  <div className="min-h-screen flex flex-col bg-[#FDFDFF]">
  <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
  <div className="space-y-1">
  <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter leading-tight">
  Club <span className="text-amber-600">Verification</span>
  </h1>
  <p className="text-slate-500 font-medium tracking-tight">
  Review club credentials before granting event hosting privileges.
  </p>
  </div>

  <div className="flex flex-wrap gap-3">
  <button
  onClick={handleRefresh}
  disabled={refreshing}
  className="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 shadow-sm"
  >
  <RefreshCw
  size={14}
  className={refreshing ? "animate-spin" : ""}
  />
  Refresh
  </button>

  <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
  {["pending", "approved", "rejected", "all"].map((tab) => (
  <button
  key={tab}
  onClick={() => setFilter(tab)}
  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
  filter === tab
  ? "bg-slate-900 text-white shadow-lg"
  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
  }`}
  >
  {tab}
  <span
  className={`px-1.5 py-0.5 rounded-md text-[9px] ${filter === tab ? "bg-white/20" : "bg-slate-100"}`}
  >
  {adminData.clubs?.filter((c) =>
  tab === "all" ? true : c.status.toLowerCase() === tab,
  ).length || 0}
  </span>
  </button>
  ))}
  </div>
  </div>
  </div>

  {/* Clubs Grid */}
  {filteredClubs.length === 0 ? (
  <div className="bg-white rounded-[3rem] p-32 text-center max-w-2xl mx-auto shadow-xl shadow-slate-100 border border-slate-100">
  <Building2
  className="mx-auto mb-6 text-slate-200"
  size={80}
  strokeWidth={1}
  />
  <h2 className="text-xl font-black text-slate-400 tracking-widest uppercase italic">
  No registration requests found
  </h2>
  </div>
  ) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {filteredClubs.map((club) => (
  <div
  key={club._id || club.id}
  onClick={() => setSelectedClub(club)}
  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
  >
  {club.status === "Pending" && (
  <div className="absolute top-0 right-0 p-2">
  <span className="flex h-3 w-3">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
  </span>
  </div>
  )}

  <div className="p-8">
  <div className="flex items-center gap-4 mb-6">
  <div className="w-16 h-16 rounded-3xl bg-slate-50 p-1 border border-slate-100 flex items-center justify-center overflow-hidden">
  <img
  src={club.logo}
  alt=""
  className="w-full h-full object-cover rounded-2xl"
  />
  </div>
  <div>
  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">
  {club.name}
  </h3>
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
  {getCategoryLabel(club.category)}
  </p>
  </div>
  </div>

  <div className="space-y-4 mb-8">
  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
  <MapPin size={16} className="text-indigo-500" />{""}
  {club.district}
  </div>
  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
  <Mail size={16} className="text-indigo-500" />{""}
  {club.email}
  </div>
  </div>

  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
  {getStatusBadge(club.status)}
  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:gap-3 transition-all">
  Details <ChevronRight size={14} />
  </div>
  </div>
  </div>
  </div>
  ))}
  </div>
  )}
  </main>

  {/* Verification Modal */}
  {selectedClub && (
  <div
  className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
  onClick={() => setSelectedClub(null)}
  >
  <div
  className="bg-white rounded-[4rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
  onClick={(e) => e.stopPropagation()}
  >
  <div className="grid lg:grid-cols-5 h-full">
  {/* Sidebar Info */}
  <div className="lg:col-span-2 bg-slate-50 p-12 border-r border-slate-100">
  <div className="w-40 h-40 rounded-[3rem] bg-white p-2 shadow-xl shadow-slate-200 mx-auto mb-8">
  <img
  src={selectedClub.logo}
  className="w-full h-full object-cover rounded-[2.5rem]"
  />
  </div>
  <div className="text-center mb-10">
  <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
  {selectedClub.name}
  </h2>
  <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
  {getCategoryLabel(selectedClub.category)}
  </div>
  </div>

  <div className="space-y-6">
  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
  <Phone size={20} className="text-indigo-600" />
  <div>
  <p className="text-[9px] font-black text-slate-300 uppercase">
  Phone Line
  </p>
  <p className="text-sm font-black text-slate-700">
  {selectedClub.phone}
  </p>
  </div>
  </div>
  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
  <Globe size={20} className="text-indigo-600" />
  <div>
  <p className="text-[9px] font-black text-slate-300 uppercase">
  Digital Hub
  </p>
  <a
  href={selectedClub.website}
  target="_blank"
  rel="noreferrer"
  className="text-sm font-black text-indigo-600 flex items-center gap-1"
  >
  Website <ExternalLink size={12} />
  </a>
  </div>
  </div>
  </div>
  </div>

  {/* Main Content Info */}
  <div className="lg:col-span-3 p-12 relative">
  <button
  onClick={() => setSelectedClub(null)}
  className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"
  >
  <X size={32} />
  </button>

  <div className="mb-10">
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4 flex items-center gap-2">
  <BookOpen size={12} /> Club Biography
  </h4>
  <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-100 italic">
  "{selectedClub.description}"
  </p>
  </div>

  <div className="grid grid-cols-2 gap-8 mb-10">
  <div>
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-3">
  Organization Head
  </h4>
  <div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
  {selectedClub.contactPerson?.[0]}
  </div>
  <div>
  <p className="text-sm font-black text-slate-800">
  {selectedClub.contactPerson}
  </p>
  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
  {selectedClub.createdBy?.name || "Member"}
  </p>
  </div>
  </div>
  </div>
  <div>
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-3">
  Telemetry
  </h4>
  <p className="text-sm font-black text-slate-800">
  EST. {selectedClub.establishedYear}
  </p>
  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
  Since {formatDate(selectedClub.createdAt)}
  </p>
  </div>
  </div>

  {/* Social Connects */}
  <div className="mb-12">
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4">
  Network Protocols
  </h4>
  <div className="flex flex-wrap gap-3">
  {selectedClub.facebook && (
  <a
  href={selectedClub.facebook}
  className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
  >
  <Facebook size={18} />
  </a>
  )}
  {selectedClub.linkedin && (
  <a
  href={selectedClub.linkedin}
  className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
  >
  <Linkedin size={18} />
  </a>
  )}
  {selectedClub.github && (
  <a
  href={selectedClub.github}
  className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
  >
  <Github size={18} />
  </a>
  )}
  {selectedClub.instagram && (
  <a
  href={selectedClub.instagram}
  className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
  >
  <Instagram size={18} />
  </a>
  )}
  {selectedClub.youtube && (
  <a
  href={selectedClub.youtube}
  className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
  >
  <Youtube size={18} />
  </a>
  )}
  </div>
  </div>

  {/* Admin Actions */}
  {selectedClub.status === "Pending" ? (
  <div className="flex gap-4">
  <button
  onClick={() => handleApprove(selectedClub._id)}
  className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-100"
  >
  Verify Organization <ShieldCheck size={18} />
  </button>
  <button
  onClick={() => handleReject(selectedClub._id)}
  className="flex-1 py-5 bg-red-50 text-red-500 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
  >
  Decline Request <XCircle size={18} />
  </button>
  </div>
  ) : (
  <div
  className={`p-6 rounded-[2.5rem] flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest ${selectedClub.status === "Approved" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
  >
  {selectedClub.status === "Approved" ? (
  <ShieldCheck size={20} />
  ) : (
  <XCircle size={20} />
  )}
  Organization is {selectedClub.status}
  </div>
  )}
  </div>
  </div>
  </div>
  </div>
  )}

  <Footer />
  <ConfirmDialog
  isOpen={confirmDialog.isOpen}
  onClose={() => setConfirmDialog({ isOpen: false })}
  onConfirm={confirmDialog.onConfirm}
  title={confirmDialog.title}
  message={confirmDialog.message}
  type="warning"
  />
  </div>
  );
};

export default AdminManageClubs;
