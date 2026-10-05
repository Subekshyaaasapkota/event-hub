// src/pages/admin/AllClubs.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Building2,
  MapPin,
  Mail,
  Globe,
  Search,
  XCircle,
  CheckCircle,
  AlertCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  User,
  Calendar,
} from "lucide-react";
import useAdmin from "../../hooks/useAdmin";

const AdminAllClubs = () => {
  const { adminData, fetchClubs, approveClub, rejectClub } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "default",
    onConfirm: null,
  });

  useEffect(() => {
  fetchClubs();
  }, [fetchClubs]);

  const handleApproveClub = (id, name) => {
  setConfirmDialog({
  isOpen: true,
title: `Approve ${name}`,
    message:
    "This gives the club owner the club features. You can still reject it afterwards.",
    type: "default",
  onConfirm: async () => {
  try {
  await approveClub(id);
  toast.success("Club approved successfully!");
  setConfirmDialog({ isOpen: false });
  } catch (error) {
  toast.error(
  error.message || "Failed to approve club. Please try again.",
  );
  setConfirmDialog({ isOpen: false });
  }
  },
  });
  };

  const handleRejectClub = (id, name) => {
  setConfirmDialog({
  isOpen: true,
title: `Reject ${name}`,
    message:
    "The club will not get club features. The owner can see this and apply again.",
    // Was "warning", which ConfirmDialog does not recognise. It only branches on
    // "danger", so a rejection that denies someone access looked identical to an
    // approval that grants it. Both buttons were styled as safe.
    type: "danger",
  onConfirm: async () => {
  try {
  await rejectClub(id);
  toast.success("Club rejected successfully!");
  setConfirmDialog({ isOpen: false });
  } catch (error) {
  toast.error(
  error.message || "Failed to reject club. Please try again.",
  );
  setConfirmDialog({ isOpen: false });
  }
  },
  });
  };

  const filteredClubs =
  adminData.clubs?.filter((club) => {
  const matchesSearch =
  club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  club.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  club.district?.toLowerCase().includes(searchTerm.toLowerCase());

  // Normalize status to lowercase for comparison
  const clubStatus = club.status?.toLowerCase() || "pending";
  const matchesStatus =
  statusFilter === "all" || clubStatus === statusFilter.toLowerCase();

  return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
  case "approved":
  return (
  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
  <CheckCircle size={12} /> Approved
  </span>
  );
  case "rejected":
  return (
  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
  <XCircle size={12} /> Rejected
  </span>
  );
  default:
  return (
  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
  <AlertCircle size={12} /> Pending
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

  // Show loading state
  if (adminData.loading && !adminData.clubs) {
  return (
  <div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
  <p className="mt-4 text-slate-600">Loading clubs...</p>
  </div>
  </div>
  );
  }

  return (
  <div>
  <div className="mb-8">
  <h1 className="text-3xl font-black text-slate-800 mb-2">All Clubs</h1>
  <p className="text-slate-500">
  Manage and oversee all registered clubs and organizations
  </p>
  {adminData.error && (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
  Error: {adminData.error}
  </div>
  )}
  </div>

  {/* Filters */}
  <div className="flex flex-col md:flex-row gap-4 mb-8">
  <div className="flex-1 relative">
  <Search
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
  size={18}
  />
  <input
  type="text"
  placeholder="Search clubs by name, email, or district..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition"
  />
  </div>
  <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-100">
  {[
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  ].map((status) => (
  <button
  key={status.value}
  onClick={() => setStatusFilter(status.value)}
  className={`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition ${
  statusFilter === status.value
  ? "bg-slate-900 text-white"
  : "text-slate-500 hover:bg-slate-50"
  }`}
  >
  {status.label}
  {status.value !== "all" && (
  <span className="ml-2 text-xs">
  (
  {adminData.clubs?.filter(
  (c) => c.status?.toLowerCase() === status.value,
  ).length || 0}
  )
  </span>
  )}
  </button>
  ))}
  </div>
  </div>

  {/* Clubs Grid */}
  {adminData.loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {[1, 2, 3, 4].map((i) => (
  <div
  key={i}
  className="h-64 bg-slate-50 animate-pulse rounded-2xl"
  />
  ))}
  </div>
  ) : filteredClubs.length === 0 ? (
  <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
  <Building2 className="mx-auto mb-4 text-slate-300" size={48} />
  <p className="text-slate-500 font-medium">
  {searchTerm || statusFilter !== "all"
  ? "No clubs match your search criteria"
  : "No clubs found in the system"}
  </p>
  {(searchTerm || statusFilter !== "all") && (
  <button
  onClick={() => {
  setSearchTerm("");
  setStatusFilter("all");
  }}
  className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
  >
  Clear filters
  </button>
  )}
  </div>
  ) : (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {filteredClubs.map((club) => (
  <div
  key={club._id || club.id}
  className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition ${
  club.status === "Pending"
  ? "border-amber-200 shadow-amber-50"
  : club.status === "Approved"
  ? "border-emerald-100"
  : "border-red-100"
  }`}
  >
  <div className="flex items-start justify-between mb-4">
  <div className="flex items-center gap-4">
  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden">
  {club.logo ? (
  <img
  src={club.logo}
  alt={club.name}
  className="w-full h-full object-cover"
  />
  ) : (
  <Building2 size={32} className="text-indigo-400" />
  )}
  </div>
  <div>
  <h3 className="text-lg font-black text-slate-800">
  {club.name}
  </h3>
  <div className="flex flex-col gap-1 mt-1 text-xs text-slate-500">
  <span className="flex items-center gap-1">
  <MapPin size={12} /> {club.district || "N/A"}
  </span>
  <span className="flex items-center gap-1">
  <Mail size={12} /> {club.email}
  </span>
  </div>
  </div>
  </div>
  {getStatusBadge(club.status)}
  </div>

  {club.description && (
  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
  {club.description}
  </p>
  )}

  {club.website && (
  <a
  href={club.website}
  target="_blank"
  rel="noreferrer"
  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mb-4"
  >
  <Globe size={12} /> {club.website}
  </a>
  )}
  {/* In the club card, after the description or website section */}
  <div className="flex items-center gap-3 mt-3">
  {club.facebook && (
  <a
  href={club.facebook}
  target="_blank"
  rel="noopener noreferrer"
  className="text-slate-400 hover:text-blue-600"
  >
  <Facebook size={14} />
  </a>
  )}
  {club.instagram && (
  <a
  href={club.instagram}
  target="_blank"
  rel="noopener noreferrer"
  className="text-slate-400 hover:text-pink-600"
  >
  <Instagram size={14} />
  </a>
  )}
  {club.twitter && (
  <a
  href={club.twitter}
  target="_blank"
  rel="noopener noreferrer"
  className="text-slate-400 hover:text-blue-400"
  >
  <Twitter size={14} />
  </a>
  )}
  {club.linkedin && (
  <a
  href={club.linkedin}
  target="_blank"
  rel="noopener noreferrer"
  className="text-slate-400 hover:text-blue-700"
  >
  <Linkedin size={14} />
  </a>
  )}
  {club.github && (
  <a
  href={club.github}
  target="_blank"
  rel="noopener noreferrer"
  className="text-slate-400 hover:text-gray-900"
  >
  <Github size={14} />
  </a>
  )}
  {club.youtube && (
  <a
  href={club.youtube}
  target="_blank"
  rel="noopener noreferrer"
  className="text-slate-400 hover:text-red-600"
  >
  <Youtube size={14} />
  </a>
  )}
  </div>
  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
  <div className="text-xs text-slate-400">
  <div>
  Created by:{""}
  <span className="font-medium text-slate-600">
  {club.createdBy?.name || "Unknown"}
  </span>
  </div>
  <div className="flex items-center gap-1 mt-1">
  <Calendar size={10} />
  <span>{formatDate(club.createdAt)}</span>
  </div>
  </div>

  {club.status === "Pending" && (
  <div className="flex gap-2">
  <button
  onClick={() => handleApproveClub(club._id || club.id, club.name)}
  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition active:scale-95"
  >
  <CheckCircle size={16} /> Approve
  </button>
  <button
  onClick={() => handleRejectClub(club._id || club.id, club.name)}
  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition active:scale-95"
  >
  <XCircle size={16} /> Reject
  </button>
  </div>
  )}

  {club.status === "Approved" && (
  <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
  Verified Club
  </div>
  )}

  {club.status === "Rejected" && (
  <div className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full">
  Rejected
  </div>
  )}
  </div>
  </div>
  ))}
  </div>
  )}
  <ConfirmDialog
  isOpen={confirmDialog.isOpen}
  onClose={() => setConfirmDialog({ isOpen: false })}
  onConfirm={confirmDialog.onConfirm}
title={confirmDialog.title}
    message={confirmDialog.message}
    type={confirmDialog.type}
  />
  </div>
  );
};

export default AdminAllClubs;
