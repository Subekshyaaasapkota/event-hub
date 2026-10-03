// src/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ROLES from "./roles.js";
import ProtectedRoute from "../components/protected/ProtectedRoute";
import RegistrationFormWrapper from "./wrappers/RegistrationFormWrapper";
import UserLayout from "../components/layout/UserLayout";

// Public Pages
import Home from "../pages/public/Home";
import Events from "../pages/public/Events";
import EventDetails from "../pages/public/EventDetails";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import SupportCenter from "../pages/public/SupportCenter";
import PaymentSuccess from "../pages/public/PaymentSuccess";
import EsewaPayment from "../pages/public/EsewaPayment";
import NotFound from "../pages/public/NotFound";

// Auth Pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// User Pages
import Dashboard from "../pages/user/Dashboard";
import RegisteredEvents from "../pages/user/RegisteredEvents";
import Profile from "../pages/user/Profile";

// Club Pages
import ClubDashboard from "../pages/club/ClubDashboard";
import CreateEvents from "../pages/club/CreateEvents";
import ManageYourEvents from "../pages/club/ClubEventListing";
import AdminEventManagement from "../pages/club/ManageEventDetails";
import ClubRegistration from "../pages/club/ClubRegistration.jsx";
import ClubPortal from "../components/Organizer/ClubRedirection.jsx";
import ManageEventRegisterByUser from "../pages/club/ManageEventRegisterByUser";
import EventAnalytics from "../pages/club/EventAnalytics";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminManageEvents from "../pages/admin/ManageEvents";
import AdminManageClubs from "../pages/admin/ManageClubs";
import AdminAllUsers from "../pages/admin/AllUsers";
import AdminAllClubs from "../pages/admin/AllClubs";
import AdminEventDetails from "../pages/admin/AdminEventDetails";
import AdminRegistrations from "../pages/admin/AdminRegistrations";
import AdminHome from "../pages/admin/AdminHome.jsx";
import MainLayout from "../components/layout/MainLayout.jsx";
import ScrollToTop from "./ScrollToTop.jsx";

const AppRoutes = () => {
return (
  <>
  {/* Every route change scrolls back to the top. This lives here rather than
      in each page because pages kept missing it, so navigation inherited the
      previous page's scroll offset. */}
  <ScrollToTop />
  {/* /privacy-policy, /terms, and /faq all render the SupportCenter page. */}
  <Routes>
  {/*  Public Routes */}
  <Route element={<MainLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/events" element={<Events />} />
  <Route path="/event/:id" element={<EventDetails />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/privacy-policy" element={<SupportCenter />} />
  <Route path="/terms-and-conditions" element={<SupportCenter />} />
  <Route path="/faq" element={<SupportCenter />} />
  </Route>
  <Route path="/payment-success" element={<PaymentSuccess />} />
  <Route path="/esewa-payment" element={<EsewaPayment />} />

  {/*  Authentication Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />

  {/*  Student Routes */}
  <Route
  path="/register-for-event/:id"
  element={
  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
  <RegistrationFormWrapper />
  </ProtectedRoute>
  }
  />

  <Route
  element={
  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
  <UserLayout />
  </ProtectedRoute>
  }
  >
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/registered-events" element={<RegisteredEvents />} />
  <Route path="/profile" element={<Profile />} />
  </Route>

  {/*  Club Routes - signed-in clubs and admins only */}
  <Route
  path="/club/dashboard"
  element={
  <ProtectedRoute allowedRoles={[ROLES.CLUB, ROLES.ADMIN]}>
  <ClubDashboard />
  </ProtectedRoute>
  }
  />
  <Route
  path="/club/create-event"
  element={
  <ProtectedRoute allowedRoles={[ROLES.CLUB, ROLES.ADMIN]}>
  <CreateEvents />
  </ProtectedRoute>
  }
  />
  <Route
  path="/club/my-events"
  element={
  <ProtectedRoute allowedRoles={[ROLES.CLUB, ROLES.ADMIN]}>
  <ManageYourEvents />
  </ProtectedRoute>
  }
  />
  <Route
  path="/club/my-events/:id"
  element={
  <ProtectedRoute allowedRoles={[ROLES.CLUB, ROLES.ADMIN]}>
  <AdminEventManagement />
  </ProtectedRoute>
  }
  />
  <Route
  path="/club/registrations"
  element={
  <ProtectedRoute allowedRoles={[ROLES.CLUB, ROLES.ADMIN]}>
  <ManageEventRegisterByUser />
  </ProtectedRoute>
  }
  />
  <Route
  path="/club/analytics"
  element={
  <ProtectedRoute allowedRoles={[ROLES.CLUB, ROLES.ADMIN]}>
  <EventAnalytics />
  </ProtectedRoute>
  }
  />

  {/* Any signed-in user may apply to run a club */}
  <Route
  path="/club/register"
  element={
  <ProtectedRoute>
  <ClubRegistration />
  </ProtectedRoute>
  }
  />
  <Route
  path="/club/verification"
  element={
  <ProtectedRoute>
  <ClubPortal />
  </ProtectedRoute>
  }
  />

  {/*  Admin Routes */}
  <Route
  path="/admin"
  element={
  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
  <AdminHome />
  </ProtectedRoute>
  }
  >
  <Route index element={<Navigate to="/admin/dashboard" replace />} />
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="events" element={<AdminManageEvents />} />
  <Route path="event/:id" element={<AdminEventDetails />} />
  <Route path="events/edit/:id" element={<AdminEventDetails />} />
  <Route path="users" element={<AdminAllUsers />} />
  <Route path="clubs" element={<AdminAllClubs />} />
  <Route path="registrations" element={<AdminRegistrations />} />
  <Route path="club/verification" element={<AdminManageClubs />} />
  </Route>

  {/* 404 Fallback. Used to silently redirect to "/", which gave no feedback
      on a dead link and broke the back button. It now renders inside
      MainLayout so the navbar stays available. */}
  <Route element={<MainLayout />}>
  <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
  </>
  );
};

export default AppRoutes;