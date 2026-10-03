import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ROLES from "../../routes/roles.js";
import {
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  Building2,
  Shield,
} from "lucide-react";
import { getImageUrl } from "../../utils/imageUrl";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
  const handleClickOutside = (event) => {
  if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  setOpen(false);
  }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Centralized Role Check
  const userRoles = user?.roles || [];

  const isAdmin = userRoles.includes(ROLES.ADMIN);
  const isClub = userRoles.includes(ROLES.CLUB);
  const isStudent = userRoles.includes(ROLES.STUDENT) || userRoles.length === 0;

  // Check if club registration is pending
  const isClubPending =
  user?.club && !user.club.isVerified && user.club.status === "Pending";
  const isClubApproved = user?.club && user.club.isVerified;

  // Reflects the account's actual standing. A student with a club application
  // in review is not just a "Student", and saying so was the confusing part.
  const roleLabel = isAdmin
  ? "Administrator"
  : isClubApproved
  ? "Club Member"
  : isClubPending
  ? "Club Application Pending"
  : user?.club?.status === "Rejected"
  ? "Club Application Rejected"
  : "Student";

  const navLinkClass = (path) =>
  `font-medium text-[15px] transition-all duration-300 ${
  location.pathname === path
  ? "text-indigo-600"
  : "text-slate-700 hover:text-indigo-600"
  }`;

  const getDashboardLink = () => {
  if (isAdmin) return "/admin/dashboard";
  if (isClubApproved) return "/club/dashboard";
  if (isClubPending) return "/club/verification";
  if (isStudent) return "/dashboard";
  return "/";
  };

  const getDashboardIcon = () => {
  if (isAdmin) return <Shield size={16} />;
  if (isClub) return <Building2 size={16} />;
  if (isStudent) return null;
  return <LayoutDashboard size={16} />;
  };

  const getDashboardText = () => {
  if (isAdmin) return "Admin Panel";
  if (isClubPending) return "Verification Pending";
  if (isClubApproved) return "Club Portal";
  // if(isStudent) return "Welcome To Event Hub"
  if (isStudent) return `${user.name}`;
  return "Dashboard";
  };

  // Tailwind cannot see class names that are built at runtime, so every
  // possible class string has to be written out in full here.
  const DASHBOARD_THEMES = {
  red: {
  text: "text-red-600",
  bg: "bg-red-50",
  hoverBg: "hover:bg-red-100",
  border: "border-red-100",
  hoverText: "hover:text-red-800",
  },
  amber: {
  text: "text-amber-600",
  bg: "bg-amber-50",
  hoverBg: "hover:bg-amber-100",
  border: "border-amber-100",
  hoverText: "hover:text-amber-800",
  },
  indigo: {
  text: "text-indigo-600",
  bg: "bg-indigo-50",
  hoverBg: "hover:bg-indigo-100",
  border: "border-indigo-100",
  hoverText: "hover:text-indigo-800",
  },
  emerald: {
  text: "text-emerald-600",
  bg: "bg-emerald-50",
  hoverBg: "hover:bg-emerald-100",
  border: "border-emerald-100",
  hoverText: "hover:text-emerald-800",
  },
  slate: {
  text: "text-slate-700",
  bg: "bg-slate-50",
  hoverBg: "hover:bg-slate-100",
  border: "border-slate-200",
  hoverText: "hover:text-slate-900",
  },
  };

  const getDashboardTheme = () => {
  if (isAdmin) return DASHBOARD_THEMES.red;
  if (isClubPending) return DASHBOARD_THEMES.amber;
  if (isClubApproved) return DASHBOARD_THEMES.indigo;
  if (isStudent) return DASHBOARD_THEMES.slate;
  return DASHBOARD_THEMES.emerald;
  };

  // Don't render navbar while checking auth
  if (loading) {
  return (
  <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
  <Link
  to="/"
  className="text-2xl font-black bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
  >
  EventHub
  </Link>
  <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
  </div>
  </nav>
  );
  }

  return (
  <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
  {/* Logo */}
  <Link
  to="/"
  className="text-2xl font-black bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
  >
  EventHub
  </Link>

  {/* Mobile Menu Button */}
  <button
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
  >
  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
  </button>

  {/* Desktop Links */}
  <div className="hidden md:flex items-center space-x-8">
  <Link to="/" className={navLinkClass("/")}>
  Home
  </Link>
  <Link to="/events" className={navLinkClass("/events")}>
  Events
  </Link>
  <Link to="/about" className={navLinkClass("/about")}>
  About
  </Link>
  <Link to="/contact" className={navLinkClass("/contact")}>
  Contact
  </Link>

  {!user ? (
  <div className="flex items-center space-x-4">
  <Link to="/login" className={navLinkClass("/login")}>
  Login
  </Link>
  <Link
  to="/signup"
  className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md"
  >
  Get Started
  </Link>
  </div>
  ) : (
  <div className="flex items-center space-x-6">
  {/* --- ROLE BASED PORTALS --- */}
  <Link
  to={getDashboardLink()}
  className={`flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-xl transition-all ${getDashboardTheme().text} ${getDashboardTheme().bg} ${getDashboardTheme().hoverBg} ${getDashboardTheme().hoverText} ${!isStudent ? getDashboardTheme().border : ""}`}
  >
  {getDashboardIcon()}
  <span>{getDashboardText()}</span>
  </Link>

  {/* Club Registration Button.
      Shown to any signed-in user who has neither an approved club nor an
      application still in review. This used to require !isStudent, which
      meant the button never appeared, because every new account is a Student
      and Students are exactly who needs to apply. */}
  {!isAdmin && !isClubPending && !isClubApproved && (
  <Link
  to="/club/register"
  className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all"
  >
  <Building2 size={16} />
  <span>Register Club</span>
  </Link>
  )}

  {/* User Avatar & Dropdown */}
  <div className="relative" ref={dropdownRef}>
  <button
  onClick={() => setOpen(!open)}
  className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-md hover:scale-105 transition overflow-hidden"
  >
  {user.profilePicture ? (
  <img
  src={getImageUrl(user.profilePicture)}
  alt="Profile"
  className="w-full h-full object-cover"
  onError={(e) => {
  e.target.onerror = null;
  e.target.style.display = 'none';
  e.target.nextSibling.style.display = 'flex';
  }}
  />
  ) : null}

  <span
  className="w-full h-full flex items-center justify-center"
  style={{ display: user.profilePicture ? 'none' : 'flex' }}
  >
  {user.name?.charAt(0).toUpperCase()}
  </span>
  </button>

  {open && (
  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
  <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
  {roleLabel}
  </p>
  <p className="text-sm font-bold text-slate-800 truncate">
  {user.name}
  </p>
  {user.club && (
  <p className="text-[10px] text-indigo-600 font-bold mt-1">
  {user.club.name}
  {!user.club.isVerified && (
  <span className="ml-1 text-amber-600">
  ({user.club.status === "Rejected" ? "Rejected" : "Pending"})
  </span>
  )}
  </p>
  )}
  </div>

  <Link
  to="/profile"
  onClick={() => setOpen(false)}
  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
  >
  <User size={16} /> Profile Settings
  </Link>

  {/* Show club registration link in dropdown if not registered and not a student */}
  {!user.club && !isAdmin && !isStudent && (
  <Link
  to="/club/register"
  onClick={() => setOpen(false)}
  className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition"
  >
  <Building2 size={16} /> Register Organization
  </Link>
  )}

  {/* Show verification status link if pending */}
  {isClubPending && (
  <Link
  to="/club/verification"
  onClick={() => setOpen(false)}
  className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition"
  >
  <LayoutDashboard size={16} /> Check Verification Status
  </Link>
  )}

  <button
  onClick={() => {
  logout();
  setOpen(false);
  }}
  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition"
  >
  <LogOut size={16} /> Logout
  </button>
  </div>
  )}
  </div>
  </div>
  )}
  </div>
  </div>

  {/* Mobile Menu */}
  {mobileMenuOpen && (
  <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 shadow-lg">
  <div className="flex flex-col space-y-4">
  <Link
  to="/"
  onClick={() => setMobileMenuOpen(false)}
  className={navLinkClass("/")}
  >
  Home
  </Link>
  <Link
  to="/events"
  onClick={() => setMobileMenuOpen(false)}
  className={navLinkClass("/events")}
  >
  Events
  </Link>
  <Link
  to="/about"
  onClick={() => setMobileMenuOpen(false)}
  className={navLinkClass("/about")}
  >
  About
  </Link>
  <Link
  to="/contact"
  onClick={() => setMobileMenuOpen(false)}
  className={navLinkClass("/contact")}
  >
  Contact
  </Link>

  {!user ? (
  <div className="flex flex-col space-y-3 pt-2">
  <Link
  to="/login"
  onClick={() => setMobileMenuOpen(false)}
  className="text-center font-medium text-slate-700 hover:text-indigo-600 py-2"
  >
  Login
  </Link>
  <Link
  to="/signup"
  onClick={() => setMobileMenuOpen(false)}
  className="text-center bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
  >
  Get Started
  </Link>
  </div>
  ) : (
  <div className="flex flex-col space-y-3 pt-2">
  <Link
  to={getDashboardLink()}
  onClick={() => setMobileMenuOpen(false)}
  className={`flex items-center justify-center gap-2 font-bold text-sm px-4 py-2 rounded-xl ${getDashboardTheme().text} ${getDashboardTheme().bg} ${getDashboardTheme().border}`}
  >
  {getDashboardIcon()}
  <span>{getDashboardText()}</span>
  </Link>

  {!user.club && !isAdmin && !isStudent && (
  <Link
  to="/club/register"
  onClick={() => setMobileMenuOpen(false)}
  className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"
  >
  <Building2 size={16} />
  <span>Register Club</span>
  </Link>
  )}

  <Link
  to="/profile"
  onClick={() => setMobileMenuOpen(false)}
  className="flex items-center justify-center gap-2 text-slate-600 hover:text-indigo-600 py-2"
  >
  {user?.profilePicture ? (
  <img
  src={getImageUrl(user.profilePicture)}
  alt="Profile"
  className="w-5 h-5 rounded-full object-cover"
  onError={(e) => {
  e.target.onerror = null;
  e.target.style.display = "none";
  e.target.nextSibling.style.display = "block";
  }}
  />
  ) : null}
  <User
  size={16}
  style={{ display: user?.profilePicture ? "none" : "block" }}
  />
  Profile
  </Link>

  <button
  onClick={() => {
  logout();
  setMobileMenuOpen(false);
  }}
  className="flex items-center justify-center gap-2 text-red-500 font-medium py-2"
  >
  <LogOut size={16} /> Logout
  </button>
  </div>
  )}
  </div>
  </div>
  )}
  </nav>
  );
};

export default Navbar;
