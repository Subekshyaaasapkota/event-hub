// src/pages/admin/AllClubs.jsx
import React from "react";
import ClubDirectory from "../../components/admin/ClubDirectory";

/**
 * Every club on the platform.
 *
 * Shares one implementation with the verification queue, so the two cannot
 * disagree about status or about what approving and rejecting do. See
 * ClubDirectory.
 */
const AdminAllClubs = () => (
  <ClubDirectory
    title="Clubs"
    subtitle="Every club that has applied, and whether it has been approved."
    defaultFilter="all"
  />
);

export default AdminAllClubs;