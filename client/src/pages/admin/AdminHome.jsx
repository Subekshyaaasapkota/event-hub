// src/pages/admin/AdminHome.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../../components/admin/SideBar";
import { getAdminPageTitle } from "../../components/admin/adminNav";

/**
 * Layout for the seven admin routes.
 *
 * This was the one shell in the app still wearing the old look: a slate
 * background, an indigo breadcrumb set in 10px uppercase, a pulsing green dot
 * labelled "Secure", and a footer reading "Terminal Status: Encrypted &
 * Secure". None of that was connected to anything. A badge that claims the
 * connection is secure cannot tell an admin anything true, and a permanently
 * animated dot next to the word "Secure" is decoration that costs a repaint on
 * every frame for a reassurance that is not earned.
 *
 * It now uses the same shell as the student view, so the admin console reads
 * as part of the same product as /profile and /dashboard: warm paper, ink
 * text, one border colour, and an h-16 header. The height is not cosmetic. The
 * mobile pill row inside AppSidebar is sticky at top-16, so a header of any
 * other height leaves a gap or slides underneath it.
 *
 * The page title comes from adminNav rather than from the URL, which is what
 * stopped a Mongo id being rendered as a heading on the event detail pages.
 */
const AdminHome = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-paper">
      <SideBar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-hairline bg-paper/90 px-4 backdrop-blur-md sm:px-6">
          <h1 className="truncate font-display text-lg font-semibold tracking-tight text-ink">
            {getAdminPageTitle(pathname)}
          </h1>
        </header>

        <main className="flex-1 pb-24">
          <div className="mx-auto w-full max-w-5xl px-5 pt-8 sm:px-8 lg:pt-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHome;