import express from "express";
import auth from "../middlewares/auth.js";
import { uploadClubLogo, handleMulterError } from "../middlewares/upload.js";
import {
  submitClubRegistration,
  getPendingClubs,
  adminApproveClub,
  adminRejectClub,
  getClubStatus,
  getAllClubs,
  updateClubProfile,
  getAllCreatedEvents,
  deleteEvent
} from "../controllers/clubController.js";
import roleBasedAuth from "../middlewares/roleBasedAuth.js";

const router = express.Router();

// User routes
router.post(
  "/register",
  auth,
  uploadClubLogo,
  handleMulterError,
  submitClubRegistration
);
router.get("/status", auth, getClubStatus);
router.put("/profile", auth, updateClubProfile); // Add profile update route
//Club Routes
router.get('/my-events',[auth,roleBasedAuth("Club")], getAllCreatedEvents);
router.delete('/events/:id', [auth,roleBasedAuth("Club","Admin")], deleteEvent);
// Admin routes
router.get("/pending", [auth, roleBasedAuth("Admin")], getPendingClubs);
router.get("/all", [auth, roleBasedAuth("Admin")], getAllClubs);

export default router;