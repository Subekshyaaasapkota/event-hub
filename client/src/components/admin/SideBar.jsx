import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Building2,
  ClipboardCheck,
} from "lucide-react";
import AppSidebar from "../common/AppSidebar";

const MENU_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/registrations", label: "Registrations", icon: ClipboardCheck },
  { to: "/admin/clubs", label: "Clubs", icon: Building2 },
  { to: "/admin/club/verification", label: "Verification", icon: ClipboardCheck },
];

const SideBar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <AppSidebar
      title="Core Admin"
      subtitle="Administration"
      items={MENU_ITEMS}
      backLabel="Portal view"
      onSignOut={handleSignOut}
    />
  );
};

export default SideBar;
