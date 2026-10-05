// src/pages/admin/ManageClubs.jsx
import React from "react";
import ClubDirectory from "../../components/admin/ClubDirectory";

/**
 * The review queue: pending club applications.
 *
 * This used to be a second full implementation of the club list, with its own
 * fetch, filters, status comparison and approve and reject dialogs. It drifted
 * from the Clubs page immediately, so a club whose status casing differed was
 * filtered as pending here and drawn as rejected there, and the two pages
 * disagreed about what a rejection did.
 *
 * It is now the same component with a different default filter, which is the
 * only thing that actually distinguishes the two.
 */
const AdminManageClubs = () => (
  <ClubDirectory
    title="Club verification"
    subtitle="Applications waiting for a decision."
    defaultFilter="pending"
    showRefresh
  />
);

export default AdminManageClubs;