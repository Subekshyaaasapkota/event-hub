import mongoose from "mongoose";
import adminService from "../services/adminService.js";
import eventService from "../services/eventService.js";
import Registration from "../models/Registration.js";
import Events from "../models/Events.js";

const getAllUsers = async (req, res) => {
  try {
  const users = await adminService.getAllUsers();
  res.status(200).json(users);
  } catch (error) {
  console.error("Error in getAllUsers Controller:", error);
  res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "That user id is not valid" });
  }

  try {
    // req.user is the JWT payload from auth.js, which is the allowlist built by
    // authService.login. Its primary key is `id`, not `_id`: authService maps
    // user._id to id. Reading req.user._id here returned undefined, so a
    // self-deletion guard written against it would never have fired.
    const result = await adminService.deleteUser(id, req.user?.id);
    res.status(200).json(result);
  } catch (error) {
    // Refusals (a user with registrations, a user who still owns events or
    // clubs, the last admin, deleting yourself) are thrown as HttpError with the
    // status they should be reported as. This used to decide between 409 and 500
    // by matching on substrings of the message, so rewording a sentence or
    // adding a refusal turned it back into a 500 and the admin saw "something
    // broke" for a deliberate decision. Trust error.status instead; anything
    // without one really is an unexpected fault.
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    console.error("Error in deleteUser Controller:", error);
    res.status(500).json({ message: "Could not delete this user." });
  }
};

/**
 * Delete an event on an admin's behalf.
 *
 * There was no working way to do this. The admin console has offered a Delete
 * button on every event since it was built, and it called a `deleteEvent` that
 * useAdmin never returned, so it threw before a request was made. Wiring it to
 * the two existing routes would not have helped either: eventsController and
 * clubService both compare event.createdBy against the caller, so while the
 * clubs route lists Admin in its roleBasedAuth, the service underneath rejects
 * anyone who did not create the event. An admin could never delete an event
 * they did not create.
 *
 * Refuses when the event has registrations rather than orphaning them. Both
 * existing delete paths call Events.findByIdAndDelete on their own, so a
 * registration pointing at a removed event is a dangling ref that every
 * registration query then has to survive. Some of those registrations have
 * payments recorded against them, so this is not a row that can be tidied up
 * later. Cancelling is the honest operation for an event that people signed up
 * for; deletion is for one that never took a registration.
 */
const deleteEvent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "That event id is not valid" });
  }

  try {
    const event = await Events.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrationCount = await Registration.countDocuments({ event: id });
    if (registrationCount > 0) {
      return res.status(409).json({
        message: `This event has ${registrationCount} registration${
          registrationCount === 1 ? "" : "s"
        } and cannot be deleted. Cancel it instead, so the people who signed up keep their record.`,
      });
    }

    await Events.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    console.error("Error in deleteEvent Controller:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Every event, for the admin console.
 *
 * The admin console used to read the public `/api/events` endpoint, which only
 * returns published and now approved events. That is fine for browsing but
 * useless for review: an event waiting on a decision is by definition not in
 * that response, so there was nothing to approve.
 */
const getAllEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEventsForAdmin({
      verificationStatus: req.query.verificationStatus,
      status: req.query.status,
    });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error in getAllEvents Controller:", error);
    res.status(500).json({ message: "Could not load events." });
  }
};

/**
 * Approve or reject an event.
 *
 * One handler for both, because the only difference is the decision value and
 * two near-identical handlers is how they drift apart. The decision is written
 * through eventService rather than straight onto the document so the
 * verifiedBy/verifiedAt stamp is applied the same way in both cases.
 */
const setEventVerification = async (req, res) => {
  const { id } = req.params;
  const decision = req.params.decision;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "That event id is not valid" });
  }

  const target =
    decision === "approve" ? "approved" : decision === "reject" ? "rejected" : null;

  if (!target) {
    return res
      .status(400)
      .json({ message: "Unknown verification action" });
  }

  try {
    // req.user.id, not _id: authService maps the user's _id to id in the JWT
    // payload, so _id would stamp undefined onto every reviewed event.
    const event = await eventService.setEventVerification(id, target, {
      adminId: req.user?.id,
      note: req.body?.note,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message:
  target === "approved"
          ? "Event approved. It is now visible to users."
          : "Event rejected. It stays hidden from users.",
      event,
    });
  } catch (error) {
    console.error("Error in setEventVerification Controller:", error);
    res.status(500).json({ message: "Could not update this event." });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    // Event.organizer is a ref to RegisterClub. It has to be populated with the
    // nested config form: chaining a second .populate("event.organizer") onto a
    // query that already populates "event" silently resolves nothing and leaves
    // the raw ObjectId behind, so the organizer column read and exported as
    // "Unknown" for every row.
    const registrations = await Registration.find()
      .populate("user", "name email college district")
      .populate({
        path: "event",
        select: "title eventDate district organizer",
        populate: { path: "organizer", model: "RegisterClub", select: "name" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error in getAllRegistrations Controller:", error);
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllUsers,
  deleteUser,
  getAllRegistrations,
  deleteEvent,
  getAllEvents,
  setEventVerification,
};
