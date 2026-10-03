// EventCreate.jsx (Updated with Edit Mode Support)
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import MapPicker from "../../components/common/MapPicker";
import { NEPAL_DISTRICTS } from "../../utils/districts";
import {
  Calendar,
  MapPin,
  Tag,
  Image as ImageIcon,
  FileText,
  Zap,
  Clock,
  Users,
  Layers,
  ArrowLeft,
  Settings,
  ShieldCheck,
  Search,
  DollarSign,
  CreditCard,
  Navigation,
  Globe,
  FormInput,
  ExternalLink,
} from "lucide-react";
import ClubSidebar from "./ClubSidebar";
import useEvents from "../../hooks/useEvents";

const CreateEvents = () => {
  const { loading: authLoading } = useAuth();
  const { createEvent, updateEvent, fetchEventById } = useEvents();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("id"); // Get event ID from URL param
  const isEditMode = !!eventId; // Boolean flag for edit mode

  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(isEditMode); // Loading event data

  const [formData, setFormData] = useState({
  title: "",
  description: "",
  poster: null,
  posterPreview: null,
  category: "Workshop",
  district: "Kathmandu",
  eventType: "physical",
  venue: "",
  eventDate: "",
  deadline: "",
  participantCount: 50,
  tags: "",
  isPaid: false,
  price: 0,
  registrationType: "system",
  googleFormUrls: ["", ""], // [form URL, response sheet URL]
  googleMapUrl: "",
  latitude: "",
  longitude: "",
  });

  // Load event data if editing
  useEffect(() => {
  if (isEditMode && eventId) {
  const loadEvent = async () => {
  try {
  const result = await fetchEventById(eventId);
  if (result.success && result.data) {
  const event = result.data;
  setFormData({
  title: event.title || "",
  description: event.description || "",
  poster: null, // Keep null since it's binary
  posterPreview: event.poster || null,
  category: event.category || "Workshop",
  district: event.district || "Kathmandu",
  eventType: event.eventType || "physical",
  venue: event.venue || "",
  eventDate: event.eventDate
  ? new Date(event.eventDate)
  .toLocaleString("sv-SE")
  .replace(" ", "T")
  .substring(0, 16)
  : "",
  deadline: event.deadline
  ? new Date(event.deadline)
  .toLocaleString("sv-SE")
  .replace(" ", "T")
  .substring(0, 16)
  : "",
  participantCount: event.participantCount || 50,
  tags: event.tags?.join(",") || "",
  isPaid: event.isPaid || false,
  price: event.price || 0,
  registrationType: event.registrationType || "system",
  googleFormUrls: event.googleFormUrls || ["", ""],
  googleMapUrl: event.googleMapUrl || "",
  latitude: event.location?.coordinates[1] || "",
  longitude: event.location?.coordinates[0] || "",
  });

  // Set location if available
  if (event.location?.coordinates) {
  setSelectedLocation({
  lat: event.location.coordinates[1],
  lng: event.location.coordinates[0],
  address: event.venue || "",
  });
  }
  }
  } catch (error) {
  console.error("Error loading event:", error);
  toast.error("Failed to load event. Redirecting...");
  navigate("/club/my-events");
  } finally {
  setLoadingEvent(false);
  }
  };
  loadEvent();
  }
  }, [isEditMode, eventId, fetchEventById, navigate]);

  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setFormData((prev) => ({
  ...prev,
  [name]: type === "checkbox" ? checked : value,
  }));
  };

  const handleLocationSelect = (location) => {
  setSelectedLocation(location);

  // Format coordinates to 6 decimal places
  const latFormatted = location.lat.toFixed(6);
  const lngFormatted = location.lng.toFixed(6);

  if (location.address) {
  const addressParts = location.address.split(",");
  const suggestedVenue = addressParts[0] ? addressParts[0].trim() : "";

  setFormData((prev) => ({
  ...prev,
  venue: suggestedVenue || prev.venue,
  googleMapUrl: `https://www.google.com/maps?q=${latFormatted},${lngFormatted}`,
  latitude: latFormatted,
  longitude: lngFormatted,
  }));
  } else {
  setFormData((prev) => ({
  ...prev,
  googleMapUrl: `https://www.google.com/maps?q=${latFormatted},${lngFormatted}`,
  latitude: latFormatted,
  longitude: lngFormatted,
  }));
  }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
  const file = e.target.files[0];

  if (file) {
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
  toast.error("File size should be less than 5MB");
  return;
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
  toast.error("Please upload an image file");
  return;
  }

  // Create preview URL
  const preview = URL.createObjectURL(file);

  setPosterFile(file);

  setFormData({
  ...formData,
  poster: file,
  posterPreview: preview,
  });
  }
  };

  const validateForm = () => {
  const requiredFields = [
  "title",
  "description",
  "category",
  "district",
  "eventDate",
  "deadline",
  ];

  // Venue is required only for physical events
  if (formData.eventType === "physical") {
  requiredFields.push("venue");
  }

  for (const field of requiredFields) {
  if (!formData[field]) {
  toast.error(
  `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field`,
  );
  return false;
  }
  }

  // For CREATE: require new poster file
  // For EDIT: allow existing posterPreview OR new poster file
  if (!isEditMode && !formData.poster) {
  toast.error("Please upload a poster image");
  return false;
  }
  if (isEditMode && !posterFile && !formData.posterPreview) {
  toast.error("Please add a poster image for this event");
  return false;
  }

  // Location selection required only for physical events
  if (formData.eventType === "physical" && !selectedLocation && !isEditMode) {
  toast.error("Please select a location on the map");
  return false;
  }

  const eventDateTime = new Date(formData.eventDate);
  const deadlineDate = new Date(formData.deadline);
  const now = new Date();

  if (deadlineDate < now) {
  toast.error("Registration deadline cannot be in the past");
  return false;
  }

  if (eventDateTime < deadlineDate) {
  toast.error("Event date cannot be before registration deadline");
  return false;
  }

  if (formData.participantCount < 1) {
  toast.error("Participant capacity must be at least 1");
  return false;
  }

  return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
  return;
  }

  setLoading(true);

  try {
  console.log(
  " [FRONTEND] handleSubmit called, eventType=",
  formData.eventType,
  );
  const formDataToSend = new FormData();

  // Append poster: new file if selected, otherwise keep existing (backend handles)
  if (posterFile) {
  formDataToSend.append("poster", posterFile);
  console.log(" [FRONTEND] Poster file selected:", posterFile.name);
  } else if (isEditMode) {
  console.log(
  " Edit mode without new poster - backend will keep existing",
  );
  }

  // Append all form fields
  formDataToSend.append("title", formData.title.trim());
  formDataToSend.append("description", formData.description.trim());
  formDataToSend.append("category", formData.category);
  formDataToSend.append("district", formData.district);
  formDataToSend.append("eventType", formData.eventType);

  // Only append venue for physical events
  if (formData.eventType === "physical") {
  formDataToSend.append("venue", formData.venue.trim());
  }

  formDataToSend.append("eventDate", formData.eventDate);
  formDataToSend.append("deadline", formData.deadline);
  formDataToSend.append("participantCount", formData.participantCount);
  formDataToSend.append("tags", formData.tags);
  formDataToSend.append("isPaid", formData.isPaid);
  formDataToSend.append("price", formData.price);
  formDataToSend.append("registrationType", formData.registrationType);

  // Only append Google Form URLs if registration type is google_form
  if (
  formData.registrationType === "google_form" &&
  formData.googleFormUrls?.[0]?.trim()
  ) {
  formDataToSend.append(
  "googleFormUrls",
  JSON.stringify(formData.googleFormUrls.filter((url) => url.trim())),
  );
  }

  // Location data - only for physical events
  if (formData.eventType === "physical") {
  if (formData.googleMapUrl) {
  formDataToSend.append("googleMapUrl", formData.googleMapUrl);
  }
  if (formData.latitude) {
  formDataToSend.append("latitude", formData.latitude);
  }
  if (formData.longitude) {
  formDataToSend.append("longitude", formData.longitude);
  }
  }

  console.log(
  `${isEditMode ? " [FRONTEND] Updating" : " [FRONTEND] Creating"} event`,
  );
  console.log(" [FRONTEND] Form data:", {
  eventType: formData.eventType,
  title: formData.title,
  eventDate: formData.eventDate,
  deadline: formData.deadline,
  venue: formData.venue,
  });

  let result;
  if (isEditMode && eventId) {
  // Update existing event
  console.log(" [FRONTEND] Sending UPDATE request to backend...");
  result = await updateEvent({ id: eventId, data: formDataToSend });
  console.log(" [FRONTEND] UPDATE response:", result);
  toast.success("Event updated successfully!");
  } else {
  // Create new event
  console.log(" [FRONTEND] Sending CREATE request to backend...");
  result = await createEvent(formDataToSend);
  console.log(" [FRONTEND] CREATE response:", result);
  toast.success("Event created successfully!");
  }

  navigate("/club/my-events");
  } catch (error) {
  console.error(" [FRONTEND] Error in handleSubmit:");
  console.error("Message:", error.message);
  console.error("Full error:", error);
  console.error("Response data:", error.response?.data);
  console.error("Response status:", error.response?.status);
  toast.error(error.message || "Failed to save event. Please try again.");
  } finally {
  setLoading(false);
  }
  };

  if (authLoading || loadingEvent) {
  return (
  <div className="h-screen flex items-center justify-center font-black text-slate-400">
  {loadingEvent ? "Loading event..." : "LOADING..."}
  </div>
  );
  }

  return (
  <div className="min-h-screen flex bg-[#FDFDFF]">
  <ClubSidebar />

  <main className="flex-1 p-10 overflow-auto">
  <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
  <div>
  <button
  onClick={() => navigate(-1)}
  className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4"
  >
  <ArrowLeft size={14} />
  <span className="text-[10px] font-black uppercase tracking-widest">
  Go Back
  </span>
  </button>
  <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
  {isEditMode ? "Edit" : "Create"}{""}
  <span className="text-indigo-600">
  {isEditMode ? "Event" : "New Event"}
  </span>
  </h1>
  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 mt-2">
  <Settings size={14} /> Fill in the details to publish your event
  </p>
  </div>
  <div className="bg-indigo-50 border border-indigo-100 rounded-3xl px-6 py-4 flex items-center gap-4">
  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
  <ShieldCheck size={20} />
  </div>
  <div>
  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
  Status
  </p>
  <p className="text-sm font-black text-indigo-900 tracking-tight">
  Secure Form
  </p>
  </div>
  </div>
  </header>

  <form
  onSubmit={handleSubmit}
  className="grid grid-cols-1 lg:grid-cols-3 gap-10"
  >
  {/* Main Form Fields */}
  <div className="lg:col-span-2 space-y-8">
  <section className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <Tag size={12} /> Event Name *
  </label>
  <input
  type="text"
  name="title"
  placeholder="e.g. Annual Coding Workshop"
  className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-lg text-slate-800 placeholder:opacity-30"
  onChange={handleChange}
  value={formData.title}
  required
  />
  </div>

  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <FileText size={12} /> About the Event *
  </label>
  <textarea
  name="description"
  rows={6}
  placeholder="Tell people what your event is about..."
  className="w-full bg-slate-50 border-none rounded-[2.5rem] py-6 px-8 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-800 placeholder:opacity-30"
  onChange={handleChange}
  value={formData.description}
  required
  />
  </div>

  {/* Event Type Toggle */}
  <div className="space-y-4 p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border border-indigo-100">
  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 ml-1">
  <Globe size={12} /> Event Type *
  </label>
  <div className="grid grid-cols-2 gap-4">
  <div
  className={`relative cursor-pointer group`}
  onClick={() =>
  setFormData({ ...formData, eventType: "physical" })
  }
  >
  <input
  type="radio"
  name="eventType"
  value="physical"
  checked={formData.eventType === "physical"}
  onChange={handleChange}
  className="sr-only"
  />
  <div
  className={`p-6 rounded-2xl border-2 transition-all text-center ${
  formData.eventType === "physical"
  ? "border-indigo-600 bg-white shadow-lg"
  : "border-indigo-200 bg-white/50 group-hover:border-indigo-300"
  }`}
  >
  <MapPin
  size={20}
  className={`mx-auto mb-2 ${
  formData.eventType === "physical"
  ? "text-indigo-600"
  : "text-indigo-400"
  }`}
  />
  <p className="text-sm font-black text-indigo-900">
  Physical
  </p>
  <p className="text-[9px] text-slate-500 mt-1">In-venue</p>
  </div>
  </div>

  <div
  className={`relative cursor-pointer group`}
  onClick={() =>
  setFormData({ ...formData, eventType: "online" })
  }
  >
  <input
  type="radio"
  name="eventType"
  value="online"
  checked={formData.eventType === "online"}
  onChange={handleChange}
  className="sr-only"
  />
  <div
  className={`p-6 rounded-2xl border-2 transition-all text-center ${
  formData.eventType === "online"
  ? "border-blue-600 bg-white shadow-lg"
  : "border-indigo-200 bg-white/50 group-hover:border-indigo-300"
  }`}
  >
  <Globe
  size={20}
  className={`mx-auto mb-2 ${
  formData.eventType === "online"
  ? "text-blue-600"
  : "text-indigo-400"
  }`}
  />
  <p className="text-sm font-black text-indigo-900">
  Online
  </p>
  <p className="text-[9px] text-slate-500 mt-1">Virtual</p>
  </div>
  </div>
  </div>
  </div>

  {/* Registration Type Selection */}
  <div className="space-y-4 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100">
  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 ml-1">
  <FormInput size={12} /> Registration Method *
  </label>
  <div className="grid grid-cols-2 gap-4">
  <div
  className={`relative cursor-pointer group`}
  onClick={() =>
  setFormData({ ...formData, registrationType: "system" })
  }
  >
  <input
  type="radio"
  name="registrationType"
  value="system"
  checked={formData.registrationType === "system"}
  onChange={handleChange}
  className="sr-only"
  />
  <div
  className={`p-6 rounded-2xl border-2 transition-all text-center ${
  formData.registrationType === "system"
  ? "border-emerald-600 bg-white shadow-lg"
  : "border-emerald-200 bg-white/50 group-hover:border-emerald-300"
  }`}
  >
  <FormInput
  size={20}
  className={`mx-auto mb-2 ${
  formData.registrationType === "system"
  ? "text-emerald-600"
  : "text-emerald-400"
  }`}
  />
  <p className="text-sm font-black text-emerald-900">
  System Registration
  </p>
  <p className="text-[9px] text-slate-500 mt-1">
  Built-in form
  </p>
  </div>
  </div>

  <div
  className={`relative cursor-pointer group`}
  onClick={() =>
  setFormData({
  ...formData,
  registrationType: "google_form",
  })
  }
  >
  <input
  type="radio"
  name="registrationType"
  value="google_form"
  checked={formData.registrationType === "google_form"}
  onChange={handleChange}
  className="sr-only"
  />
  <div
  className={`p-6 rounded-2xl border-2 transition-all text-center ${
  formData.registrationType === "google_form"
  ? "border-blue-600 bg-white shadow-lg"
  : "border-emerald-200 bg-white/50 group-hover:border-emerald-300"
  }`}
  >
  <ExternalLink
  size={20}
  className={`mx-auto mb-2 ${
  formData.registrationType === "google_form"
  ? "text-blue-600"
  : "text-emerald-400"
  }`}
  />
  <p className="text-sm font-black text-emerald-900">
  Google Form
  </p>
  <p className="text-[9px] text-slate-500 mt-1">
  External link
  </p>
  </div>
  </div>
  </div>
  </div>

  {/* Google Form URLs - only show if google_form is selected */}
  {formData.registrationType === "google_form" && (
  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <ExternalLink size={12} /> Google Form URL
  </label>
  <input
  type="url"
  placeholder="Google Form URL (e.g., https://forms.gle/...)"
  className="w-full bg-slate-50 border-none rounded-3xl py-4 px-6 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-800 placeholder:opacity-30"
  value={formData.googleFormUrls[0] || ""}
  onChange={(e) => {
  const newUrls = [...formData.googleFormUrls];
  newUrls[0] = e.target.value;
  setFormData({ ...formData, googleFormUrls: newUrls });
  }}
  required
  />
  <p className="text-xs text-slate-500 font-medium">
  Only enter the Google Form link here. The response sheet can
  be added later from Registrations.
  </p>
  </div>
  )}

  {/* Always show District */}
  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <MapPin size={12} /> District *
  </label>
  <select
  name="district"
  className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-800"
  onChange={handleChange}
  value={formData.district}
  required
  >
  <option value="">Select a district</option>
  {Object.entries(NEPAL_DISTRICTS).map(
  ([province, districts]) => (
  <optgroup key={province} label={province}>
  {districts.map((d) => (
  <option key={d} value={d}>
  {d}
  </option>
  ))}
  </optgroup>
  ),
  )}
  </select>
  </div>

  {formData.eventType === "physical" && (
  <>
  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <Search size={12} /> Venue Name *
  </label>
  <input
  type="text"
  name="venue"
  placeholder="e.g. City Hall, Room 204"
  className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-800"
  onChange={handleChange}
  value={formData.venue}
  required={formData.eventType === "physical"}
  />
  </div>

  {/* Location Picker */}
  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <Navigation size={12} /> Location on Map *
  </label>
  <MapPicker
  onLocationSelect={handleLocationSelect}
  initialLocation={selectedLocation}
  searchQuery={formData.district}
  />
  {selectedLocation && (
  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-2xl">
  <p className="text-xs text-green-700 flex items-center gap-1">
  <MapPin size={12} />
  Location selected:{""}
  {selectedLocation.address ||
  `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
  </p>
  </div>
  )}
  </div>
  </>
  )}

  {formData.eventType === "online" && (
  <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 flex items-center gap-4">
  <Globe size={24} className="text-blue-600 flex-shrink-0" />
  <div>
  <p className="text-sm font-black text-blue-900">
  Online Event Confirmed
  </p>
  <p className="text-xs text-slate-600 mt-1">
  Venue and location are not required for this event.
  Participants will join online.
  </p>
  </div>
  </div>
  )}
  </section>

  <section className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
  <div className="grid md:grid-cols-2 gap-8">
  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <Calendar size={12} /> Event Date & Time *
  </label>
  <input
  type="datetime-local"
  name="eventDate"
  className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold"
  onChange={handleChange}
  value={formData.eventDate}
  required
  />
  </div>
  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <Clock size={12} /> Registration Deadline *
  </label>
  <input
  type="datetime-local"
  name="deadline"
  className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold"
  onChange={handleChange}
  value={formData.deadline}
  required
  />
  </div>
  </div>

  <div className="grid md:grid-cols-2 gap-8">
  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <Users size={12} /> Max Participants *
  </label>
  <input
  type="number"
  name="participantCount"
  className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold"
  onChange={handleChange}
  value={formData.participantCount}
  min="1"
  required
  />
  </div>
  </div>

  <div className="space-y-4">
  <div className="flex items-center gap-3">
  <input
  type="checkbox"
  name="isPaid"
  id="isPaid"
  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
  onChange={handleChange}
  checked={formData.isPaid}
  />
  <label
  htmlFor="isPaid"
  className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"
  >
  <DollarSign size={12} /> Paid Event
  </label>
  </div>

  {formData.isPaid && (
  <div className="ml-8">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <CreditCard size={12} /> Ticket Price (NPR)
  </label>
  <input
  type="number"
  name="price"
  className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold"
  onChange={handleChange}
  value={formData.price}
  min="0"
  step="100"
  />
  </div>
  )}
  </div>
  </section>
  </div>

  {/* Sidebar Form Fields */}
  <div className="space-y-8">
  <section className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <ImageIcon size={12} /> Event Poster{""}
  {isEditMode ? "(optional to change)" : "*"}
  </label>
  <div className="relative group">
  <div
  className={`w-full h-56 border-2 border-dashed rounded-[2.5rem] overflow-hidden transition-all cursor-pointer flex items-center justify-center
  ${formData.posterPreview ? "border-indigo-100 hover:border-indigo-300" : "border-slate-100 hover:bg-slate-50 hover:border-indigo-200"}`}
  >
  {/* Hidden file input - never required in edit mode */}
  <input
  type="file"
  className="absolute inset-0 opacity-0 cursor-pointer z-10"
  accept="image/*"
  onChange={handleImageUpload}
  required={!isEditMode && !formData.poster}
  />

  {formData.posterPreview ? (
  <>
  <img
  src={formData.posterPreview}
  alt="Event Poster"
  className="w-full h-full object-cover"
  />
  {/* Hover overlay to hint user can click to change */}
  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-0">
  <ImageIcon size={22} className="text-white" />
  <p className="text-white text-[10px] font-black uppercase tracking-widest">
  Click to change poster
  </p>
  </div>
  </>
  ) : (
  <div className="text-center group-hover:scale-105 transition-transform">
  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto shadow-sm group-hover:bg-white group-hover:text-indigo-400 mb-3">
  <ImageIcon size={24} />
  </div>
  <p className="text-[10px] font-black text-slate-400 uppercase">
  Upload Image
  </p>
  <p className="text-[8px] text-slate-300 mt-1">Max 5MB</p>
  </div>
  )}
  </div>
  </div>
  </section>

  <section className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <Tag size={12} /> Category *
  </label>
  <select
  name="category"
  className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold"
  onChange={handleChange}
  value={formData.category}
  required
  >
  {[
  "Workshop",
  "Competition",
  "Hackathon",
  "Seminar",
  "Meetup",
  "Conference",
  "Other",
  ].map((c) => (
  <option key={c} value={c}>
  {c}
  </option>
  ))}
  </select>
  </div>

  <div className="space-y-4">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <Layers size={12} /> Tags (Comma separated)
  </label>
  <input
  type="text"
  name="tags"
  placeholder="e.g. music, tech, art"
  className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold"
  onChange={handleChange}
  value={formData.tags}
  />
  <p className="text-xs text-slate-400 mt-1">
  Optional: Add tags to help people find your event
  </p>
  </div>

  {/* Location Coordinates Section - VISIBLE NOW */}
  <div className="space-y-4 border-t border-slate-100 pt-6">
  <div className="flex items-center gap-2 mb-3">
  <Globe size={14} className="text-indigo-600" />
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
  Location Coordinates
  </label>
  </div>

  <div className="grid grid-cols-2 gap-3">
  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
  Latitude
  </p>
  <div className="flex items-center gap-2">
  <MapPin size={14} className="text-indigo-500" />
  <p className="font-mono font-bold text-slate-800 text-sm">
  {formData.latitude || "-"}
  </p>
  </div>
  </div>
  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
  Longitude
  </p>
  <div className="flex items-center gap-2">
  <MapPin size={14} className="text-indigo-500" />
  <p className="font-mono font-bold text-slate-800 text-sm">
  {formData.longitude || "-"}
  </p>
  </div>
  </div>
  </div>

  {formData.latitude && formData.longitude && (
  <a
  href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
  >
  <MapPin size={12} />
  View on Google Maps
  </a>
  )}
  </div>

  <div className="space-y-4 border-t border-slate-100 pt-6">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
  <MapPin size={12} /> Google Maps URL
  </label>
  <input
  type="url"
  name="googleMapUrl"
  placeholder="Auto-generated from selected location"
  className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 font-bold text-slate-600 text-sm"
  value={formData.googleMapUrl || "No location selected"}
  readOnly
  />
  <p className="text-xs text-slate-400 mt-1">
  Auto-generated when you select a location on the map
  </p>
  </div>
  </section>

  <button
  type="submit"
  disabled={loading}
  className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
  >
  {loading ? (
  <>
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  {isEditMode ? "Updating..." : "Creating..."}
  </>
  ) : (
  <>
  <Zap size={18} />{""}
  {isEditMode ? "Update Event" : "Publish Event"}
  </>
  )}
  </button>
  </div>
  </form>
  </main>
  </div>
  );
};

export default CreateEvents;
