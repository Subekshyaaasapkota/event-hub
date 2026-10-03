import express from "express";
import auth from "../middlewares/auth.js";
import { uploadEventPoster, handleMulterError } from "../middlewares/upload.js";
import {
  addEvents,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateGoogleSheetLink,
  getRecommendedEvents,
  searchEvents,
  getEventsByOrganizer,
} from "../controllers/eventsController.js";

const router = express.Router();

router.get("/diag/ping", (req, res) => res.json({ status: "Events Router is Online" }));

// Recommendation route - Must be before /:id to avoid conflict
router.get("/recommendations", auth, getRecommendedEvents);

// Search and organizer routes must also be declared before /:id
router.get("/search", searchEvents);
router.get("/organizer/:organizerId", getEventsByOrganizer);

// GET /api/events?lat=27.717&lng=85.324&radius=10 - for nearby events
// GET /api/events - for all events

router.post("/create", auth, uploadEventPoster, handleMulterError, addEvents);

router.get("/", getAllEvents);

router.patch("/integration/google-sheet/:id", auth, updateGoogleSheetLink);

router.get("/:id", getEventById);

router.put("/:id", auth, uploadEventPoster, handleMulterError, updateEvent);

router.delete("/:id", auth, deleteEvent);

export default router;
