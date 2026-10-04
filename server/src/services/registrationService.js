import Event from "../models/Events.js";
import Registration from "../models/Registration.js";

/**
 * Registration rules
 * ------------------
 * `participantCount`  = capacity (max seats)  <- set by the organizer
 * `currentParticipants` = seats held or taken  <- maintained by this file
 *
 * A seat is taken the moment someone registers, not the moment a payment
 * clears. That is the only arrangement that cannot oversell: if paid seats were
 * counted on confirmation, everyone could reach the payment page at once and a
 * ten seat event would sell ten paid seats and no more, but the capacity test
 * would have been comparing against a counter that had not moved yet, so it
 * would have waved all of them through.
 *
 * Holding a seat has one obvious hazard: someone who abandons checkout. Their
 * hold is released by sweepExpiredHolds once PAYMENT_HOLD_MINUTES has passed.
 */

/** How long an unfinished payment keeps its seat before it is given back. */
const PAYMENT_HOLD_MINUTES = 30;

/**
 * Return seats held by payments that were started and never finished.
 *
 * Only Pending rows carrying a hold deadline are considered, and only once that
 * deadline has passed. Confirmed seats are never touched, and a free event
 * never carries a deadline in the first place.
 *
 * Returns the number of seats given back.
 */
const sweepExpiredHolds = async (eventId) => {
  const expired = await Registration.find({
    event: eventId,
    status: "Pending",
    holdExpiresAt: { $ne: null, $lt: new Date() },
  })
    .select("_id")
    .lean();

  if (expired.length === 0) return 0;

  // The status check in the filter matters. Between the read above and this
  // write, the person may have paid, and a row that is now Confirmed must keep
  // its seat rather than be handed back.
  const released = await Registration.updateMany(
    { _id: { $in: expired.map((row) => row._id) }, status: "Pending" },
    { $set: { status: "Cancelled", holdExpiresAt: null } },
  );

  if (released.modifiedCount > 0) {
    await Event.findByIdAndUpdate(eventId, {
      $inc: { currentParticipants: -released.modifiedCount },
    });
  }

  return released.modifiedCount;
};

/**
 * Take one seat, or return null when the event is full.
 *
 * The capacity test and the increment have to be a single database operation.
 * Reading the count and then writing it let two people both read nine of ten
 * taken, both pass the check, and both write, which oversold the event by one.
 * A conditional findOneAndUpdate with an $expr ceiling is the only way to make
 * the test and the write atomic.
 *
 * A capacity of zero means unlimited, so the ceiling only applies when the
 * organizer set a real number.
 */
const claimSeat = async (eventId, capacity) => {
  const filter = { _id: eventId };
  if (capacity > 0) {
    filter.$expr = { $lt: ["$currentParticipants", "$participantCount"] };
  }
  return Event.findOneAndUpdate(
    filter,
    { $inc: { currentParticipants: 1 } },
    { new: true },
  );
};

/** Hand a seat back after a claim that was never followed by a saved row. */
const releaseSeat = async (eventId) => {
  await Event.findByIdAndUpdate(eventId, { $inc: { currentParticipants: -1 } });
};

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

  const capacity = Number(event.participantCount) || 0;

  // Give back the seats of any checkout that was abandoned, so that room is
  // offered to someone who is actually trying to book.
  await sweepExpiredHolds(eventId);

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

    // A Pending row is already holding a seat, so a retry only needs its hold
    // extended. Cancelled and Failed rows gave their seat back, either to the
    // sweep above or when they were cancelled, so they need a fresh one.
    const alreadyHoldingSeat = existing.status === "Pending";
    if (!alreadyHoldingSeat) {
      const claimed = await claimSeat(eventId, capacity);
      if (!claimed) {
        return { status: 409, data: { error: "This event is already full" } };
      }
    }

    // Reuse the record so the unique (event, user) index stays intact.
    Object.assign(existing, formData);
    existing.status = event.isPaid ? "Pending" : "Confirmed";
    existing.paymentService = event.isPaid ? "Khalti" : "None";
    existing.holdExpiresAt = event.isPaid
      ? new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000)
      : null;
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

  // Take the seat before writing the row, and give it back if the write fails.
  const claimed = await claimSeat(eventId, capacity);
  if (!claimed) {
    return { status: 409, data: { error: "This event is already full" } };
  }

  try {
    const newRegistration = await Registration.create({
      event: eventId,
      user: userId,
      paymentService: event.isPaid ? "Khalti" : "None", // Set payment service based on event type
      status: event.isPaid ? "Pending" : "Confirmed", // Paid events start as Pending until payment is verified
      holdExpiresAt: event.isPaid
        ? new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000)
        : null,
      paymentInfo: event.isPaid
        ? {
            amount: event.price,
            transactionId: null, // To be filled after payment verification
            paymentDate: null, // To be filled after payment verification
          }
        : null,

      ...formData, // Spread the custom form data (name, email, phone, etc.)
    });

    return {
      status: 201,
      data: {
        message: "Registered successfully!",
        registration: newRegistration,
      },
    };
  } catch (error) {
    // The row never landed, so the seat taken above has to go back, otherwise
    // a single failed write quietly shrinks the event.
    await releaseSeat(eventId);

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