import mongoose from "mongoose";
import adminService from "../services/adminService.js";
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
  try {
  const result = await adminService.deleteUser(id);
  res.status(200).json(result);
  } catch (error) {
  console.error("Error in deleteUser Controller:", error);
  res.status(500).json({ message: error.message });
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

export { getAllUsers, deleteUser, getAllRegistrations, deleteEvent };
