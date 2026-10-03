import eventService from "../services/eventService.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import { sendInvalidId } from "../utils/objectId.js";

const addEvents = async (req, res) => {
  // console.log("\n [BACKEND] EVENT CREATE REQUEST ");
  // console.log(" [BACKEND] Reached addEvents controller");
  console.log(" [BACKEND] User ID:", req.user?.id);
  // console.log(
  //  " [BACKEND] File received:",
  //  req.file ? req.file.filename : "NO FILE",
  // );
  // console.log(" [BACKEND] Body keys:", Object.keys(req.body));
  // console.log(" [BACKEND] Body content:", req.body);

  const eventData = req.body;
  const userId = req.user.id;

  if (!req.file) {
  console.error(" [BACKEND] No file - rejecting request");
  return res.status(400).json({ error: "Event poster is required" });
  }

  const posterUrl = req.file.path;

  // Validate eventType
  const eventType = eventData.eventType || "physical";
  if (!["online", "physical"].includes(eventType)) {
  return res.status(422).json({
  error: "Invalid eventType. Must be 'online' or 'physical'",
  });
  }

  // Validate required fields (venue only required for physical events)
  const requiredFields = [
  "title",
  "category",
  "district",
  "eventDate",
  "deadline",
  ];

  // Venue is required only for physical events
  if (eventType === "physical") {
  requiredFields.push("venue");
  }

  const missingFields = requiredFields.filter((field) => !eventData[field]);
  console.log(" [BACKEND] Required fields:", requiredFields);
  console.log(" [BACKEND] Missing fields:", missingFields);

  if (missingFields.length > 0) {
  console.error(
  " [BACKEND] VALIDATION FAILED - Missing fields:",
  missingFields,
  );
  return res.status(422).json({
  error: "Required data is missing from requiredFields",
  missingFields,
  });
  }

  // Validate dates
  let eventDateTime;
  if (eventData.eventDate) {
  eventDateTime = new Date(eventData.eventDate);
  console.log(
  " [BACKEND] Using eventDate:",
  eventData.eventDate,
  "->",
  eventDateTime.toISOString(),
  );
  } else {
  console.error(" [BACKEND] Event date is required");
  return res.status(422).json({ error: "Event date is required" });
  }

  const deadlineDate = new Date(eventData.deadline);
  const now = new Date();
  console.log(" [BACKEND] Date validation -", {
  eventDateTime: eventDateTime.toISOString(),
  deadlineDate: deadlineDate.toISOString(),
  });

  if (deadlineDate < now) {
  console.error(" [BACKEND] Deadline in past - rejecting");
  return res
  .status(422)
  .json({ error: "Registration deadline cannot be in the past" });
  }

  if (eventDateTime < deadlineDate) {
  console.error(" [BACKEND] Event date before deadline - rejecting");
  return res
  .status(422)
  .json({ error: "Event date cannot be before registration deadline" });
  }
  console.log(" [BACKEND] Date validation PASSED");

  try {
  console.log(" [BACKEND] Checking if user has a club...");
  // Check if user has a club (delegated to service)
  const club = await eventService.getClubByUser(userId);
  if (!club) {
  console.error(" [BACKEND] User has no verified club - rejecting");
  return res
  .status(403)
  .json({ error: "You need to be a verified club to create events" });
  }
  console.log(" [BACKEND] Club found:", club.name);

  const participantCount = parseInt(eventData.participantCount) || 0;
  const isPaid = eventData.isPaid === "true" || eventData.isPaid === true;
  const tags = eventData.tags
  ? eventData.tags.split(",").map((t) => t.trim())
  : [];
  let googleFormUrls = [];
  if (eventData.googleFormUrls) {
  try {
  googleFormUrls = JSON.parse(eventData.googleFormUrls);
  } catch (e) {
  googleFormUrls = [];
  }
  }
  console.log(" [BACKEND] Parsed form values:", {
  participantCount,
  isPaid,
  tagsCount: tags.length,
  googleFormUrlsCount: googleFormUrls.length,
  });

  // Build event data object
  const eventDataToCreate = {
  ...eventData,
  eventType,
  eventDate: eventDateTime,
  isPaid,
  tags,
  deadline: deadlineDate,
  participantCount,
  poster: posterUrl,
  organizer: club._id,
  createdBy: new mongoose.Types.ObjectId(userId),
  googleFormUrls,
  };

  // For online events, remove venue and location
  if (eventType === "online") {
  console.log(" [BACKEND] Online event - removing venue and location");
  delete eventDataToCreate.venue;
  delete eventDataToCreate.location;
  }

  console.log(" [BACKEND] SAVING EVENT TO DATABASE...");
  console.log(" [BACKEND] Event data summary:", {
  title: eventDataToCreate.title,
  eventType: eventDataToCreate.eventType,
  eventDate: eventDataToCreate.eventDate,
  organizer: eventDataToCreate.organizer,
  createdBy: eventDataToCreate.createdBy,
  poster: eventDataToCreate.poster,
  });

  const newEvent = await eventService.createEvent(eventDataToCreate);

  console.log(" [BACKEND] EVENT CREATED SUCCESSFULLY!");
  console.log(" [BACKEND] Event ID:", newEvent._id);
  console.log(" [BACKEND] Event Title:", newEvent.title);
  console.log("\n");

  res.status(201).json({ message: "Event created successfully", newEvent });
  } catch (error) {
  console.error("\n [BACKEND] ERROR IN TRY BLOCK:");
  console.error(" Error message:", error.message);
  console.error(" Error stack:", error.stack);
  console.error("\n");
  // If there's an error, delete the uploaded file from Cloudinary
  if (req.file && req.file.filename) {
  try {
  await cloudinary.uploader.destroy(req.file.filename);
  console.log(" [BACKEND] Deleted uploaded file from Cloudinary due to error");
  } catch (cloudErr) {
  console.error(" [BACKEND] Could not delete Cloudinary file:", cloudErr.message);
  }
  }
  console.error("Validation Error Details:", error.message);
  res.status(500).json({ error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  const { lat, lng, radius, limit } = req.query;

  try {
  const wantsNearby = lat !== undefined || lng !== undefined;

  if (wantsNearby) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  // Reject junk coordinates up front instead of letting mongo fail on NaN.
  const coordsAreValid =
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180;

  if (!coordsAreValid) {
  return res.status(400).json({
  error: "lat must be between -90 and 90 and lng between -180 and 180",
  });
  }

  const radiusKm = radius === undefined ? 10 : Number(radius);
  const maxResults = limit === undefined ? 100 : Number(limit);

  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
  return res.status(400).json({ error: "radius must be a positive number" });
  }
  if (!Number.isFinite(maxResults) || maxResults <= 0) {
  return res.status(400).json({ error: "limit must be a positive number" });
  }

  const events = await eventService.getNearbyEvents(
  longitude,
  latitude,
  radiusKm,
  Math.min(maxResults, 200),
  );
  return res.status(200).json(events);
  }

  const events = await eventService.getAllEvents();
  res.status(200).json(events);
  } catch (error) {
  console.error("getAllEvents error:", error.message);
  res.status(500).json({ error: "Could not load events" });
  }
};

const getEventById = async (req, res) => {
  const eventId = req.params.id;

  // "/api/events/nearby" and friends land here via the /:id route. A string
  // that is not an id cannot name an event, so answer 404 instead of letting
  // the driver throw a CastError and reporting a 500 for a bad URL.
  if (sendInvalidId(res, { what: "event", id: eventId })) return;

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    res.status(200).json(event);
  } catch (error) {
    console.error("getEventById error:", error.message);
    res.status(500).json({ error: "Could not load this event" });
  }
};

const updateEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  const updatedData = { ...req.body };

  if (sendInvalidId(res, { what: "event", id: eventId })) return;

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) return res.status(404).json({ error: "Event Not Found" });

  if (event.createdBy.toString() !== userId) {
  return res
  .status(403)
  .json({ error: "Unauthorized: You can only edit your own events" });
  }

  // Handle new poster if uploaded (Cloudinary URL)
  if (req.file) {
  updatedData.poster = req.file.path;
  }

  // Parse numeric/boolean fields from FormData
  if (updatedData.participantCount !== undefined) {
  updatedData.participantCount =
  parseInt(updatedData.participantCount) || 0;
  }
  if (updatedData.isPaid !== undefined) {
  updatedData.isPaid =
  updatedData.isPaid === "true" || updatedData.isPaid === true;
  }
  if (updatedData.price !== undefined) {
  updatedData.price = parseFloat(updatedData.price) || 0;
  }

  // Parse tags if provided as string
  if (typeof updatedData.tags === "string") {
  updatedData.tags = updatedData.tags
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);
  }

  // Parse googleFormUrls if provided as JSON string
  if (
  updatedData.googleFormUrls &&
  typeof updatedData.googleFormUrls === "string"
  ) {
  try {
  updatedData.googleFormUrls = JSON.parse(updatedData.googleFormUrls);
  } catch (e) {
  updatedData.googleFormUrls = [];
  }
  }

  // Validate eventType if provided
  if (
  updatedData.eventType &&
  !["online", "physical"].includes(updatedData.eventType)
  ) {
  return res.status(422).json({
  error: "Invalid eventType. Must be 'online' or 'physical'",
  });
  }

  const eventType = updatedData.eventType || event.eventType || "physical";

  // Fix eventDate parsing if provided
  if (updatedData.eventDate) {
  updatedData.eventDate = new Date(updatedData.eventDate);
  }

  // For online events, remove venue and location
  if (eventType === "online") {
  updatedData.venue = "";
  updatedData.location = null;
  }

  const result = await eventService.updateEvent(eventId, updatedData);
  res.status(200).json(result);
  } catch (error) {
  console.error("Error in updateEvent:", error);
  res.status(500).json({ error: error.message });
  }
};

const updateGoogleSheetLink = async (req, res) => {
  console.log(" [BACKEND] updateGoogleSheetLink hit for ID:", req.params.id);
  const eventId = req.params.id;
  const userId = req.user.id;
  const { googleSheetResponseLink } = req.body;

  try {
  const event = await eventService.getEventById(eventId);
  if (!event) return res.status(404).json({ error: "Event Not Found" });

  if (event.createdBy.toString() !== userId) {
  return res
  .status(403)
  .json({ error: "Unauthorized: Access denied" });
  }

  const result = await eventService.updateEvent(eventId, { googleSheetResponseLink });
  res.status(200).json({ success: true, message: "Link updated successfully", event: result });
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  if (sendInvalidId(res, { what: "event", id: eventId })) return;

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You can only delete your own events" });
    }

    await eventService.deleteEvent(eventId);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("deleteEvent error:", error.message);
    res.status(500).json({ error: "Could not delete this event" });
  }
};

const getRecommendedEvents = async (req, res) => {
  try {
  const userId = req.user.id;
  const events = await eventService.getRecommendedEvents(userId);
  res.status(200).json(events);
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Search public events
 * @route GET /api/events/search?q=&category=&district=
 */
const searchEvents = async (req, res) => {
  const { q, category, district } = req.query;

  try {
  const events = await eventService.searchEvents({ q, category, district });
  res.status(200).json(events);
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Get all events belonging to one organizer (club)
 * @route GET /api/events/organizer/:organizerId
 */
const getEventsByOrganizer = async (req, res) => {
  const { organizerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(organizerId)) {
  return res.status(400).json({ error: "Invalid organizer id" });
  }

  try {
  const events = await eventService.getEventsByOrganizer(organizerId);
  res.status(200).json(events);
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

export {
  addEvents,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateGoogleSheetLink,
  getRecommendedEvents,
  searchEvents,
  getEventsByOrganizer,
};
