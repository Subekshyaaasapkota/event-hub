import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit3,
  ShieldCheck,
  Activity,
  Globe,
  Fingerprint,
  Zap,
  Camera,
  Save,
  X,
  Code,
  Building,
  Map,
  Award,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getImageUrl } from "../../utils/imageUrl";

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [editData, setEditData] = useState({
  name: "",
  address: "",
  district: "",
  college: "",
  bio: "",
  interestedSkills: [],
  });

  const [newSkill, setNewSkill] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Re-seed the form whenever the loaded user changes. Adjusting state during
  // render (rather than in an effect) avoids an extra cascading render.
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
  setPrevUser(user);
  if (user) {
  setEditData({
  name: user.name || "",
  address: user.address || "",
  district: user.district || "",
  college: user.college || "",
  bio: user.bio || "",
  interestedSkills: user.interestedSkills || [],
  });
  if (user.profilePicture) {
  setPreviewImage(getImageUrl(user.profilePicture));
  }
  }
  }

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
  setSelectedFile(file);
  const reader = new FileReader();
  reader.onloadend = () => setPreviewImage(reader.result);
  reader.readAsDataURL(file);
  }
  };

  const addSkill = () => {
  if (
  newSkill.trim() &&
  !editData.interestedSkills.includes(newSkill.trim())
  ) {
  setEditData((prev) => ({
  ...prev,
  interestedSkills: [...prev.interestedSkills, newSkill.trim()],
  }));
  setNewSkill("");
  }
  };

  const removeSkill = (skillToRemove) => {
  setEditData((prev) => ({
  ...prev,
  interestedSkills: prev.interestedSkills.filter(
  (s) => s !== skillToRemove,
  ),
  }));
  };

  const handleSave = async () => {
  const formData = new FormData();
  Object.keys(editData).forEach((key) => {
  if (key === "interestedSkills") {
  formData.append(key, JSON.stringify(editData[key]));
  } else {
  formData.append(key, editData[key]);
  }
  });

  if (selectedFile) formData.append("profilePicture", selectedFile);

  const res = await updateProfile(formData);
  if (res.success) {
  setIsEditing(false);
  setSelectedFile(null);
  toast.success("Profile synchronized!");
  } else {
  toast.error(res.message);
  }
  };

  return (
  <div className="grid lg:grid-cols-12 gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
  {/* LEFT COLUMN: Profile Card */}
  <div className="lg:col-span-4">
  <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-slate-100 sticky top-8">
  <div
  onClick={() => isEditing && fileInputRef.current.click()}
  className={`relative h-80 group/img overflow-hidden transition-transform duration-700 ${isEditing ? "cursor-pointer" : ""}`}
  >
  <div className="absolute inset-0 z-10 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-500" />
  {previewImage ? (
  <img
  src={previewImage}
  alt="Profile"
  className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
  />
  ) : (
  <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-9xl transition-transform duration-700 group-hover/img:scale-110">
  {user?.name?.charAt(0).toUpperCase()}
  </div>
  )}

  {isEditing && (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
  <Camera size={40} className="text-white" />
  </div>
  )}
  <input
  type="file"
  ref={fileInputRef}
  hidden
  onChange={handleFileChange}
  accept="image/*"
  />
  </div>

  <div className="p-10 space-y-8">
  <div className="text-center">
  {isEditing ? (
  <input
  type="text"
  name="name"
  value={editData.name}
  onChange={handleInputChange}
  className="w-full text-center text-2xl font-black text-slate-800 tracking-tighter uppercase italic bg-slate-50 border-b-2 border-indigo-600 py-1 outline-none"
  placeholder="Identity Name"
  />
  ) : (
  <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
  {user?.name}
  </h2>
  )}
  <p className="text-[11px] font-bold text-slate-400 mt-1">
  {user?.email}
  </p>
  </div>

  <div className="h-[1px] w-full bg-slate-50" />

  {/* Social Metadata placeholders */}
  <div className="flex justify-center gap-4">
  {[Globe, Mail, ShieldCheck].map((Icon, idx) => (
  <div
  key={idx}
  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer border border-slate-100"
  >
  <Icon size={18} />
  </div>
  ))}
  </div>

  <div className="pt-4 space-y-3">
  {!isEditing ? (
  <button
  onClick={() => setIsEditing(true)}
  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
  >
  <Edit3 size={14} /> Update Node Meta
  </button>
  ) : (
  <>
  <button
  onClick={handleSave}
  disabled={loading}
  className="w-full py-5 bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-200 transition-all active:scale-95 disabled:opacity-80 flex items-center justify-center gap-3 overflow-hidden relative"
  >
  {loading ? (
  <>
  <Activity
  size={16}
  className="animate-spin text-white/80"
  />
  <span className="animate-pulse">
  Syncing Node Meta...
  </span>
  <div className="absolute inset-0 bg-white/10 animate-[pulse_1s_infinite]" />
  </>
  ) : (
  "Save & Sync Profile"
  )}
  </button>
  <button
  onClick={() => setIsEditing(false)}
  className="w-full py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
  >
  Abort Changes
  </button>
  </>
  )}
  </div>
  </div>
  </div>
  </div>

  {/* RIGHT COLUMN: Supplementary Dash */}
  <div className="lg:col-span-8 space-y-8">
  {/* About Section */}
  <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 p-10 space-y-6">
  <div className="flex items-center gap-3 text-indigo-500">
  <Fingerprint size={20} />
  <h3 className="text-xl font-black text-slate-800 tracking-tight italic">
  Your Biography
  </h3>
  </div>
  {isEditing ? (
  <textarea
  name="bio"
  value={editData.bio}
  onChange={handleInputChange}
  rows="4"
  className="w-full bg-slate-50 border-b-2 border-indigo-600 p-4 text-sm font-bold text-slate-700 outline-none transition-all resize-none italic rounded-xl"
  placeholder="Describe your node mission..."
  />
  ) : (
  <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
  {user?.bio || "No biography protocol initialized yet."}
  </p>
  )}
  </div>

  {/* Combined Identity Vectors Card */}
  <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
  <div className="p-8 px-10 border-b border-slate-50 flex items-center justify-between">
  <h3 className="text-xl font-black text-slate-800 tracking-tight italic">
  Additional Identity
  </h3>
  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
  <Globe size={14} />
  </div>
  </div>

  <div className="p-10 space-y-12">
  {/* Hub & Zone Row */}
  <div className="grid md:grid-cols-2 gap-10">
  <div className="group">
  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block px-1">
  College
  </label>
  {isEditing ? (
  <input
  type="text"
  name="college"
  value={editData.college}
  onChange={handleInputChange}
  className="w-full bg-slate-50 border-b-2 border-indigo-600 py-3 px-4 text-sm font-bold text-slate-700 outline-none rounded-xl"
  />
  ) : (
  <div className="flex items-center gap-3 px-1">
  <Building size={16} className="text-indigo-400" />
  <p className="text-base font-black text-slate-700 uppercase tracking-tight italic">
  {user?.college || "N/A"}
  </p>
  </div>
  )}
  </div>
  <div className="group">
  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block px-1">
  District
  </label>
  {isEditing ? (
  <input
  type="text"
  name="district"
  value={editData.district}
  onChange={handleInputChange}
  className="w-full bg-slate-50 border-b-2 border-indigo-600 py-3 px-4 text-sm font-bold text-slate-700 outline-none rounded-xl"
  />
  ) : (
  <div className="flex items-center gap-3 px-1">
  <Map size={16} className="text-indigo-400" />
  <p className="text-base font-black text-slate-700 uppercase tracking-tight italic">
  {user?.district || "Nepal Core"}
  </p>
  </div>
  )}
  </div>
  </div>

  {/* Tech Vectors row */}
  <div className="space-y-6 pt-8 border-t border-slate-50">
  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block px-1">
  Interested Skills
  </label>
  <div className="flex flex-wrap gap-2.5">
  {editData.interestedSkills.map((skill, index) => (
  <div
  key={index}
  className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-indigo-100 group"
  >
  {skill}
  {isEditing && (
  <X
  size={14}
  className="cursor-pointer text-indigo-300 hover:text-rose-500 transition-colors"
  onClick={() => removeSkill(skill)}
  />
  )}
  </div>
  ))}
  </div>

  {isEditing && (
  <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
  <input
  type="text"
  value={newSkill}
  onChange={(e) => setNewSkill(e.target.value)}
  onKeyPress={(e) => e.key === "Enter" && addSkill()}
  placeholder="Injected skill name..."
  className="flex-1 bg-transparent px-4 text-xs font-black text-slate-700 outline-none"
  />
  <button
  onClick={addSkill}
  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
  >
  Inject
  </button>
  </div>
  )}
  </div>
  </div>
  </div>
  </div>
  </div>
  );
};

export default Profile;
