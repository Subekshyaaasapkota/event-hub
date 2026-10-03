// src/pages/admin/AllUsers.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Users,
  Search,
  Trash2,
  Mail,
  Calendar,
  AlertCircle,
  Building,
  Map,
  Link,
  Code,
  Info,
  X,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import useAdmin from "../../hooks/useAdmin";
import { getImageUrl } from "../../utils/imageUrl";

const AdminAllUsers = () => {
  const { users, loading, error, fetchUsers, deleteUser } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null); // For detailed view modal
  const [confirmDialog, setConfirmDialog] = useState({
  isOpen: false,
  title: "",
  message: "",
  onConfirm: null,
  });

  const VITE_BASE_API_URL =
  import.meta.env.VITE_BASE_API_URL || "http://localhost:5000";

  useEffect(() => {
  fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = (userId) => {
  setConfirmDialog({
  isOpen: true,
  title: "Delete User",
  message:
  "Are you sure you want to delete this user? This action cannot be undone.",
  onConfirm: async () => {
  try {
  await deleteUser(userId);
  toast.success("User removed successfully.");
  setConfirmDialog({ isOpen: false });
  } catch (error) {
  toast.error(error.message || "Failed to delete user.");
  setConfirmDialog({ isOpen: false });
  }
  },
  });
  };

  const filteredUsers = (users || []).filter((user) => {
  const searchStr = searchTerm.toLowerCase();
  const matchesSearch =
  user.name?.toLowerCase().includes(searchStr) ||
  user.email?.toLowerCase().includes(searchStr) ||
  user.college?.toLowerCase().includes(searchStr) ||
  user.district?.toLowerCase().includes(searchStr);

  let userRole = "student";
  if (user.roles) {
  if (Array.isArray(user.roles)) {
  if (user.roles.includes("Admin")) userRole = "admin";
  else if (user.roles.includes("Club")) userRole = "club";
  }
  }

  const matchesRole = roleFilter === "all" || userRole === roleFilter;
  return matchesSearch && matchesRole;
  });

  const getRoleBadge = (user) => {
  let role = "student";
  let label = "Student";

  if (user.roles?.includes("Admin")) {
  role = "admin";
  label = "Admin";
  } else if (user.roles?.includes("Club")) {
  role = "club";
  label = "Club";
  }

  const colors = {
  admin: "bg-purple-50 text-purple-600 border-purple-100",
  club: "bg-indigo-50 text-indigo-600 border-indigo-100",
  student: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
  <span
  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors[role]}`}
  >
  {label}
  </span>
  );
  };

  // Helper to get counts for filters
  const getCount = (role) => {
  if (!users) return 0;
  if (role === "all") return users.length;
  return users.filter((u) => {
  if (role === "student")
  return !u.roles?.includes("Admin") && !u.roles?.includes("Club");
  if (role === "club") return u.roles?.includes("Club");
  if (role === "admin") return u.roles?.includes("Admin");
  return false;
  }).length;
  };

  return (
  <div className="pb-10">
  <div className="mb-10">
  <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter">
  User Directory
  </h1>
  <p className="text-slate-500 font-medium italic">
  Oversee all members registered on the EventHub network.
  </p>

  {error && (
  <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-3xl text-red-500 text-sm flex items-center gap-3">
  <AlertCircle size={18} />
  <span className="font-bold">Sync Error:</span> {error}
  </div>
  )}
  </div>

  {/* Filters Bar */}
  <div className="flex flex-col lg:flex-row gap-4 mb-10">
  <div className="flex-1 relative group">
  <Search
  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
  size={20}
  />
  <input
  type="text"
  placeholder="Search by name, email, or college..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full pl-14 pr-6 py-4 rounded-[2rem] border-none bg-white shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-slate-700"
  />
  </div>

  <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-slate-50">
  {[
  { id: "all", label: "ALL" },
  { id: "student", label: "STUDENT" },
  { id: "club", label: "CLUB" },
  { id: "admin", label: "ADMIN" },
  ].map((r) => (
  <button
  key={r.id}
  onClick={() => setRoleFilter(r.id)}
  className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
  roleFilter === r.id
  ? "bg-slate-900 text-white shadow-lg"
  : "text-slate-400 hover:text-slate-600"
  }`}
  >
  {r.label}
  <span
  className={`px-2 py-0.5 rounded-lg text-[9px] ${roleFilter === r.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}
  >
  {getCount(r.id)}
  </span>
  </button>
  ))}
  </div>
  </div>

  {/* Main Table Container */}
  <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
  <div className="overflow-x-auto">
  <table className="w-full text-left">
  <thead>
  <tr className="bg-slate-50/50 border-b border-slate-100">
  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
  Identity
  </th>
  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
  Contact Info
  </th>
  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
  College & District
  </th>
  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
  Role & Skills
  </th>
  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">
  Actions
  </th>
  </tr>
  </thead>
  <tbody className="divide-y divide-slate-50">
  {loading ? (
  Array(5)
  .fill(0)
  .map((_, i) => (
  <tr key={i} className="animate-pulse">
  <td
  colSpan="5"
  className="px-8 py-8 h-20 bg-slate-50/30"
  ></td>
  </tr>
  ))
  ) : filteredUsers.length === 0 ? (
  <tr>
  <td colSpan="5" className="px-8 py-32 text-center">
  <Users
  className="mx-auto mb-6 text-slate-200"
  size={80}
  strokeWidth={1}
  />
  <p className="text-xl font-black text-slate-300 tracking-tighter uppercase italic">
  No users found
  </p>
  </td>
  </tr>
  ) : (
  filteredUsers.map((u) => (
  <tr
  key={u.id || u._id}
  className="hover:bg-indigo-50/30 transition-colors group"
  >
  <td className="px-8 py-6">
  <div className="flex items-center gap-4">
  <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 overflow-hidden border-2 border-white">
  {u.profilePicture ? (
  <img
  src={getImageUrl(u.profilePicture)}
  alt=""
  className="w-full h-full object-cover"
  />
  ) : (
  u.name?.charAt(0).toUpperCase()
  )}
  </div>
  <div>
  <span className="font-black text-slate-800 tracking-tight block text-lg">
  {u.name}
  </span>
  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">
  ID: {u._id?.slice(-8) || "GEN-NODE"}
  </span>
  </div>
  </div>
  </td>
  <td className="px-8 py-6">
  <div className="flex flex-col gap-1">
  <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
  <Mail size={14} className="text-indigo-400" />{""}
  {u.email}
  </span>
  <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
  <Calendar size={12} /> Joined{""}
  {u.createdAt
  ? new Date(u.createdAt).toLocaleDateString()
  : "N/A"}
  </span>
  </div>
  </td>
  <td className="px-8 py-6">
  <div className="flex flex-col gap-1">
  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
  <Building size={14} className="text-slate-400" />{""}
  {u.college || "N/A"}
  </span>
  <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
  <Map size={12} /> {u.district || "Global"}
  </span>
  </div>
  </td>
  <td className="px-8 py-6">
  <div className="flex flex-col items-start gap-2">
  {getRoleBadge(u)}
  {u.interestedSkills?.length > 0 && (
  <div className="flex gap-1 flex-wrap mt-1">
  {u.interestedSkills.slice(0, 2).map((s, idx) => (
  <span
  key={idx}
  className="text-[8px] bg-slate-900 text-white font-black px-1.5 py-0.5 rounded-xs uppercase"
  >
  {s}
  </span>
  ))}
  {u.interestedSkills.length > 2 && (
  <span className="text-[8px] text-slate-400">
  +{u.interestedSkills.length - 2}
  </span>
  )}
  </div>
  )}
  </div>
  </td>
  <td className="px-8 py-6 text-right">
  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
  <button
  onClick={() => setSelectedUser(u)}
  className="p-3 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl border border-slate-100 transition-all shadow-sm"
  title="View Profile"
  >
  <Info size={18} />
  </button>
  <button
  onClick={() => handleDeleteUser(u.id || u._id)}
  className="p-3 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl border border-slate-100 transition-all shadow-sm"
  title="Delete User"
  >
  <Trash2 size={18} />
  </button>
  </div>
  </td>
  </tr>
  ))
  )}
  </tbody>
  </table>
  </div>

  {/* Lighter Footer Stats */}
  <div className="bg-slate-50/80 backdrop-blur-sm p-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] border-t border-slate-100">
  <div className="flex items-center gap-4">
  <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
  <Users size={16} className="text-indigo-600" />
  </div>
  <div>
  <span className="text-slate-400 block mb-0.5">Total Members</span>
  <span className="text-lg text-slate-800 leading-none tracking-tighter font-black">
  {filteredUsers.length}
  </span>
  </div>
  </div>

  <div className="flex gap-8 bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
  <span className="flex items-center gap-2 group">
  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
  <span className="text-slate-600">
  Students{""}
  <b className="text-slate-900 ml-1">{getCount("student")}</b>
  </span>
  </span>
  <span className="flex items-center gap-2">
  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
  <span className="text-slate-600">
  Clubs <b className="text-slate-900 ml-1">{getCount("club")}</b>
  </span>
  </span>
  <span className="flex items-center gap-2">
  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
  <span className="text-slate-600">
  Admins{""}
  <b className="text-slate-900 ml-1">{getCount("admin")}</b>
  </span>
  </span>
  </div>
  </div>
  </div>

  {/* User Details Modal */}
  {selectedUser && (
  <div
  className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6"
  onClick={() => setSelectedUser(null)}
  >
  <div
  className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
  onClick={(e) => e.stopPropagation()}
  >
  <div className="h-48 bg-linear-to-br from-indigo-600 to-purple-800 p-10 flex items-end relative">
  <button
  onClick={() => setSelectedUser(null)}
  className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md"
  >
  <X size={24} />
  </button>
  <div className="w-32 h-32 rounded-[2.5rem] bg-white absolute -bottom-16 left-12 p-1.5 shadow-xl">
  <div className="w-full h-full rounded-[2rem] bg-indigo-100 flex items-center justify-center font-black text-4xl text-indigo-600 overflow-hidden">
  {selectedUser.profilePicture ? (
<img
      src={getImageUrl(selectedUser.profilePicture)}
      alt={`${selectedUser.name || "User"} profile picture`}
      className="w-full h-full object-cover"
      />
  ) : (
  selectedUser.name?.charAt(0).toUpperCase()
  )}
  </div>
  </div>
  </div>
  <div className="pt-24 px-12 pb-12">
  <div className="flex justify-between items-start mb-10">
  <div>
  <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-4">
  {selectedUser.name} {getRoleBadge(selectedUser)}
  </h2>
  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
  {selectedUser.email}
  </p>
  </div>
  </div>

  <div className="space-y-8">
  <div>
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4 flex items-center gap-2">
  <Fingerprint size={12} /> User Biography
  </h4>
  <p className="text-slate-600 font-medium italic bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 leading-relaxed">
  {selectedUser.bio || "No biography provided."}
  </p>
  </div>

  <div className="grid grid-cols-2 gap-8">
  <div>
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-3">
  Skill Protocol
  </h4>
  <div className="flex flex-wrap gap-1.5">
  {selectedUser.interestedSkills?.map((s, i) => (
  <span
  key={i}
  className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider"
  >
  {s}
  </span>
  )) || (
  <span className="text-xs text-slate-400 font-medium">
  None Listed.
  </span>
  )}
  </div>
  </div>
  <div>
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-3">
  Institute Node
  </h4>
  <p className="text-sm font-black text-slate-800">
  {selectedUser.college || "Independent"}
  </p>
  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
  {selectedUser.district || "Regional Hub"}
  </p>
  </div>
  </div>
  </div>

  <button
  onClick={() => setSelectedUser(null)}
  className="mt-12 w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
  >
  Close Detail View <ChevronRight size={14} />
  </button>
  </div>
  </div>
  </div>
  )}

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

export default AdminAllUsers;
