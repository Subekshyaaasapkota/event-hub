import Event from "../models/Events.js";
import Registration from "../models/Registration.js";

/**
 * Registration rules
 * ------------------
 * `participantCount`  = capacity (max seats)  <- set by the organizer
 * `currentParticipants` = seats taken  <- maintained by this service
 */
const registerForEvent = async (eventId, userId, formData) => {
  // check event exists
  const event = await Event.findById(eventId);
  if (!event) {
  return { status: 404, data: { error: "Event not found" } };
  }

  const now = new Date();

  // Lifecycle checks
  if (event.status !== "published") {
  return {
  status: 409,
  data: {
  error:
  event.status === "cancelled"
  ? "This event has been cancelled"
  : "This event is not open for registration",
  },
  };
  }

  if (event.eventDate && event.eventDate < now) {
  return { status: 409, data: { error: "This event has already started" } };
  }

  if (event.deadline && event.deadline < now) {
  return {
  status: 409,
  data: { error: "The registration deadline for this event has passed" },
  };
  }

  // Capacity check (0/undefined capacity = unlimited)
  const capacity = Number(event.participantCount) || 0;
  const taken = Number(event.currentParticipants) || 0;
  if (capacity > 0 && taken >= capacity) {
  return { status: 409, data: { error: "This event is already full" } };
  }

  // Check if student already registered
  const existing = await Registration.findOne({ event: eventId, user: userId });

  if (existing) {
  // Already confirmed -> never restart a payment for the same seat
  if (existing.status === "Confirmed") {
  return {
  status: 409,
  data: {
  error: "You are already registered for this event",
  registration: existing,
  },
  };
  }

  // Pending / Failed / Cancelled -> reuse the record so the unique
  // (event, user) index stays intact.
  const wasCancelled = existing.status === "Cancelled";
  Object.assign(existing, formData);
  existing.status = event.isPaid ? "Pending" : "Confirmed";
  existing.paymentService = event.isPaid ? "Khalti" : "None";
  if (event.isPaid) {
  existing.paymentInfo = {
  amount: event.price,
  transactionId: null,
  pidx: null,
  paymentDate: null,
  };
  } else {
  existing.paymentInfo = null;
  }
  await existing.save();

  if (existing.status === "Confirmed" && wasCancelled) {
  await Event.findByIdAndUpdate(eventId, { $inc: { currentParticipants: 1 } });
  }

  return {
  status: 200,
  data: {
  message: event.isPaid
  ? "Form updated! Proceeding to payment..."
  : "Registered successfully!",
  registration: existing,
  },
  };
  }

  try {
  const newRegistration = await Registration.create({
  event: eventId,
  user: userId,
  paymentService: event.isPaid ? "Khalti" : "None", // Set payment service based on event type
  status: event.isPaid ? "Pending" : "Confirmed", // Paid events start as Pending until payment is verified
  paymentInfo: event.isPaid
  ? {
  amount: event.price,
  transactionId: null, // To be filled after payment verification
  paymentDate: null, // To be filled after payment verification
  }
  : null,

  ...formData, // Spread the custom form data (name, email, phone, etc.)
  });

  // Only take a seat if confirmed (Free event)
  if (newRegistration.status === "Confirmed") {
  await Event.findByIdAndUpdate(eventId, { $inc: { currentParticipants: 1 } });
  }

  return {
  status: 201,
  data: {
  message: "Registered successfully!",
  registration: newRegistration,
  },
  };
  } catch (error) {
  // Unique index tripped (double click / two tabs at the same time)
  if (error.code === 11000) {
  const raced = await Registration.findOne({ event: eventId, user: userId });
  return {
  status: 409,
  data: {
  error: "You are already registered for this event",
  registration: raced,
  },
  };
  }

  return { status: 500, data: { error: error.message } };
  }
};

const getEventRegistrations = async (eventId) => {
  try {
  const registrations = await Registration.find({ event: eventId }).populate(
  "user",
  "name email",
  );
  return { status: 200, data: registrations };
  } catch (error) {
  return { status: 500, data: { error: error.message } };
  }
};

const getClubRegistrations = async (userId) => {
  try {
  // Find all events created by this user
  const clubEvents = await Event.find({ createdBy: userId }).select("_id");
  const eventIds = clubEvents.map((e) => e._id);

  // Find all registrations for these events
  const registrations = await Registration.find({ event: { $in: eventIds } })
  .populate("user", "name email district college profilePicture bio interestedSkills")
  .populate("event", "title eventDate isPaid");

  return { status: 200, data: registrations };
  } catch (error) {
  return { status: 500, data: { error: error.message } };
  }
};

const getMyRegistrations = async (userId) => {
  try {
  const registrations = await Registration.find({ user: userId }).populate(
  "event",
  "title eventDate poster isPaid price district venue",
  );
  return { status: 200, data: registrations };
  } catch (error) {
  return { status: 500, data: { error: error.message } };
  }
};

export default {
  registerForEvent,
  getEventRegistrations,
  getClubRegistrations,
  getMyRegistrations,
};