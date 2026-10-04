import registrationService from "../services/registrationService.js";
import Events from "../models/Events.js";

// Only these fields may be supplied by the person registering.
// Anything else (status, paymentInfo, user, event, ...) is rejected so a
// client cannot mass-assign privileged fields.
const ALLOWED_FORM_FIELDS = ["name", "email", "phone", "college", "remarks"];

const LIMITS = {
  name: 80,
  email: 120,
  phone: 20,
  college: 160,
  remarks: 500,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Deliberately permissive. Nepalese mobile numbers are ten digits starting
// with 9, but refusing a landline or a number typed with spaces, a country
// code, or brackets would block people who can genuinely be reached, so the
// rule only insists on something number shaped with a plausible digit count.
const PHONE_PATTERN = /^[+()\d][\d\s\-().]{5,24}$/;

const countDigits = (value) => value.replace(/\D/g, "").length;

const isUsablePhoneNumber = (value) =>
  PHONE_PATTERN.test(value) && countDigits(value) >= 7;

const readField = (body, key) =>
  typeof body?.[key] === "string" ? body[key].trim() : "";

/**
 * Trim, allowlist and check the submitted form in one pass.
 *
 * Validating here rather than only in the React form is the point: the form is
 * a convenience, the API is the boundary. A request sent straight to the
 * endpoint skips the form entirely, and previously an empty body produced a
 * saved registration with no name, phone or email on it at all.
 */
const pickAndValidate = (body = {}) => {
  const errors = {};
  const values = {};
  const rejected = new Set();

  for (const key of ALLOWED_FORM_FIELDS) {
    const value = readField(body, key);
    if (value.length > LIMITS[key]) {
      errors[key] =
        key === "remarks"
          ? `Please keep this under ${LIMITS[key]} characters.`
          : `Please use ${LIMITS[key]} characters or fewer.`;
      rejected.add(key);
      continue;
    }
    if (value) values[key] = value;
  }

  // Only the fields that were not already rejected get checked for being
  // present and well formed. Without this, a name of eighty one characters
  // would be told it was missing rather than too long, because it never made
  // it into values.
  if (!rejected.has("name")) {
    if (!values.name) {
      errors.name = "Enter your full name.";
    } else if (values.name.length < 2) {
      errors.name = "That name looks too short.";
    }
  }

  if (!rejected.has("email")) {
    if (!values.email) {
      errors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(values.email)) {
      errors.email = "That does not look like an email address.";
    }
  }

  if (!rejected.has("phone")) {
    if (!values.phone) {
      errors.phone = "Enter a phone number we can reach you on.";
    } else if (!isUsablePhoneNumber(values.phone)) {
      errors.phone =
        "Use digits, optionally with a + country code, spaces or dashes.";
    }
  }

  return { errors, values };
};

const registerForEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  const { errors, values } = pickAndValidate(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: "Please correct the highlighted fields.",
      errors,
    });
  }

  try {
  const response = await registrationService.registerForEvent(
  eventId,
  userId,
  values,
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