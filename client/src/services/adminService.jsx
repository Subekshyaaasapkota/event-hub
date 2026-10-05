import api from "../api/axios.js";

const adminService = {
  getAdminEvents: async () => {
  try {
  const response = await api.get("/api/events");
  return response.data;
  } catch (error) {
  throw new Error(
  error.response?.data?.message || "Failed to fetch events",
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
