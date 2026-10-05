import api from "../api/axios.js";

const adminService = {
/**
   * Fetches every event for the admin console, including ones still awaiting
   * review.
   *
   * This used to call the public /api/events, which only returns published and
   * approved events. That made review impossible: an event waiting on a decision
   * is by definition not in that response, so there was nothing to approve.
   *
   * `verificationStatus` narrows the list, defaulting to "pending" so the
   * console opens on the queue that actually needs work. "all" passes straight
   * through for browsing everything.
   */
  getAdminEvents: async ({ verificationStatus = "pending", status } = {}) => {
  try {
    const params = { verificationStatus };
    if (status && status !== "all") params.status = status;
    const response = await api.get("/api/admin/events", { params });
    return response.data;
  } catch (error) {
    throw new Error(
    error.response?.data?.message || "Failed to fetch events",
    );
  }
  },

  /**
   * Records an admin's approval decision on an event. `note` is optional and is
   * only sent when supplied, so approving does not blank a note an admin left
   * when rejecting earlier.
   */
  setEventVerification: async (eventId, decision, note) => {
  try {
    const response = await api.put(`/api/admin/events/${decision}/${eventId}`, {
    ...(note ? { note } : {}),
    });
    return response.data;
  } catch (error) {
    throw new Error(
    error.response?.data?.message || "Failed to update this event",
    );
  }
  },

  getAllClubs: async () => {
  try {
  const response = await api.get("/api/clubs/all");
  console.log("API Response for clubs:", response.data); // Debug log
  return response.data;
  } catch (error) {
  console.error("Error fetching clubs:", error);
  throw new Error(error.response?.data?.error || "Failed to fetch clubs");
  }
  },

  approveClub: async (clubId) => {
  try {
  const response = await api.put(`/api/admin/clubs/approve/${clubId}`);
  return response.data;
  } catch (error) {
  console.error("Error approving club:", error);
  throw new Error(error.response?.data?.error || "Failed to approve club");
  }
  },

  rejectClub: async (clubId) => {
  try {
  const response = await api.put(`/api/admin/clubs/reject/${clubId}`);
  return response.data;
  } catch (error) {
  console.error("Error rejecting club:", error);
  throw new Error(error.response?.data?.error || "Failed to reject club");
  }
  },

  getAllUsers: async () => {
  try {
  const response = await api.get("/api/admin/users");
  return response.data;
  } catch (error) {
  throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
  },

  deleteUser: async (userId) => {
  try {
  await api.delete(`/api/admin/users/${userId}`);
  return userId;
  } catch (error) {
  throw new Error(error.response?.data?.message || "Failed to delete user");
  }
  },

  /**
   * Deletes an event as an admin.
   *
   * The server answers 409 when the event has registrations, and the message it
   * sends is written for the person reading it, so it is passed straight
   * through instead of being replaced by a generic failure.
   */
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/api/admin/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete event",
      );
    }
  },

getAllRegistrations: async () => {
    try {
  const response = await api.get("/api/admin/registrations");
  return response.data;
  } catch (error) {
  throw new Error(
  error.response?.data?.message || "Failed to fetch registrations",
  );
  }
  },
};

export default adminService;
