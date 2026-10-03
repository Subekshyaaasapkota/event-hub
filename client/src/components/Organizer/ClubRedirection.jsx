import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; //  Import navigate
import useAuth from "../../hooks/useAuth";
import ClubRegistration from "../../pages/club/ClubRegistration";
import ClubDashboard from "../../pages/club/ClubDashboard";
import { Clock, ArrowLeft, RefreshCw } from "lucide-react";

const ClubPortal = () => {
  const { user, loading, getMe } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const hasRefetched = useRef(false);
  const navigate = useNavigate(); //  Initialize navigate

  useEffect(() => {
  if (loading || user?.club || hasRefetched.current) {
  return;
  }
  hasRefetched.current = true;
  // Run asynchronously so the effect body never sets state synchronously.
  Promise.resolve()
  .then(() => getMe())
  .catch(() => {})
  .finally(() => setRefreshing(false));
  }, [loading, user, getMe]);

  //  Beautiful Loading State
  if (loading || refreshing) {
  return (
  <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
  <div className="flex items-center space-x-2 text-slate-600">
  <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
  <span className="font-medium text-lg">Loading portal...</span>
  </div>
  </div>
  );
  }

  // STEP 1: If no club exists, show the Registration Form
  if (!user?.club) {
  return <ClubRegistration />;
  }

  // STEP 2: If club exists but is not verified, show the "Pending" screen
  if (!user.club.isVerified) {
  return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
  <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-100 flex flex-col items-center">
  {/* Animated Icon Container */}
  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse ring-4 ring-amber-50/50">
  <Clock size={32} />
  </div>

  <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
  Pending Approval
  </h2>

  <p className="text-slate-500 text-sm leading-relaxed mb-6">
  Your application for{""}
  <span className="text-indigo-600 font-semibold">
  {user.club.name}
  </span>{""}
  is under review. An administrator will verify your details within 24
  hrs.
  </p>

  {/* Status Badge */}
  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-xs font-semibold tracking-wide text-slate-600 mb-8">
  <span className="relative flex h-2.5 w-2.5">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
  </span>
  Status: Awaiting Verification
  </div>

  <hr className="w-full border-slate-100 mb-6" />

  {/* Back Home Button */}
  <button
  onClick={() => navigate("/")}
  className="group flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
  >
  <ArrowLeft
  size={16}
  className="transition-transform group-hover:-translate-x-1"
  />
  Return to Homepage
  </button>
  </div>
  </div>
  );
  }

  // STEP 3: If club is verified, show the Dashboard
  return <ClubDashboard />;
};

export default ClubPortal;
