import adminService from "../services/adminService.js";
import Registration from "../models/Registration.js";

const getAllUsers = async (req, res) => {
  try {
  const users = await adminService.getAllUsers();
  res.status(200).json(users);
  } catch (error) {
  console.error("Error in getAllUsers Controller:", error);
  res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
  const result = await adminService.deleteUser(id);
  res.status(200).json(result);
  } catch (error) {
  console.error("Error in deleteUser Controller:", error);
  res.status(500).json({ message: error.message });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
  const registrations = await Registration.find()
  .populate("user", "name email college district")
  .populate("event", "title eventDate district organizer")
  .populate("event.organizer", "name")
  .sort({ createdAt: -1 });

  res.status(200).json(registrations);
  } catch (error) {
  console.error("Error in getAllRegistrations Controller:", error);
  res.status(500).json({ message: error.message });
  }
};

export { getAllUsers, deleteUser, getAllRegistrations };
