import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Calendar,
  Mail,
  Phone,
  Building2,
  ChevronLeft,
  Search,
  Download,
  UserCheck,
  ExternalLink,
  RefreshCw,
  Database,
  ArrowRight,
  Filter,
  Info,
  MapPin,
  Building,
  Fingerprint,
  Code,
  X,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import ClubSidebar from "./ClubSidebar";
import useOrganizer from "../../hooks/useOrganizer";
import { toast } from "react-hot-toast";
import Papa from "papaparse";
import { getImageUrl } from "../../utils/imageUrl";

// Payment Symbol Assets
import khaltiSymbol from "../../assets/payment/khalti-symbol.jpg";
import esewaSymbol from "../../assets/payment/esewa-symbol logo.webp";

const ManageEventRegisterByUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventIdFromUrl = queryParams.get("eventId");

  // State
  const [searchTerm, setSearchTerm] = useState("");
  // The select box navigates with ?eventId=..., so the selection is derived
  // from the URL rather than mirrored into state.
  const selectedEventId = eventIdFromUrl || "all";
  const [googleData, setGoogleData] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Modal for Google Sheet Link
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [sheetUrlInput, setSheetUrlInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // High-fidelity detail view


  const {
  fetchClubRegistrations,
  fetchOrganizerEvents,
  updateGoogleSheetLink,
  registrations,
  orgEvents,
  loading,
  } = useOrganizer();

  useEffect(() => {
  fetchClubRegistrations();
  fetchOrganizerEvents();
  }, [fetchClubRegistrations, fetchOrganizerEvents]);

  // Find currently selected event data
  const activeEvent = useMemo(() => {
  if (selectedEventId === "all") return null;
  return orgEvents.find(e => e._id === selectedEventId);
  }, [selectedEventId, orgEvents]);

  // Registration mode is fully derived from the selected event's type.
  const registrationMode = activeEvent?.registrationType === "google_form" ? "google_form" : "portal";

  // Fetch Google Sheet Data if active event has a link
  useEffect(() => {
  const fetchGoogleData = async () => {
  if (registrationMode === "google_form" && activeEvent?.googleSheetResponseLink) {
  setIsSyncing(true);
  try {
  Papa.parse(activeEvent.googleSheetResponseLink, {
  download: true,
  header: true,
  complete: (results) => {
  setGoogleData(results.data);
  setIsSyncing(false);
  },
  error: () => {
  toast.error("Failed to parse Google Sheet. Ensure it is 'Published to Web' as CSV.");
  setIsSyncing(false);
  }
  });
  } catch (err) {
  setIsSyncing(false);
  }
  } else {
  setGoogleData([]);
  }
  };

  fetchGoogleData();
  }, [registrationMode, activeEvent]);

  const handleSaveLink = async () => {
  if (!sheetUrlInput.trim()) return toast.error("Please enter a valid URL");
  
  // Basic validation for Google Sheets link
  if (!sheetUrlInput.includes("docs.google.com/spreadsheets")) {
  return toast.error("Please provide a valid Google Sheets link");
  }

  // Attempt to convert to CSV export if it's a regular link
  let finalUrl = sheetUrlInput;
  if (sheetUrlInput.includes("/edit")) {
  finalUrl = sheetUrlInput.replace(/\/edit.*$/, "/export?format=csv");
  }

  const res = await updateGoogleSheetLink(activeEvent._id, finalUrl);
  if (res.success) {
  toast.success("Google Sheet integration saved!");
  setLinkModalOpen(false);
  fetchOrganizerEvents(); // Refresh event data
  } else {
  toast.error(res.message);
  }
  };

  // Filter Logic
  const filteredPortalData = useMemo(() => {
  return registrations.filter((reg) => {
  if (!reg.event || !reg.event._id) return false;
  const matchesEvent = selectedEventId === "all" || reg.event._id === selectedEventId;
  const matchesSearch = searchTerm === "" || 
  reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  reg.user.email.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesEvent && matchesSearch;
  });
  }, [registrations, selectedEventId, searchTerm]);

  const filteredGoogleData = useMemo(() => {
  if (!googleData.length) return [];
  return googleData.filter(row => {
  const values = Object.values(row).join("").toLowerCase();
  return values.includes(searchTerm.toLowerCase());
  });
  }, [googleData, searchTerm]);

  const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
  month: "short", day: "numeric", year: "numeric"
  });
  };

  if (loading && !registrations.length) {
  return (
  <div className="min-h-screen flex bg-[#F8F9FD]">
  <ClubSidebar />
  <main className="flex-1 flex items-center justify-center">
  <div className="flex flex-col items-center gap-4">
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  <p className="font-bold text-slate-400 animate-pulse text-xs uppercase tracking-widest">Loading Records...</p>
  </div>
  </main>
  </div>
  );
  }

  return (
  <div className="min-h-screen flex bg-[#F8F9FD]">
  <ClubSidebar />

  <main className="flex-1 p-6 lg:p-10 overflow-auto">
  {/* Breadcrumb & Top Actions */}
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
  <div className="flex items-center gap-4">
  <button 
  onClick={() => navigate("/club/my-events")}
  className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
  >
  <ChevronLeft size={20} className="text-slate-600" />
  </button>
  <div>
  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
  Participants <span className="text-indigo-600">Explorer</span>
  </h1>
  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
  {activeEvent ? `Event: ${activeEvent.title}` : "Managing all registrations"}
  </p>
  </div>
  </div>

  <div className="flex items-center gap-3">
  <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm">
  <Download size={16} /> Export
  </button>
  {registrationMode === "google_form" && activeEvent?.googleSheetResponseLink && (
  <button 
  onClick={() => window.location.reload()}
  className={`flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg ${isSyncing ? 'animate-pulse' : ''}`}
  >
  <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> Sync Live
  </button>
  )}
  </div>
  </div>

  {/* Stats Section */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {[
  { label: "Internal Users", val: filteredPortalData.length, icon: <Users size={20} />, color: "bg-indigo-500" },
  { label: "External (Google)", val: googleData.length, icon: <Database size={20} />, color: "bg-blue-500" },
  { label: "Today's Signups", val: "0", icon: <UserCheck size={20} />, color: "bg-emerald-500" },
  { label: "Remaining Spots", val: activeEvent ? Math.max(0, activeEvent.participantCount - (filteredPortalData.length + googleData.length)) : "N/A", icon: <Calendar size={20} />, color: "bg-amber-500" }
  ].map((stat, i) => (
  <div key={i} className="bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-6 shadow-sm flex items-center gap-5">
  <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
  {stat.icon}
  </div>
  <div>
  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
  <p className="text-2xl font-black text-slate-900">{stat.val}</p>
  </div>
  </div>
  ))}
  </div>

  {/* Controls */}
  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 mb-8 shadow-sm flex flex-col lg:flex-row items-center gap-4">
  <div className="flex-1 relative w-full">
  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
  <input 
  type="text" 
  placeholder="Search by name, email, or keywords..."
  className="w-full bg-slate-50 border-none rounded-[1.8rem] py-4 pl-16 pr-6 focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  />
  </div>

  <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
  {/* Automatic View Status Badge */}
  <div className="rounded-2xl bg-white border border-slate-100 flex items-center gap-3 px-6 py-3 shadow-sm">
  <div className={`w-2 h-2 rounded-full ${registrationMode === "portal" ? "bg-indigo-500 animate-pulse" : "bg-blue-500 animate-bounce"}`}></div>
  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
  {registrationMode === "portal" ? "Portal Database" : "Live Google Integration"}
  </p>
  </div>

  <div className="h-8 w-[1px] bg-slate-200 hidden lg:block mx-2"></div>

  <select 
  className="bg-slate-100 border-none rounded-2xl px-6 py-3 text-xs font-black text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-100"
  value={selectedEventId}
  onChange={(e) => navigate(`/club/registrations?eventId=${e.target.value}`)}
  >
  <option value="all">All Events</option>
  {orgEvents.map(e => (
  <option key={e._id} value={e._id}>{e.title}</option>
  ))}
  </select>
  </div>
  </div>

  {/* Content Area */}
  {registrationMode === "google_form" && !activeEvent?.googleSheetResponseLink && selectedEventId !== "all" ? (
  /* Empty State - Setup Link */
  <div className="bg-white border border-dashed border-slate-200 rounded-[3.5rem] p-20 text-center">
  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-100">
  <Database size={40} className="text-blue-500" />
  </div>
  <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Connect Google Sheet</h2>
  <p className="text-slate-500 font-bold max-w-md mx-auto mb-10 leading-relaxed uppercase text-[10px] tracking-widest">
  You haven't linked a Google Sheet for this event. Link your response sheet to see external registrations live!
  </p>
  <button 
  onClick={() => setLinkModalOpen(true)}
  className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto"
  >
  <PlusCircle size={18} /> Link Sheet Now
  </button>
  </div>
  ) : (
  /* Table Area */
  <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
  <table className="w-full text-left border-collapse">
  <thead>
  <tr className="bg-slate-50/50 border-b border-slate-100">
  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Participant</th>
  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Contact</th>
  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{registrationMode === "portal" ? "Event" : "Work / College"}</th>
  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Verified</th>
  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Actions</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-slate-50">
  {registrationMode === "portal" ? (
  // Portal Rows
  filteredPortalData.map((reg) => (
  <tr key={reg._id} className="hover:bg-slate-50/80 transition-all group">
  <td className="px-8 py-6">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all overflow-hidden">
  {reg.user.profilePicture ? (
  <img src={getImageUrl(reg.user.profilePicture)} alt="" className="w-full h-full object-cover" />
  ) : (
  reg.user.name.charAt(0)
  )}
  </div>
  <div>
  <p className="font-black text-slate-900 text-sm tracking-tight">{reg.user.name}</p>
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UID: {reg._id.slice(-6)}</p>
  </div>
  </div>
  </td>
  <td className="px-8 py-6">
  <div className="space-y-1">
  <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
  <Mail size={12} className="text-indigo-400" /> {reg.user.email}
  </div>
  <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
  <Phone size={12} className="text-slate-300" /> {reg.phone || "No Contact"}
  </div>
  </div>
  </td>
  <td className="px-8 py-6">
  <p className="font-bold text-slate-800 text-xs w-48 truncate">{reg.event?.title}</p>
  <p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(reg.createdAt)}</p>
  </td>
  <td className="px-8 py-6">
  <div className="flex items-center justify-center">
  {reg.event?.isPaid && reg.paymentService && reg.paymentService !== "None" ? (
  <div 
  className="flex items-center justify-center p-2 bg-white border border-slate-50 rounded-lg shadow-sm w-12 h-10" 
  title={`Authenticated via ${reg.paymentService}`}
  >
  {reg.paymentService === "Khalti" ? (
  <img src={khaltiSymbol} alt="Khalti" className="w-full h-auto object-contain" />
  ) : reg.paymentService === "eSewa" ? (
  <img src={esewaSymbol} alt="eSewa" className="w-full h-auto object-contain" />
  ) : (
  <span className="text-[10px] font-black text-slate-400">{reg.paymentService}</span>
  )}
  </div>
  ) : (
  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100" title="System Verified (Free)">
  <UserCheck size={14} />
  </div>
  )}
  </div>
  </td>
  <td className="px-8 py-6 text-right">
  <button 
  onClick={() => setSelectedUser(reg.user)}
  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm group-hover:border-slate-300"
  title="View Node Metadata"
  >
  <Info size={16} />
  </button>
  </td>
  </tr>
  ))
  ) : (
  // Google Rows
  filteredGoogleData.map((row, i) => (
  <tr key={i} className="hover:bg-blue-50/50 transition-all group">
  <td className="px-8 py-6">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black border border-blue-100">
  {Object.values(row)[0]?.toString().charAt(0) || "G"}
  </div>
  <div>
  <p className="font-black text-slate-900 text-sm tracking-tight">{Object.values(row).find(v => v?.toString().includes("@")) ? Object.values(row)[0] : "Google User"}</p>
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EXTERNAL ENTRY</p>
  </div>
  </div>
  </td>
  <td className="px-8 py-6">
  <div className="space-y-1">
  <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
  <Mail size={12} className="text-blue-400" /> {Object.values(row).find(v => v?.toString().includes("@")) || "N/A"}
  </div>
  </div>
  </td>
  <td className="px-8 py-6">
  <p className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{Object.values(row).slice(2).join(", ").slice(0, 40)}...</p>
  </td>
  <td className="px-8 py-6 text-center">
  <div className="flex justify-center">
  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
  </div>
  </td>
  <td className="px-8 py-6 text-right">
  <button className="text-[10px] font-black uppercase text-blue-500 tracking-widest hover:underline">
  View Meta
  </button>
  </td>
  </tr>
  ))
  )}

  {((registrationMode === "portal" && !filteredPortalData.length) || (registrationMode === "google_form" && !filteredGoogleData.length)) && (
  <tr>
  <td colSpan="5" className="px-8 py-20 text-center">
  <div className="flex flex-col items-center gap-3">
  <Filter size={32} className="text-slate-200" />
  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching records found for this view</p>
  </div>
  </td>
  </tr>
  )}
  </tbody>
  </table>
  </div>
  </div>
  )}
  </main>

  {/* MODAL - LINK GOOGLE SHEET */}
  {linkModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
  <div className="w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-3xl animate-in zoom-in duration-300">
  <div className="flex items-start justify-between mb-8">
  <div>
  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
  <ExternalLink size={24} />
  </div>
  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Setup Integration</h2>
  </div>
  <button onClick={() => setLinkModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
  <PlusCircle className="rotate-45" size={24} />
  </button>
  </div>

  <div className="space-y-6">
  <div>
  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Google Sheet URL</label>
  <input 
  type="url" 
  placeholder="https://docs.google.com/spreadsheets/d/..."
  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-6 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
  value={sheetUrlInput}
  onChange={(e) => setSheetUrlInput(e.target.value)}
  />
  </div>

  <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
  <h4 className="flex items-center gap-2 text-indigo-900 font-black uppercase text-[10px] tracking-widest mb-2">
  <AlertCircle size={14} /> Quick Pro-Tip
  </h4>
  <p className="text-[11px] font-bold text-indigo-700/70 leading-relaxed">
  Paste your standard Google Sheets link. We'll automatically attempt to extract the live CSV feed. Ensure your sheet is set to <span className="underline font-black">"Anyone with the link can view."</span>
  </p>
  </div>
  </div>

  <button 
  onClick={handleSaveLink}
  className="w-full bg-slate-900 text-white rounded-[1.8rem] py-5 mt-10 font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3"
  >
  Save Integration <ArrowRight size={14} />
  </button>
  </div>
  </div>
  )}
  {/* PARTICIPANT DETAIL MODAL (High Fidelity) */}
  {selectedUser && (
  <div 
  className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6"
  onClick={() => setSelectedUser(null)}
  >
  <div 
  className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-3xl animate-in fade-in zoom-in duration-300 border border-slate-100"
  onClick={(e) => e.stopPropagation()}
  >
  <div className="h-48 bg-linear-to-br from-indigo-600 to-indigo-800 p-10 flex items-end relative">
  <button 
  onClick={() => setSelectedUser(null)}
  className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/10"
  >
  <X size={24} />
  </button>
  <div className="w-32 h-32 rounded-[2.5rem] bg-white absolute -bottom-16 left-12 p-1.5 shadow-2xl">
  <div className="w-full h-full rounded-[2rem] bg-indigo-50 flex items-center justify-center font-black text-4xl text-indigo-600 overflow-hidden relative">
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
  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{selectedUser.name}</h2>
  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">{selectedUser.email}</p>
  </div>
  <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">Verified Node</span>
  </div>

  <div className="space-y-8">
  <div>
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4 flex items-center gap-2">
  <Fingerprint size={12} /> Registry Biography
  </h4>
  <p className="text-slate-600 font-medium italic bg-slate-50/50 p-6 rounded-3xl border border-dashed border-slate-200 leading-relaxed text-sm">
  {selectedUser.bio || "This user hasn't initialized their identity protocol statement yet."}
  </p>
  </div>

  <div className="grid grid-cols-2 gap-8">
  <div>
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4 flex items-center gap-2">
  <Code size={12} /> Tech Vectors
  </h4>
  <div className="flex flex-wrap gap-2">
  {selectedUser.interestedSkills?.length > 0 ? selectedUser.interestedSkills.map((s, i) => (
  <span key={i} className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
  {s}
  </span>
  )) : (
  <span className="text-[9px] font-bold text-slate-400 italic">No Vectors Defined</span>
  )}
  </div>
  </div>
  <div>
  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4 flex items-center gap-2">
  <Building size={12} /> Academic Hub
  </h4>
  <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate mb-0.5">{selectedUser.college || "Independent"}</p>
  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={10} /> {selectedUser.district || "Global Area"}</p>
  </div>
  </div>
  </div>

  <button 
  onClick={() => setSelectedUser(null)}
  className="mt-12 w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all group"
  >
  Close Profile <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
  </button>
  </div>
  </div>
  </div>
  )}
  </div>
  );
};

// Add icons used but not imported
const PlusCircle = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const AlertCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default ManageEventRegisterByUser;
