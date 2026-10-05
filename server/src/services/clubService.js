import RegisterClub from '../models/RegisterClub.js';
import User from '../models/User.js';
import Events from '../models/Events.js';
import { sendVerificationEmail } from '../utils/emailService.js';

// Fields a club manager is allowed to edit on their own profile.
// `status`, `isVerified` and `createdBy` are admin-only and are never
// accepted from the client.
const EDITABLE_CLUB_FIELDS = [
  "name",
  "phone",
  "contactPerson",
  "category",
  "description",
  "establishedYear",
  "website",
  "district",
  "email",
  "logo",
  "facebook",
  "github",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
];

const applyForClub = async (userId, clubData) => {
  const existing = await RegisterClub.findOne({ createdBy: userId });
  if (existing) {
  if (existing.status === "Pending") {
  throw new Error(
  "You already have a club application awaiting approval.",
  );
  }
  if (existing.status === "Approved") {
  throw new Error("Your club is already approved.");
  }
  // Rejected -> allow a fresh application
  await RegisterClub.deleteOne({ _id: existing._id });
  await User.findByIdAndUpdate(userId, { club: null });
  }

  const newClub = await RegisterClub.create({
  ...clubData,
  createdBy: userId,
  status: "Pending",
  isVerified: false,
  });

  await User.findByIdAndUpdate(userId, { club: newClub._id });
  return newClub;
};

const updateClubProfile = async (userId, updateData) => {
  const club = await RegisterClub.findOne({ createdBy: userId });
  if (!club) {
  throw new Error("Club not found");
  }

  const safeData = {};
  for (const key of EDITABLE_CLUB_FIELDS) {
  if (updateData[key] !== undefined) {
  safeData[key] = updateData[key];
  }
  }

  if (Object.keys(safeData).length === 0) {
  throw new Error("No editable fields were provided");
  }

  return await RegisterClub.findByIdAndUpdate(club._id, safeData, {
  new: true,
  runValidators: true,
  }).populate("createdBy", "name email district college");
};

const approveClub = async (clubId) => {
  const club = await RegisterClub.findByIdAndUpdate(
  clubId,
  { status: "Approved", isVerified: true },
  { new: true }  // <- change 'returnDocument: after' to this
  ).populate("createdBy", "name email district college");

if (club && club.createdBy) {
    await User.findByIdAndUpdate(club.createdBy._id, {
      $addToSet: { roles: "Club" },
    });
    //  club.email is the club's own email from the schema
    //
    //  The email is sent after the write has already committed, and a failure
    //  here is caught rather than rethrown. It used to propagate: an SMTP
    //  outage made approveClub reject, so the admin saw "failed to approve"
    //  while the club was in fact Approved and the owner had the Club role.
    //  The natural response to that error was to press Approve again, which
    //  re-ran the whole thing. The club is approved or it is not, and that is
    //  decided by the database, not by whether a mail server answered.
    try {
      await sendVerificationEmail(club.email, club.name);
    } catch (error) {
      console.error(
        `Club "${club.name}" was approved but the verification email failed:`,
        error.message,
      );
    }
  }
  return club;
};

const rejectClub = async (clubId) => {
  const club = await RegisterClub.findByIdAndUpdate(
  clubId,
  { status: "Rejected", isVerified: false },
  { new: true },
  ).populate("createdBy", "name email district college");

  if (club && club.createdBy) {
  await User.findByIdAndUpdate(club.createdBy._id, {
  $pull: { roles: "Club" },
  });
  }

  return club;
};

const getPendingClubs = async () => {
  return await RegisterClub.find({ status: "Pending" }).populate(
  "createdBy",
  "name email district college",
  );
};

const getAllClubs = async () => {
  try {
  const clubs = await RegisterClub.find({})
  .populate("createdBy", "name email district college")
  .sort({ createdAt: -1 });
  return clubs;
  } catch (error) {
  console.error("Error in getAllClubs service:", error);
  throw error;
  }
};

const getAllCreatedEvents = async (createdBy) => {
  try {
  // First check if Events model exists and has data
  const events = await Events.find({ createdBy: createdBy })
  .populate("organizer", "name") // Populate organizer details if needed
  .sort({ createdAt: -1 });

  console.log(`Found ${events.length} events for user ${createdBy}`);
  return events;
  } catch (error) {
  console.error("Error in getAllCreatedEvents:", error);
  throw error;
  }
};

// const getAllCreatedEvents = async (createdBy) => {
//  const allevents = await Events.aggregate([
//  {
//  $match: { createdBy: new mongoose.Types.ObjectId(createdBy) },
//  },
//  {
//  $lookup: {
//  from: "registerclubs",
//  localField: "organizer",
//  foreignField: "_id",
//  as: "organizerDetails",
//  },
//  },
//  {
//  $project: {
//  _id: 1,
//  title: 1,
//  description: 1,
//  poster: 1,
//  category: 1,
//  district: 1,
//  venue: 1,
//  deadline: 1,
//  eventDate: 1,
//  participantCount: 1,
//  organizer: 1,
//  createdBy: 1,
//  timestamp: 1,
//  organizerDetails: { $arrayElemAt: ["$organizerDetails", 0] }, // Get first element if exists
//  },
//  },
//  ]);

//  return allevents;
// };

const getClubByUserId = async (userId) => {
  return await RegisterClub.findOne({ createdBy: userId });
};

// Add delete event function
const deleteEvent = async (eventId, userId) => {
  // First find the event
  const event = await Events.findById(eventId);

  if (!event) {
  throw new Error("Event not found");
  }

  // Check if the user owns this event
  if (event.createdBy.toString() !== userId) {
  throw new Error("Not authorized to delete this event");
  }

  // Delete the event
  await Events.findByIdAndDelete(eventId);
  return { success: true, message: "Event deleted successfully" };
};

export default {
  applyForClub,
  updateClubProfile,
  approveClub,
  rejectClub,
  getPendingClubs,
  getClubByUserId,
  getAllCreatedEvents,
  getAllClubs,
  deleteEvent,
};
