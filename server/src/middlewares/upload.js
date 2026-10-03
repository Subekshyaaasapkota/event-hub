// middlewares/upload.js
import multer from "multer";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// File filter (shared across all instances)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
  return cb(null, true);
  } else {
  cb(new Error("Only image files are allowed! (jpeg, jpg, png, gif, webp)"));
  }
};

// EVENT Storage - Cloudinary
const eventStorage = new CloudinaryStorage({
  cloudinary,
  params: {
  folder: "eventhub/events",
  allowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
  transformation: [{ width: 1200, height: 630, crop: "limit", quality: "auto" }],
  },
});

// PROFILE Storage - Cloudinary
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
  folder: "eventhub/profiles",
  allowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
  transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto" }],
  },
});

// CLUB Storage - Memory Buffer (upload to Cloudinary manually in controller)
// Using memoryStorage guarantees req.body is ALWAYS populated (CloudinaryStorage streams
// can silently fail to parse text fields if the file stream has connectivity issues)
const clubMemoryStorage = multer.memoryStorage();

// Create Multer Instances
const uploadEvent = multer({
  storage: eventStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

const uploadClub = multer({
  storage: clubMemoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

// Midlewares
export const uploadEventPoster = uploadEvent.single("poster");
export const uploadProfilePicture = uploadProfile.single("profilePicture");
export const uploadClubLogo = uploadClub.single("logo");

// Standard Multer Error handling
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
  if (err.code === "LIMIT_FILE_SIZE") {
  return res.status(400).json({ error: "File too large (Max 2-5MB)" });
  }
  return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message });
  next();
};