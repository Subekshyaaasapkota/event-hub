import React from "react";
import useAuth from "../../hooks/useAuth";
import AppSidebar from "../common/AppSidebar";
import { ADMIN_NAV_ITEMS } from "./adminNav";

const SideBar = () => {
  const { logout } = useAuth();

  return (
    <AppSidebar
      title="Core Admin"
      subtitle="Administration"
      logoSrc="/eventhub-logo.svg"
      items={ADMIN_NAV_ITEMS}
      backLabel="Portal view"
      onSignOut={logout}
    />
  );
};

export default SideBar;