import mongoose from "mongoose";

const registerClubSchema = new mongoose.Schema(
  {
  name: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },

  category: {
  type: String,
  required: true,
  enum: [
  "college_club",
  "national_org",
  "international_org",
  "niche_community",
  "other",
  ],
  },

  description: { type: String, required: true, minlength: 50 },

  establishedYear: {
  type: Number,
  min: 1900,
  max: new Date().getFullYear(),
  },

  website: { type: String, required: true },
  district: { type: String, required: true },

  email: {
  type: String,
  required: true,
  lowercase: true,
  unique: true,
  trim: true,
  },

  logo: { type: String, required: true },

  facebook: { type: String, default: null },
  github: { type: String, default: null },
  instagram: { type: String, default: null },
  twitter: { type: String, default: null },
  linkedin: { type: String, default: null },
  youtube: { type: String, default: null },

  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  },

  status: {
  type: String,
  enum: ["Pending", "Approved", "Rejected"],
  default: "Pending",
  },

  isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("RegisterClub", registerClubSchema);
