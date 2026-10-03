import clubService from "../services/clubService.js";
import cloudinary from "../config/cloudinary.js";

const submitClubRegistration = async (req, res) => {
  const data = { ...req.body };
  const userId = req.user.id;

  // A logo is mandatory for a club record
  if (!req.file) {
  return res.status(422).json({ error: "A club logo is required" });
  }

  try {
  // Upload logo buffer to Cloudinary manually
  try {
  const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  const uploadResult = await cloudinary.uploader.upload(base64, {
  folder: "eventhub/clubs",
  transformation: [{ width: 500, height: 500, crop: "limit", quality: "auto" }],
  });
  data.logo = uploadResult.secure_url;
  } catch (uploadErr) {
  console.error("Cloudinary upload error:", uploadErr.message);
  return res.status(500).json({ error: "Logo upload failed: " + uploadErr.message });
  }

  const club = await clubService.applyForClub(userId, data);
  res.status(201).json({
  message: "Club application submitted. Pending Admin approval.",
  club,
  });
  } catch (error) {
  if (error.name === "ValidationError") {
  const fields = Object.keys(error.errors || {});
  return res
  .status(422)
  .json({ error: `Missing or invalid fields: ${fields.join(", ")}` });
  }
  if (/already/i.test(error.message)) {
  return res.status(409).json({ error: error.message });
  }
  if (error.code === 11000) {
  return res
  .status(409)
  .json({ error: "A club with this email already exists" });
  }
  console.error("Club registration error:", error.message);
  res.status(500).json({ error: error.message });
  }
};

const updateClubProfile = async (req, res) => {
  try {
  const updatedClub = await clubService.updateClubProfile(req.user.id, req.body);
  res.status(200).json({
  message: "Club profile updated successfully",
  club: updatedClub,
  });
  } catch (error) {
  if (error.name === "ValidationError") {
  const fields = Object.keys(error.errors || {});
  return res
  .status(422)
  .json({ error: `Invalid fields: ${fields.join(", ")}` });
  }
  if (/not found/i.test(error.message)) {
  return res.status(404).json({ error: error.message });
  }
  if (/No editable fields/i.test(error.message)) {
  return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: error.message });
  }
};

const getPendingClubs = async (req, res) => {
  try {
  const pendingClubs = await clubService.getPendingClubs();
  res.status(200).json(pendingClubs);
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

const getAllClubs = async (req, res) => {
  try {
  const allClubs = await clubService.getAllClubs();
  console.log(`Found ${allClubs.length} clubs`);
  res.status(200).json(allClubs);
  } catch (error) {
  console.error("Error in getAllClubs:", error);
  res.status(500).json({ error: error.message });
  }
};


// const getAllCreatedEvents = async (req,res) => {
//  const userId = req.user.id;
//  try {
//  const events = await clubService.getAllCreatedEvents(userId);
//  if(!events) return res.status(401).send("No Events Created....");

//  res.status(201).json(events);
//  }catch(error){
//  res.status(501).send(error.message);
//  }
// };

const getAllCreatedEvents = async (req, res) => {
  const userId = req.user.id;
  try {
  const events = await clubService.getAllCreatedEvents(userId);
  if (!events || events.length === 0) {
  return res.status(200).json([]); // Return empty array instead of 404
  }
  res.status(200).json(events);
  } catch (error) {
  console.error("Error in getAllCreatedEvents:", error);
  res.status(500).json({ error: error.message });
  }
};

// Add delete event controller
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
  const result = await clubService.deleteEvent(id, userId);
  res.status(200).json({
  success: true,
  message: "Event deleted successfully",
  data: result
  });
  } catch (error) {
  console.error("Error in deleteEvent:", error);
  res.status(500).json({ 
  success: false,
  error: error.message 
  });
  }
};

const adminApproveClub = async (req, res) => {
  const clubId = req.params.id;
  console.log(`Received request to approve club with ID: ${clubId}`);
  try {
  const approvedClub = await clubService.approveClub(clubId);
  console.log(`Email sent to ${approvedClub.email} with dashboard URL.`);
  res
  .status(200)
  .json({ message: "Club approved and user upgraded.", approvedClub });
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

const adminRejectClub = async (req, res) => {
  const clubId = req.params.id;
  console.log(`Rejecting club with ID: ${clubId}`);
  try {
  const rejectedClub = await clubService.rejectClub(clubId);
  res.status(200).json({
  message: "Club rejected successfully.",
  club: rejectedClub,
  });
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

const getClubStatus = async (req, res) => {
  try {
  const club = await clubService.getClubByUserId(req.user.id);
  if (!club) {
  return res.status(404).json({ message: "No club registration found." });
  }
  res.status(200).json(club);
  } catch (error) {
  res.status(500).json({ error: error.message });
  }
};

export {
  submitClubRegistration,
  updateClubProfile,
  getPendingClubs,
  getAllClubs,
  getAllCreatedEvents,
  adminApproveClub,
  adminRejectClub,
  getClubStatus,
  deleteEvent
};
