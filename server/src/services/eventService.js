import mongoose from "mongoose";
import Events from "../models/Events.js";
import RegisterClub from "../models/RegisterClub.js";
import User from "../models/User.js";
import {
  calculateRelevanceScore,
  sortEventsByRelevance,
} from "../utils/recommendationEngine.js";

//  Helpers 

const DEFAULT_LOCATION = { type: "Point", coordinates: [85.324, 27.717] }; // Kathmandu

/**
 * Builds a GeoJSON point from incoming data.
 * Returns `undefined` when the payload carries no location information at all
 * so that partial updates never wipe an existing location.
 */
const buildLocation = (data, { isPartial = false } = {}) => {
  // For online events, don't build location
  if (data.eventType === "online") {
  return null;
  }

  if (data.coordinates?.length === 2) {
  return {
  type: "Point",
  coordinates: [
  parseFloat(data.coordinates[0]),
  parseFloat(data.coordinates[1]),
  ],
  };
  }
  if (data.latitude && data.longitude) {
  return {
  type: "Point",
  coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
  };
  }

  if (isPartial) {
  // No coordinates supplied -> leave the stored location untouched
  return undefined;
  }

  // Only return default location for physical events
  if (data.eventType === "physical") {
  return { ...DEFAULT_LOCATION, coordinates: [...DEFAULT_LOCATION.coordinates] };
  }

  return null;
};

/**
 * Fields a club is allowed to change on its own event.
 *
 * Everything else is dropped rather than rejected, because the client posts a
 * whole form object and rejecting would turn a stray key into a 500. The list is
 * an allowlist on purpose: the previous version spread the request body straight
 * into findByIdAndUpdate, which let a club set its own `status`, hand its event
 * to another organizer, rewrite `createdBy`, and inflate `currentParticipants`
 * to fake a full event.
 *
 * `status` stays editable on purpose. Lifecycle is the club's business; whether
 * the event is allowed in public is decided separately by `verificationStatus`.
 * The two axes are independent, so publishing a draft early still does not make
 * it visible until an admin approves it.
 *
 * `verificationStatus` is absent deliberately. Only the admin endpoints write it.
 */
const CLUB_EDITABLE_FIELDS = new Set([
  "title",
  "description",
  "poster",
  "eventType",
  "category",
  "district",
  "venue",
  "eventDate",
  "deadline",
  "tags",
  "status",
  "participantCount",
  "isPaid",
  "price",
  "registrationType",
  "googleFormUrls",
  "googleSheetResponseLink",
  "googleMapUrl",
]);

/**
 * The filter every publicly reachable query shares.
 *
 * An event must satisfy both conditions to show up for a user:
 *
 *   status published              the club has it live
 *   verificationStatus approved   an admin has signed it off
 *
 * These are independent. A freshly created event is `published` and `pending`,
 * which is exactly the state that keeps it off the public site until reviewed.
 * One shared constant because a filter missing from one of these queries is the
 * kind of hole nobody notices until an unreviewed event shows up on the homepage.
 */
const PUBLIC_EVENT_FILTER = {
  status: "published",
  verificationStatus: "approved",
};

//  Club 

const getClubByUser = async (userId) => {
  return await RegisterClub.findOne({ createdBy: userId, status: "Approved" });
};

//  Events 

const createEvent = async (data) => {
  console.log(" [SERVICE] createEvent called");
  const location = buildLocation(data);
  console.log(" [SERVICE] Location prepared:", location);

  // Remove raw coordinate fields before saving
  const { coordinates, latitude, longitude, ...eventData } = data;
  console.log(" [SERVICE] Cleaned event data keys:", Object.keys(eventData));
  console.log(" [SERVICE] About to call Events.create()...");

  // A new event always starts life awaiting review. `verificationStatus` is
  // forced after the spread so a value in the payload cannot skip the gate.
  const savedEvent = await Events.create({
  ...eventData,
  verificationStatus: "pending",
  location,
  });
  console.log(
  " [SERVICE] Event.create() returned successfully, ID:",
  savedEvent._id,
  );
  return savedEvent;
};

const getAllEvents = async () => {
  // Only published and approved events belong on the public list. Without this
  // filter a draft, cancelled or unreviewed event is served to anyone, which is
  // the opposite of what the status badge claims. Matches getNearbyEvents,
  // searchEvents and getRecommendedEvents, which share PUBLIC_EVENT_FILTER.
  return await Events.find({ ...PUBLIC_EVENT_FILTER }).populate(
  "organizer",
  "name logo district email website facebook github instagram twitter linkedin youtube",
  );
};

const getEventById = async (eventId) => {
  // createdBy is the club owner's user id. Selecting it lets the controller
  // tell whether the caller owns this event and may therefore see it while it
  // is unpublished. It stays an ObjectId, it is not populated in turn.
  return await Events.findById(eventId).populate(
  "organizer",
  "createdBy name logo district email website facebook github instagram twitter linkedin youtube",
  );
};

const updateEvent = async (eventId, data) => {
  // Remove raw coordinate fields before saving
  const { coordinates, latitude, longitude, ...incoming } = data;

  const update = {};
  for (const [key, value] of Object.entries(incoming)) {
  if (CLUB_EDITABLE_FIELDS.has(key)) {
  update[key] = value;
  }
  }

  // Only touch `location` when the request actually carries coordinates,
  // or when the event explicitly switched to an online format.
  const location = buildLocation(data, { isPartial: true });
  if (location !== undefined) {
  update.location = location;
  }

  return await Events.findByIdAndUpdate(eventId, update, {
  new: true,
  runValidators: true,
  });
};

const deleteEvent = async (eventId) => {
  await Events.findByIdAndDelete(eventId);
};

const getNearbyEvents = async (
  longitude,
  latitude,
  radiusKm = 10,
  limit = 100,
) => {
  const radiusMeters = radiusKm * 1000;

  try {
    return await Events.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: radiusMeters,
        },
      },
      ...PUBLIC_EVENT_FILTER,
    })
      .populate("organizer", "name logo district")
      .limit(limit);
  } catch (error) {
    // $near needs a 2dsphere index. If it is missing the whole query fails, so
    // fall back to an unsorted list instead of surfacing a raw mongo error.
    if (/no geoNear|unable to find index/i.test(error.message)) {
      console.error(
        `getNearbyEvents: 2dsphere index unavailable (${error.message}). ` +
          `Returning published events without distance sort.`,
      );
      return await Events.find({ ...PUBLIC_EVENT_FILTER })
        .populate("organizer", "name logo district")
        .sort({ eventDate: 1 })
        .limit(limit);
    }
    throw error;
  }
};

const getRecommendedEvents = async (userId) => {
  const user = await User.findById(userId);
  const interests = (user?.interestedSkills || []).map((i) =>
  i.toLowerCase().trim(),
  );

// 1. Get all public events
  let events = await Events.find({ ...PUBLIC_EVENT_FILTER }).populate(
    "organizer",
  "name logo district",
  );

  if (interests.length > 0) {
  // Apply scoring from utility
  events = events.map((event) => ({
  ...event.toObject(),
  relevanceScore: calculateRelevanceScore(event, interests),
  }));

  // Apply sorting from utility
  events = sortEventsByRelevance(events);

  // Filter: Only show events that have at least some relevance match
  events = events.filter((event) => event.relevanceScore > 0);
  } else {
  // Default: Sort by date if no interests defined
  events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  }

  // Return top 10 matches
  return events.slice(0, 10);
};

const getEventsByOrganizer = async (organizerId) => {
  return await Events.find({ organizer: organizerId })
  .populate("organizer", "name logo district")
  .sort({ eventDate: 1 });
};

const searchEvents = async ({ q, category, district } = {}) => {
  const filter = { ...PUBLIC_EVENT_FILTER };

  if (category) filter.category = category;
  if (district) filter.district = new RegExp(escapeRegex(district), "i");

  if (q && q.trim()) {
  const rx = new RegExp(escapeRegex(q.trim()), "i");
  filter.$or = [
  { title: rx },
  { description: rx },
  { venue: rx },
  { tags: rx },
  ];
  }

  return await Events.find(filter)
  .populate("organizer", "name logo district")
  .sort({ eventDate: 1 });
};

const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Every event, regardless of verification state.
 *
 * The admin console has to see what is waiting for review, so this is
 * deliberately the absence of PUBLIC_EVENT_FILTER. It also lists events whose
 * organizer record has since been removed, which is why the organizer populate
 * is best-effort rather than required.
 */
const getAllEventsForAdmin = async ({ verificationStatus, status } = {}) => {
  const filter = {};
  if (verificationStatus && verificationStatus !== "all") {
    filter.verificationStatus = verificationStatus;
  }
  if (status && status !== "all") {
    filter.status = status;
  }

  return await Events.find(filter)
    .populate("organizer", "name logo district")
    .sort({ createdAt: -1 });
};

/**
 * Record an admin's decision on an event.
 *
 * `verifiedBy` and `verifiedAt` are stamped on every call so the audit trail is
 * not silently cleared when an admin re-reviews something. `verificationNote` is
 * only written when supplied, so approving an event does not wipe the note an
 * admin left when rejecting it previously.
 */
const setEventVerification = async (eventId, verificationStatus, { adminId, note } = {}) => {
  const update = {
    verificationStatus,
    verifiedBy: adminId ? new mongoose.Types.ObjectId(adminId) : null,
    verifiedAt: new Date(),
  };

  if (note !== undefined) {
    update.verificationNote = note;
  }

  return await Events.findByIdAndUpdate(eventId, update, {
    new: true,
    runValidators: true,
  }).populate("organizer", "name logo district");
};

export default {
  getClubByUser,
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getNearbyEvents,
  getRecommendedEvents,
  getEventsByOrganizer,
  searchEvents,
  getAllEventsForAdmin,
  setEventVerification,
};
