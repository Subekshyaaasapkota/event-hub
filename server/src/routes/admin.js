import dotenv from "dotenv";
import express from "express";
import auth from "../middlewares/auth.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";
import {
  getAllUsers,
  deleteUser,
  deleteEvent,
  getAllRegistrations,
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
