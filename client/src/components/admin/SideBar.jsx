import React from "react";
import useAuth from "../../hooks/useAuth";
import AppSidebar from "../common/AppSidebar";
import { ADMIN_NAV_ITEMS } from "./adminNav";

/**
 * Takes rest props rather than a fixed signature, so anything AppSidebar
 * accepts can be passed through. It previously declared no parameters, so the
 * offsetClassName passed by AdminHome was silently dropped.
 */
const SideBar = (props) => {
  const { logout } = useAuth();

  return (
    <AppSidebar
      title="Core Admin"
      subtitle="Administration"
      logoSrc="/eventhub-logo.svg"
      items={ADMIN_NAV_ITEMS}
      backLabel="Portal view"
      onSignOut={logout}
      {...props}
    />
  );
};

export default SideBar;