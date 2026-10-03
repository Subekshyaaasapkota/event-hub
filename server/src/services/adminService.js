import User from "../models/User.js";

const getAllUsers = async () => {
  try {
  // Populate club if needed, excluding passwords for security
  const users = await User.find({}).populate("club").select("-password");
  return users;
  } catch (error) {
  throw new Error(error.message || "Failed to fetch users from database");
  }
};

const deleteUser = async (userId) => {
  try {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Prevent deleting the only admin accidentally if needed
  // (Optional: Implement safeguard logic here)

  await User.findByIdAndDelete(userId);
  return { success: true, message: "User deleted successfully" };
  } catch (error) {
  throw new Error(error.message || "Failed to delete user");
  }
};

export default {
  getAllUsers,
  deleteUser,
};
