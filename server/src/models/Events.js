import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  poster: { type: String, required: true },

  // Event Type: Online or Physical
  eventType: {
  type: String,
  enum: ["online", "physical"],
  required: true,
  default: "physical",
  },

  // 1. Added Enum for data integrity
  category: {
  type: String,
  required: true,
  enum: [
  "Workshop",
  "Competition",
  "Hackathon",
  "Seminar",
  "Meetup",
  "Conference",
  "Other",
  ],
  },

  district: { type: String, required: true, trim: true },
  // Venue is optional - only required for physical events
  venue: { type: String, trim: true },
  eventDate: { type: Date, required: true },
  deadline: { type: Date, required: true },

  // 2. Capacity Management
  participantCount: { type: Number, default: 0, min: 0 },
  currentParticipants: { type: Number, default: 0, min: 0 },

  tags: { type: [String], default: [] },

  organizer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "RegisterClub",
  default: null,
  },
  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  },

  // 3. Lifecycle Status
  status: {
  type: String,
  enum: ["draft", "published", "cancelled", "completed"],
  default: "published",
  },

  // 4. Monetization
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0, min: 0 },

  // 6. Registration Type
  registrationType: {
  type: String,
  enum: ["system", "google_form"],
  default: "system",
  },
  googleFormUrls: [{ type: String, trim: true }], // Array of Google Form and response sheet URLs
  googleSheetResponseLink: { type: String, trim: true }, // Direct link to CSV or Response sheet

  // 5. Geospatial Data - Optional, only for physical events
  location: {
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number] }, // [Long, Lat] - Optional
  },
  googleMapUrl: { type: String, trim: true },
  },
  { timestamps: true },
);

// 6. Middleware & Indexing
// Only create geospatial index if coordinates exist.
// `sparse` must be passed as index options, not inside the key. Putting it in
// the key makes MongoDB reject the whole spec with "Values in v:2 index key
// pattern cannot be of type bool", so the index silently never gets created and
// every $near / "find near me" query then fails at runtime.
eventSchema.index({ location: "2dsphere" }, { sparse: true });
eventSchema.index({ district: 1, category: 1, eventDate: 1 });

export default mongoose.model("Event", eventSchema);
