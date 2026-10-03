import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Building2,
  Globe,
  MapPin,
  Mail,
  Image as ImageIcon,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  Zap,
  Phone,
  User,
  Tag,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  Clock,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { NEPAL_DISTRICTS } from "../../utils/districts";
import useAuth from "../../hooks/useAuth";
import useOrganizer from "../../hooks/useOrganizer";
import ClubPortal from "../../components/Organizer/ClubRedirection";

console.log("Register.jsx is loading");

const ClubRegistration = () => {
  // console.log("ClubRegistration component rendering");
  const navigate = useNavigate();
  const { clubRegister } = useOrganizer();
  const { getMe } = useAuth();
  const userData = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [checking, setChecking] = useState(true);
  const [existingClub, setExistingClub] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [formData, setFormData] = useState({
  // Step 1: Basic Info
  name: "",
  email: "",
  phone: "",
  contactPerson: "",
  district: "",

  // Step 2: Organization Details
  category: "",
  description: "",
  establishedYear: "",
  website: "",

  // Step 3: Social Media & Links

  logo: "",
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  github: "",
  youtube: "",
  });

  // Check existing club registration
  useEffect(() => {
  let isMounted = true;

  const checkStatus = async () => {
  try {
  if (userData?.club && isMounted) {
  setExistingClub(userData.club);

  // If club is already verified, redirect to dashboard
  if (userData.club?.isVerified) {
  navigate("/club/dashboard");
  return;
  }
  }
  } catch {
  // No existing club - continue to the registration form.
  } finally {
  if (isMounted) {
  setChecking(false);
  }
  }
  };

  if (userData !== undefined) {
  checkStatus();
  }

  return () => {
  isMounted = false;
  };
  }, [userData, navigate]);

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  if (errors[name]) {
  setErrors((prev) => ({ ...prev, [name]: "" }));
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

  setLogoFile(file);

  setFormData({
  ...formData,
  logo: file,
  logoPreview: preview,
  });
  }
  };

  const validateStep1 = () => {
  const newErrors = {};

  if (!formData.name.trim()) newErrors.name = "Club name is required";
  if (!formData.email.trim()) newErrors.email = "Email is required";
  if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
  if (!formData.contactPerson.trim())
  newErrors.contactPerson = "Contact person is required";
  if (!formData.district.trim()) newErrors.district = "District is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email)) {
  newErrors.email = "Please enter a valid email address";
  }

  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (formData.phone && !phoneRegex.test(formData.phone)) {
  newErrors.phone = "Please enter a valid phone number";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
  const newErrors = {};

  const website = formData.website.trim();
  const description = formData.description.trim();
  const establishedYear = Number(formData.establishedYear);
  const currentYear = new Date().getFullYear();

  const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;

  // Website
  if (!website) {
  newErrors.website = "Website is required";
  } else if (!urlRegex.test(website)) {
  newErrors.website = "Please enter a valid URL";
  }

  // Category
  if (!formData.category) {
  newErrors.category = "Category is required";
  }

  // Description
  if (!description) {
  newErrors.description = "Description is required";
  } else if (description.length < 50) {
  newErrors.description = "Description should be at least 50 characters";
  }

  //  Established Year Validation
  if (!formData.establishedYear) {
  newErrors.establishedYear = "Established year is required";
  } else if (isNaN(establishedYear)) {
  newErrors.establishedYear = "EstablishedYear must be a number";
  } else if (establishedYear < 1900) {
  newErrors.establishedYear = "EstablishedYear must be after 1900";
  } else if (establishedYear > currentYear) {
  newErrors.establishedYear = `EstablishedYear cannot be in the future (${currentYear})`;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
  const newErrors = {};

  if (!logoFile) newErrors.logo = "Logo file is required";

  const urlRegex =
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  if (formData.website && !urlRegex.test(formData.website)) {
  newErrors.website = "Please enter a valid URL";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
  if (currentStep === 1 && validateStep1()) {
  setCurrentStep(2);
  window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (currentStep === 2 && validateStep2()) {
  setCurrentStep(3);
  window.scrollTo({ top: 0, behavior: "smooth" });
  }
  };

  const handlePrevious = () => {
  setCurrentStep(currentStep - 1);
  window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateStep3()) return;

  setLoading(true);

  try {
  const formDataToSend = new FormData();

  // Step 1: Basic Info
  formDataToSend.append("name", formData.name.trim());
  formDataToSend.append("email", formData.email.trim());
  formDataToSend.append("phone", formData.phone.trim());
  formDataToSend.append("contactPerson", formData.contactPerson.trim());
  formDataToSend.append("district", formData.district);

  // Step 2: Organization Details
  formDataToSend.append("category", formData.category);
  formDataToSend.append("description", formData.description.trim());
  if (formData.establishedYear) {
  formDataToSend.append("establishedYear", formData.establishedYear);
  }
  formDataToSend.append("website", formData.website.trim());

  // Step 3: Social & Media
  if (logoFile) {
  formDataToSend.append("logo", logoFile);
  }
  if (formData.facebook?.trim()) formDataToSend.append("facebook", formData.facebook.trim());
  if (formData.instagram?.trim()) formDataToSend.append("instagram", formData.instagram.trim());
  if (formData.twitter?.trim()) formDataToSend.append("twitter", formData.twitter.trim());
  if (formData.linkedin?.trim()) formDataToSend.append("linkedin", formData.linkedin.trim());
  if (formData.github?.trim()) formDataToSend.append("github", formData.github.trim());
  if (formData.youtube?.trim()) formDataToSend.append("youtube", formData.youtube.trim());

  const result = await clubRegister(formDataToSend);

  if (result?.success) {
  toast.success("Club registration submitted successfully!");
  setSuccess(true);
  // Refresh user data
  await getMe();
  // Navigate to verification page after a short delay
  setTimeout(() => {
  navigate("/club/verification");
  }, 2000);
  } else {
  toast.error(result?.message || "Something went wrong");
  }
  } catch (error) {
  console.error("Registration error:", error);
  toast.error(error.message || "Server error");
  } finally {
  setLoading(false);
  }
  };

  const getStepTitle = () => {
  switch (currentStep) {
  case 1:
  return "Basic Information";
  case 2:
  return "Organization Details";
  case 3:
  return "Social Media & Links";
  default:
  return "";
  }
  };

  const getStepDescription = () => {
  switch (currentStep) {
  case 1:
  return "Tell us about your organization and contact information";
  case 2:
  return "Provide details about your club's focus and activities";
  case 3:
  return "Add your online presence and social media links";
  default:
  return "";
  }
  };

  // Loading state
  if (checking) {
  return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50/30">
  <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
  <p className="mt-4 text-slate-600">Checking registration status...</p>
  </div>
  </div>
  );
  }

  // Success state after submission
  if (success) {
  return (
  <>
  <ClubPortal />
  {/* <Navbar />
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50/30">
  <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md">
  <CheckCircle className="mx-auto text-green-500 mb-4" size={50} />
  <h2 className="text-2xl font-bold mb-3">
  Registration Submitted 
  </h2>
  <p className="text-gray-600 mb-4">
  Your club application is under review.
  </p>
  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-700">
  Please wait for admin approval. You'll receive an email
  notification.
  </div>
  <button
  onClick={() => navigate("/")}
  className="mt-6 text-indigo-600 font-semibold hover:text-indigo-700"
  >
  Go Home
  </button>
  </div>
  </div>
  <Footer /> */}
  </>
  );
  }

  // Existing pending club
  if (existingClub && !existingClub.isVerified) {
  return (
  <>
  <Navbar />
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50/30">
  <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md">
  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
  <Clock size={40} className="text-amber-600" />
  </div>
  <h2 className="text-2xl font-bold mb-4"> Application Pending</h2>
  <p className="text-gray-600 mb-4">
  You already applied for{""}
  <span className="font-bold text-indigo-600">
  {existingClub?.name}
  </span>
  </p>
  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-700">
  Status: {existingClub?.status}
  </div>
  <button
  onClick={() => navigate("/")}
  className="mt-6 text-indigo-600 font-semibold hover:text-indigo-700"
  >
  Go Home
  </button>
  </div>
  </div>
  <Footer />
  </>
  );
  }

  // Main registration form
  return (
  <>
  <Navbar />

  <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 via-white to-indigo-50/30 pt-32 pb-20">
  <main className="flex-1 flex flex-col items-center px-4 md:px-6 lg:px-8">
  <div className="max-w-5xl w-full">
  {/* Back Button */}
  <button
  onClick={() => navigate(-1)}
  className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-all duration-300 mb-8"
  >
  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
  <ArrowLeft size={18} />
  </div>
  <span className="text-sm font-bold uppercase tracking-wider">
  Back to Previous Page
  </span>
  </button>

  {/* Header Section */}
  <div className="text-center mb-12">
  <div className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-500 to-indigo-600 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg mb-6">
  <Zap size={14} className="fill-white" />
  Partner Program v2.0
  </div>
  <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter mb-4">
  Register Your{""}
  <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
  Organization
  </span>
  </h1>
  <p className="text-slate-600 font-medium text-lg max-w-2xl mx-auto">
  Join our premier network of tech communities and start curating
  world-class experiences.
  </p>
  </div>

  {/* Step Progress Bar */}
  <div className="mb-12">
  <div className="flex items-center justify-between max-w-2xl mx-auto">
  {[1, 2, 3].map((step) => (
  <div key={step} className="flex-1 relative">
  <div className="flex flex-col items-center">
  <div
  className={`
  w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 z-10 relative
  ${currentStep >= step
  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
  : "bg-white border-2 border-slate-200 text-slate-400"
  }
  `}
  >
  {currentStep > step ? <CheckCircle size={24} /> : step}
  </div>
  <div className="absolute top-5 left-1/2 w-full h-0.5 bg-slate-200 z-0">
  <div
  className={`h-full bg-indigo-600 transition-all duration-500 ${currentStep > step ? "w-full" : "w-0"}`}
  ></div>
  </div>
  <p
  className={`text-xs font-bold mt-3 ${currentStep >= step ? "text-indigo-600" : "text-slate-400"}`}
  >
  Step {step}
  </p>
  <p className="text-xs text-slate-500 hidden md:block">
  {step === 1 && "Basic Info"}
  {step === 2 && "Organization"}
  {step === 3 && "Social Links"}
  </p>
  </div>
  </div>
  ))}
  </div>
  </div>

  {/* Form Container */}
  <div className="bg-white rounded-3xl lg:rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
  <div className="bg-linear-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-slate-200">
  <h2 className="text-2xl font-black text-slate-800 mb-2">
  {getStepTitle()}
  </h2>
  <p className="text-slate-600">{getStepDescription()}</p>
  </div>

  <form onSubmit={handleSubmit} className="p-8 md:p-10 lg:p-12">
  {/* Step 1: Basic Information */}
  {currentStep === 1 && (
  <div className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="md:col-span-2">
  <label className="block text-sm font-bold text-slate-700 mb-2">
  Club Name <span className="text-red-500">*</span>
  </label>
  <div className="relative">
  <Building2
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
  size={20}
  />
  <input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.name
  ? "border-red-300"
  : "border-slate-200 focus:border-indigo-500"
  }`}
  placeholder="Enter your organization name"
  />
  </div>
  {errors.name && (
  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
  <AlertCircle size={14} /> {errors.name}
  </p>
  )}
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  Email Address <span className="text-red-500">*</span>
  </label>
  <div className="relative">
  <Mail
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
  size={20}
  />
  <input
  type="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
  className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.email
  ? "border-red-300"
  : "border-slate-200 focus:border-indigo-500"
  }`}
  placeholder="contact@yourclub.com"
  />
  </div>
  {errors.email && (
  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
  <AlertCircle size={14} /> {errors.email}
  </p>
  )}
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  Contact Number <span className="text-red-500">*</span>
  </label>
  <div className="relative">
  <Phone
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
  size={20}
  />
  <input
  type="tel"
  name="phone"
  value={formData.phone}
  onChange={handleChange}
  className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.phone
  ? "border-red-300"
  : "border-slate-200 focus:border-indigo-500"
  }`}
  placeholder="+977 1234567890"
  />
  </div>
  {errors.phone && (
  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
  <AlertCircle size={14} /> {errors.phone}
  </p>
  )}
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  Contact Person (Position){""}
  <span className="text-red-500">*</span>
  </label>
  <div className="relative">
  <User
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
  size={20}
  />
  <input
  type="text"
  name="contactPerson"
  value={formData.contactPerson}
  onChange={handleChange}
  className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.contactPerson
  ? "border-red-300"
  : "border-slate-200 focus:border-indigo-500"
  }`}
  placeholder="John Doe (President)"
  />
  </div>
  {errors.contactPerson && (
  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
  <AlertCircle size={14} /> {errors.contactPerson}
  </p>
  )}
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  District <span className="text-red-500">*</span>
  </label>
  <div className="relative">
  <MapPin
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10"
  size={20}
  />
  <select
  name="district"
  value={formData.district}
  onChange={handleChange}
  className={`w-full pl-12 pr-10 py-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none bg-white ${errors.district
  ? "border-red-300 focus:border-red-500"
  : "border-slate-200 focus:border-indigo-500"
  }`}
  >
  <option value="">Select District</option>
  {Object.entries(NEPAL_DISTRICTS).map(
  ([province, districts]) => (
  <optgroup key={province} label={province}>
  {districts.map((district) => (
  <option key={district} value={district}>
  {district}
  </option>
  ))}
  </optgroup>
  ),
  )}
  </select>
  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
  <svg
  className="w-5 h-5 text-slate-400"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  >
  <path
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth={2}
  d="M19 9l-7 7-7-7"
  />
  </svg>
  </div>
  </div>
  {errors.district && (
  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
  <AlertCircle size={14} /> {errors.district}
  </p>
  )}
  </div>
  </div>
  </div>
  )}

  {/* Step 2: Organization Details */}
  {currentStep === 2 && (
  <div className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  Category <span className="text-red-500">*</span>
  </label>
  <div className="relative">
  <Tag
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
  size={20}
  />
  <select
  name="category"
  value={formData.category}
  onChange={handleChange}
  className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none bg-white ${errors.category
  ? "border-red-300"
  : "border-slate-200 focus:border-indigo-500"
  }`}
  >
  <option value="">Select Category</option>
  <option value="college_club">
  College Club / Student Society
  </option>
  <option value="national_org">
  National Organization
  </option>
  <option value="international_org">
  International Organization
  </option>
  <option value="niche_community">
  Niche Community (Tech-Specific)
  </option>
  <option value="other">Others</option>
  </select>
  </div>
  {errors.category && (
  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
  <AlertCircle size={14} /> {errors.category}
  </p>
  )}
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  Established Year
  </label>
  <input
  type="number"
  name="establishedYear"
  value={formData.establishedYear}
  onChange={handleChange}
  className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
  placeholder="2024"
  min="1900"
  max={new Date().getFullYear()}
  />
  {errors.establishedYear && (
  <p className="text-red-500 text-sm mt-1">
  {errors.establishedYear}
  </p>
  )}
  </div>

  <div className="md:col-span-2">
  <label className="block text-sm font-bold text-slate-700 mb-2">
  Website <span className="text-red-500">*</span>
  </label>
  <div className="relative">
  <Globe
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
  size={20}
  />
  <input
  type="url"
  name="website"
  value={formData.website}
  onChange={handleChange}
  className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.website
  ? "border-red-300"
  : "border-slate-200 focus:border-indigo-500"
  }`}
  placeholder="https://yourclub.com"
  />
  </div>
  {errors.website && (
  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
  <AlertCircle size={14} /> {errors.website}
  </p>
  )}
  </div>

  <div className="md:col-span-2">
  <label className="block text-sm font-bold text-slate-700 mb-2">
  Club Description{""}
  <span className="text-red-500">*</span>
  </label>
  <div className="relative">
  <FileText
  className="absolute left-4 top-5 text-slate-400"
  size={20}
  />
  <textarea
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows="5"
  className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y ${errors.description
  ? "border-red-300"
  : "border-slate-200 focus:border-indigo-500"
  }`}
  placeholder="Describe your organization's mission, vision, activities, and goals..."
  />
  </div>
  {errors.description && (
  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
  <AlertCircle size={14} /> {errors.description}
  </p>
  )}
  <p className="mt-2 text-xs text-slate-400">
  Minimum 50 characters recommended.{""}
  {formData.description.length}/50+
  </p>
  </div>
  </div>
  </div>
  )}

  {/* Step 3: Social Media & Links */}
  {currentStep === 3 && (
  <div className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="md:col-span-2">
  <label className="block text-sm font-bold text-slate-700 mb-2">
  Club Logo <span className="text-red-500">*</span>
  </label>
  <div className="relative">
  <ImageIcon
  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
  size={20}
  />
  <input
  type="file"
  name="logo"
  accept="image/*"
  onChange={handleImageUpload}
  className={`w-full pl-12 pr-4 py-3.5 text-base border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 ${errors.logo
  ? "border-red-300"
  : "border-slate-200 focus:border-indigo-500"
  }`}
  />
  </div>
  {errors.logo && (
  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
  <AlertCircle size={14} /> {errors.logo}
  </p>
  )}

  {formData.logoPreview && (
  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
  <img
  src={formData.logoPreview}
  alt="Club Logo Preview"
  className="h-20 w-20 rounded-xl object-contain bg-white border-2 border-indigo-200 shadow-sm flex-shrink-0"
  />
  <div>
  <p className="text-xs font-bold text-slate-700">Logo Preview</p>
  <p className="text-xs text-slate-500 mt-1">{logoFile?.name}</p>
  <p className="text-xs text-indigo-500 mt-1">
  {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : ""}
  </p>
  </div>
  </div>
  )}
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  <Facebook
  className="inline mr-2 text-blue-600"
  size={18}
  />
  Facebook
  </label>
  <input
  type="url"
  name="facebook"
  value={formData.facebook}
  onChange={handleChange}
  className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
  placeholder="https://facebook.com/yourclub"
  />
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  <Instagram
  className="inline mr-2 text-pink-600"
  size={18}
  />
  Instagram
  </label>
  <input
  type="url"
  name="instagram"
  value={formData.instagram}
  onChange={handleChange}
  className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
  placeholder="https://instagram.com/yourclub"
  />
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  <Github
  className="inline mr-2 text-blue-400"
  size={18}
  />
  Github
  </label>
  <input
  type="url"
  name="github"
  value={formData.github}
  onChange={handleChange}
  className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
  placeholder="https://github.com/yourclub"
  />
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  <Linkedin
  className="inline mr-2 text-blue-700"
  size={18}
  />
  LinkedIn
  </label>
  <input
  type="url"
  name="linkedin"
  value={formData.linkedin}
  onChange={handleChange}
  className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
  placeholder="https://linkedin.com/company/yourclub"
  />
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  <Youtube
  className="inline mr-2 text-red-600"
  size={18}
  />
  YouTube
  </label>
  <input
  type="url"
  name="youtube"
  value={formData.youtube}
  onChange={handleChange}
  className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
  placeholder="https://youtube.com/@yourclub"
  />
  </div>

  <div>
  <label className="block text-sm font-bold text-slate-700 mb-2">
  <Twitter
  className="inline mr-2 text-blue-400"
  size={18}
  />
  Twitter/X
  </label>
  <input
  type="url"
  name="twitter"
  value={formData.twitter}
  onChange={handleChange}
  className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
  placeholder="https://twitter.com/yourclub"
  />
  </div>
  </div>
  </div>
  )}

  {/* Navigation Buttons */}
  <div className="flex justify-between gap-4 mt-10 pt-6 border-t border-slate-200">
  {currentStep > 1 && (
  <button
  type="button"
  onClick={handlePrevious}
  className="px-8 py-4 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-2"
  >
  <ChevronLeft size={20} />
  Previous
  </button>
  )}

  {currentStep < 3 && (
  <button
  type="button"
  onClick={handleNext}
  className="ml-auto px-8 py-4 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center gap-2 shadow-lg"
  >
  Next Step
  <ChevronRight size={20} />
  </button>
  )}

  {currentStep === 3 && (
  <button
  type="submit"
  disabled={loading}
  className="ml-auto px-8 py-4 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
  >
  {loading ? (
  <>
  <svg
  className="animate-spin h-5 w-5 text-white"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  >
  <circle
  className="opacity-25"
  cx="12"
  cy="12"
  r="10"
  stroke="currentColor"
  strokeWidth="4"
  ></circle>
  <path
  className="opacity-75"
  fill="currentColor"
  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  ></path>
  </svg>
  Submitting...
  </>
  ) : (
  <>
  Submit Registration
  <CheckCircle size={20} />
  </>
  )}
  </button>
  )}
  </div>

  {/* Progress Indicator */}
  <div className="mt-6 text-center">
  <p className="text-sm text-slate-400">
  Step {currentStep} of 3
  </p>
  </div>
  </form>
  </div>
  </div>
  </main>

  <Footer />
  </div>
  </>
  );
};

export default ClubRegistration;
