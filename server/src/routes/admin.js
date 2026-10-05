import dotenv from "dotenv";
import express from "express";
import auth from "../middlewares/auth.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";
import {
  getAllUsers,
  deleteUser,
  deleteEvent,
  getAllRegistrations,
  getAllEvents,
  setEventVerification,
} from "../controllers/adminController.js";
import {
  adminApproveClub,
  adminRejectClub,
} from "../controllers/clubController.js";

dotenv.config();

const router = express.Router();


/**
 * @desc Get all users
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
router.get("/users", [auth, roleBasedAuth("Admin")], getAllUsers);

/**
 * @desc Delete a user
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 */
router.delete("/users/:id", [auth, roleBasedAuth("Admin")], deleteUser);

/**
 * @desc Delete an event
 * @route DELETE /api/admin/events/:id
 * @access Private (Admin only)
 *
 * Refuses with 409 when the event has registrations, since deleting it would
 * leave those rows pointing at an event that no longer exists.
 */
router.delete("/events/:id", [auth, roleBasedAuth("Admin")], deleteEvent);

/**
 * @desc Get all registrations across all events
 * @route GET /api/admin/registrations
 * @access Private (Admin only)
 */
router.get(
  "/registrations",
  [auth, roleBasedAuth("Admin")],
  getAllRegistrations,
);

/**
 * @desc Get every event, including ones still awaiting review
 * @route GET /api/admin/events
 * @access Private (Admin only)
 *
 * Separate from the public GET /api/events, which filters to published and
 * approved. Reviewing needs to see what has not been approved yet.
 */
router.get("/events", [auth, roleBasedAuth("Admin")], getAllEvents);

/**
 * @desc Approve or reject an event
 * @route PUT /api/admin/events/:decision/:id
 * @access Private (Admin only)
 *
 * `:decision` is validated against a known set in the controller rather than
 * trusted as a status value, so this cannot be turned into a route that writes an
 * arbitrary field.
 */
router.put(
  "/events/:decision/:id",
  [auth, roleBasedAuth("Admin")],
  setEventVerification,
);

/**
 * @desc Club Approval System
 * @route PUT /api/admin/clubs/approve/:id
 */
router.put(
  "/clubs/approve/:id",
  [auth, roleBasedAuth("Admin")],
  adminApproveClub,
);
router.put(
  "/clubs/reject/:id",
  [auth, roleBasedAuth("Admin")],
  adminRejectClub,
);

export default router;
