import api, { getApiErrorMessage } from "../api/axios";

const eventService = {
  /**
  *  Get All Events
  * Retrieves a list of all publicly available events.
  */
  getAllEvents: async (params = {}) => {
  try {
  const response = await api.get("/api/events", { params });
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Failed to fetch events"));
  }
  },

  /**
  *  Get Event By ID
  * Retrieves detailed metadata for a specific event node.
  */
  getEventById: async (eventId) => {
  try {
  const response = await api.get(`/api/events/${eventId}`);
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Event retrieval failure"));
  }
  },

  /**
  *  Create New Event
  * Submits a fresh event manifest to the central oversight node.
  */
  createEvent: async (eventData) => {
  try {
  const response = await api.post("/api/events/create", eventData, {
  headers: {
  "Content-Type": "multipart/form-data",
  },
  });
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Event deployment failure"));
  }
  },

  /**
  *  Update Event Interface
  * Synchronizes updated metadata for a provisioned event node.
  */
  updateEvent: async (eventId, updatedData) => {
  try {
  const response = await api.put(`/api/events/${eventId}`, updatedData);
  return response.data;
  } catch (error) {
  throw new Error(
  getApiErrorMessage(error, "Metadata synchronization failure"),
  );
  }
  },

  /**
  *  Terminate Event Node
  * Permanently decommissions an active event from the network.
  */
  deleteEvent: async (eventId) => {
  try {
  await api.delete(`/api/events/${eventId}`);
  return eventId;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Decommissioning failed"));
  }
  },

  /**
  *  Register for an Event
  */
  registerForEvent: async (eventId, formData) => {
  try {
  const response = await api.post(`/api/registrations/${eventId}`, formData);
  return response.data;
  } catch (error) {
  throw new Error(
  getApiErrorMessage(error, "Event registration failed"),
  );
  }
  },

  /**
  *  Get My Registrations
  */
  getMyRegistrations: async () => {
  try {
  const response = await api.get("/api/registrations/my");
  return response.data;
  } catch (error) {
  throw new Error(
  getApiErrorMessage(error, "Failed to fetch your registrations"),
  );
  }
  },

  /**
  *  Get Events by Organizer
  * Retrieves events created by a specific organizer
  */
  getEventsByOrganizer: async (organizerId) => {
  try {
  const response = await api.get(`/api/events/organizer/${organizerId}`);
  return response.data;
  } catch (error) {
  throw new Error(
  getApiErrorMessage(error, "Failed to fetch organizer events"),
  );
  }
  },

  /**
  *  Search Events
  * Search events by title, description, tags, or location
  */
  searchEvents: async (searchParams) => {
  try {
  const response = await api.get("/api/events/search", {
  params: searchParams,
  });
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Search failed"));
  }
  },

  /**
  *  Get Recommended Events
  * Fetches events matching the student's interest vector
  */
  getRecommendedEvents: async () => {
  try {
  const response = await api.get("/api/events/recommendations");
  return response.data;
  } catch (error) {
  throw new Error(
  getApiErrorMessage(error, "Failed to fetch recommendations"),
  );
  }
  },
};

export default eventService;