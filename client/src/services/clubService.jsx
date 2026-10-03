import api, { getApiErrorMessage } from "../api/axios";

const clubService = {
  /**
  *  Register Organizational Node
  * Submits a registration request for a new club/organization entity.
  */
  registerClub: async (clubData) => {
  try {
  const response = await api.post("/api/clubs/register", clubData, {
  headers: {
  "Content-Type": "multipart/form-data",
  },
  });
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Club registration failed"));
  }
  },

  /**
  *  Get Club Status
  * Retrieves the current organizational status for the provisioned manager identity.
  */
  getClubStatus: async () => {
  try {
  const response = await api.get("/api/clubs/status");
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Status retrieval failure"));
  }
  },

  getAllCreatedEvents: async () => {
  try {
  const response = await api.get("/api/clubs/my-events");
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Event retrieval failure"));
  }
  },

  /**
  *  Update Organizational Profile
  */
  updateClubProfile: async (formData) => {
  try {
  const response = await api.put("/api/clubs/profile", formData);
  return response.data;
  } catch (error) {
  throw new Error(
  getApiErrorMessage(error, "Metadata synchronization failure"),
  );
  }
  },

  /**
  *  Delete Event
  */
  deleteEvent: async (eventId) => {
  try {
  const response = await api.delete(`/api/clubs/events/${eventId}`);
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Event deletion failed"));
  }
  },

  /**
  *  Get Club Registrations
  * Fetches all registrations for events owned by the club
  */
  getClubRegistrations: async () => {
  try {
  const response = await api.get("/api/registrations/club/all");
  return response.data;
  } catch (error) {
  throw new Error(
  getApiErrorMessage(error, "Failed to fetch registrations"),
  );
  }
  },

  updateGoogleSheetLink: async (eventId, googleSheetResponseLink) => {
  try {
  const response = await api.patch(
  `/api/events/integration/google-sheet/${eventId}`,
  { googleSheetResponseLink },
  );
  return response.data;
  } catch (error) {
  throw new Error(
  getApiErrorMessage(error, "Failed to update Google Sheet link"),
  );
  }
  },
};

export default clubService;