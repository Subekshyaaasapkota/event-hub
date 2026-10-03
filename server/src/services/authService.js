import bcrypt from "bcryptjs";
import User from "../models/User.js";

const register = async (data) => {
  const userExist = await User.findOne({ email: data.email });
  if (userExist) throw new Error("Email already exist...");

  const hashPassword = bcrypt.hashSync(data.password);

  const createdUser = await User.create({
  name: data.name,
  email: data.email,
  password: hashPassword,
  address: data.address,
  district: data.district,
  college: data.college,
  // Roles can never be self-assigned. "Club" is granted by an admin once the
  // club request is approved (see clubService.approveClubRequest).
  roles: ["Student"],
  });

  return {
  id: createdUser._id,
  name: createdUser.name,
  email: createdUser.email,
  address: createdUser.address,
  district: createdUser.district,
  college: createdUser.college,
  club: createdUser.club,
  roles: createdUser.roles,
  profilePicture: createdUser.profilePicture,
  bio: createdUser.bio,
  interestedSkills: createdUser.interestedSkills,
  createdAt: createdUser.createdAt,
  };
};

const login = async (data) => {
  const userExist = await User.findOne({ email: data.email }).populate("club");
  if (!userExist) throw new Error("Invalid Email or Password...");

  const isPasswordMatch = bcrypt.compareSync(data.password, userExist.password);
  if (!isPasswordMatch) throw new Error("Invalid Email or Password...");

  const user = userExist.toObject();

  return {
  id: user._id,
  name: user.name,
  email: user.email,
  address: user.address,
  district: user.district,
  college: user.college,
  club: user.club,
  roles: user.roles,
  profilePicture: user.profilePicture,
  bio: user.bio,
  interestedSkills: user.interestedSkills,
  createdAt: user.createdAt,
  };
};

const me = async (userId) => {
  const user = await User.findById(userId).populate("club").select("-password");
  if (!user) throw new Error("User not found");
  
  return {
  id: user._id,
  name: user.name,
  email: user.email,
  address: user.address,
  district: user.district,
  college: user.college,
  club: user.club,
  roles: user.roles,
  profilePicture: user.profilePicture,
  bio: user.bio,
  interestedSkills: user.interestedSkills,
  createdAt: user.createdAt,
  };
};

const updateProfile = async (userId, updateData) => {
  // Ensure email is not updatable
  const { email, ...safeData } = updateData;

  const updatedUser = await User.findByIdAndUpdate(
  userId,
  { $set: safeData },
  { new: true, runValidators: true }
  ).populate("club").select("-password");

  if (!updatedUser) throw new Error("User not found during update");

  return {
  id: updatedUser._id,
  name: updatedUser.name,
  email: updatedUser.email,
  address: updatedUser.address,
  district: updatedUser.district,
  college: updatedUser.college,
  club: updatedUser.club,
  roles: updatedUser.roles,
  profilePicture: updatedUser.profilePicture,
  bio: updatedUser.bio,
  interestedSkills: updatedUser.interestedSkills,
  };
};

export default { register, login, me, updateProfile };
