import authService from "../services/authService.js";
import { createAuthToken } from "../helpers/authHelpers.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const register = async (req, res) => {
  const data = req.body;

  if (!data.name || !data.email || !data.password || !data.district) {
  return res.status(422).json({ error: "Required data missing" });
  }
  if (data.password.length < 6) {
  return res
  .status(400)
  .json({ error: "Password length must be at least 6 characters" });
  }
  if (data.password !== data.confirmPassword) {
  return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
  const users = await authService.register(data);

  const token = createAuthToken(users);

  res.cookie("authToken", token, COOKIE_OPTIONS);
  res.status(201).json({ ...users, token });
  } catch (error) {
  // Duplicate email is a conflict, not a server fault
  if (error.message?.includes("already exist")) {
  return res.status(409).json({ error: "An account with this email already exists" });
  }
  res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const data = req.body;

  if (!data.email || !data.password) {
  return res.status(422).json({ error: "Email and password are required" });
  }

  try {
  const existingUser = await authService.login(data);
  const token = createAuthToken(existingUser);

  res.cookie("authToken", token, COOKIE_OPTIONS);
  res.status(200).json({
  ...existingUser,
  clubStatus: existingUser.club ? existingUser.club.status : "None",
  token,
  });
  } catch (error) {
  // Never reveal whether the email exists
  res.status(401).json({ error: "Invalid email or password" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("authToken", { ...COOKIE_OPTIONS, maxAge: 0 });
  res.status(200).json({ success: true, message: "Logged out" });
};

const getMe = async (req, res) => {
  const userId = req.user.id;
  try {
  const meData = await authService.me(userId);
  if (!meData) return res.status(404).json({ error: "User not found" });
  res.status(200).json(meData);
  } catch (error) {
  if (error.message === "User not found") {
  return res.status(404).json({ error: "User not found" });
  }
  res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  try {
  // Collect updated data from body
  // interestedSkills might come as a stringified array if sent via FormData
  let { name, address, district, college, bio, interestedSkills } = req.body;

  // Parse skills if stringified
  if (typeof interestedSkills === "string") {
  try {
  interestedSkills = JSON.parse(interestedSkills);
  } catch (e) {
  interestedSkills = interestedSkills
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
  }
  }

  // Drop empty values so a partially filled form never blanks a field
  const updateData = {};
  for (const [key, value] of Object.entries({
  name,
  address,
  district,
  college,
  bio,
  interestedSkills,
  })) {
  if (value !== undefined && value !== "") {
  updateData[key] = value;
  }
  }

  // Add profile picture URL if a new file was uploaded (Cloudinary URL)
  if (req.file) {
  updateData.profilePicture = req.file.path;
  }

  const updatedUser = await authService.updateProfile(userId, updateData);
  res.status(200).json({
  message: "Profile updated successfully",
  user: updatedUser,
  });
  } catch (error) {
  console.error("Profile Update Error:", error);
  res.status(500).json({ error: error.message });
  }
};

export { register, login, logout, getMe, updateProfile };