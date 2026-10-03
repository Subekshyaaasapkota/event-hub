import registrationService from "../services/registrationService.js";
import Events from "../models/Events.js";

// Only these fields may be supplied by the person registering.
// Anything else (status, paymentInfo, user, event, ...) is rejected so a
// client cannot mass-assign privileged fields.
const ALLOWED_FORM_FIELDS = ["name", "email", "phone", "college", "remarks"];

const pickAllowedFields = (body = {}) =>
  ALLOWED_FORM_FIELDS.reduce((acc, key) => {
  if (typeof body[key] === "string") {
  const value = body[key].trim();
  if (value) acc[key] = value;
  }
  return acc;
  }, {});

const registerForEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  const formData = pickAllowedFields(req.body);

  try {
  const response = await registrationService.registerForEvent(
  eventId,
  userId,
  formData,
  );
  res.status(response.status).json(response.data);
  } catch (error) {
  if (error.name === "CastError") {
  return res.status(400).json({ error: "Invalid event id" });
  }
  console.error("registerForEvent error:", error.message);
  res.status(500).json({ error: "Could not complete the registration" });
  }
};

/**
 * Registrant list for a single event.
 * Private: only the club that owns the event (or an admin) may read it.
 */
const getEventRegistrations = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  const roles = req.user.roles || [];

  try {
  if (!roles.includes("Admin")) {
  const event = await Events.findById(eventId).select("createdBy");
  if (!event) {
  return res.status(404).json({ error: "Event not found" });
  }
  // An event with no owner is never "owned" by the caller, so deny it
  // instead of throwing on a null createdBy.
  if (!event.createdBy || event.createdBy.toString() !== userId) {
  return res
  .status(403)
  .json({ error: "You can only view registrations for your own events" });
  }
  }

  const response = await registrationService.getEventRegistrations(eventId);
  res.status(response.status).json(response.data);
  } catch (error) {
  if (error.name === "CastError") {
  return res.status(400).json({ error: "Invalid event id" });
  }
  res.status(500).json({ error: error.message });
  }
};

const getClubRegistrations = async (req, res) => {
  const userId = req.user.id;
  try {
  const response = await registrationService.getClubRegistrations(userId);
  res.status(response.status).json(response.data);
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

const getMyRegistrations = async (req, res) => {
  const userId = req.user.id;
  try {
  const response = await registrationService.getMyRegistrations(userId);
  res.status(response.status).json(response.data);
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

export {
  registerForEvent,
  getEventRegistrations,
  getClubRegistrations,
  getMyRegistrations,
};