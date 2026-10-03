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

  const savedEvent = await Events.create({ ...eventData, location });
  console.log(
  " [SERVICE] Event.create() returned successfully, ID:",
  savedEvent._id,
  );
  return savedEvent;
};

const getAllEvents = async () => {
  return await Events.find().populate(
  "organizer",
  "name logo district email website facebook github instagram twitter linkedin youtube",
  );
};

const getEventById = async (eventId) => {
  return await Events.findById(eventId).populate(
  "organizer",
  "name logo district email website facebook github instagram twitter linkedin youtube",
  );
};

const updateEvent = async (eventId, data) => {
  // Remove raw coordinate fields before saving
  const { coordinates, latitude, longitude, ...updatedData } = data;

  const update = { ...updatedData };

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
      status: "published",
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
      return await Events.find({ status: "published" })
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

  // 1. Get all published events
  let events = await Events.find({ status: "published" }).populate(
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
  const filter = { status: "published" };

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
};
