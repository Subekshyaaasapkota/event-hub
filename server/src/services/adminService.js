import mongoose from "mongoose";
import User from "../models/User.js";
import Event from "../models/Events.js";
import Registration from "../models/Registration.js";
import Club from "../models/RegisterClub.js";
import { badRequest, conflict, notFound } from "../utils/httpError.js";

const getAllUsers = async () => {
  try {
  // Populate club if needed, excluding passwords for security
  const users = await User.find({}).populate("club").select("-password");
    return users;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch users from database");
  }
};

/**
 * Delete a user on an admin's behalf.
 *
 * Three things were wrong with the original.
 *
 * The comment said "Optional: Implement safeguard logic here" and there was
 * none, so deleting the only admin account locked every admin out of the
 * console with no way back in through the UI. That is the failure this guards
 * first, before anything else, since it is the one that cannot be undone by
 * re-creating a record.
 *
 * Second, the user is referenced from three other collections: their events,
 * their club applications, and their registrations. User.findByIdAndDelete
 * removed the row and left all three pointing at a user that no longer exists.
 * Registrations are the one that matters, because they carry payments. So this
 * refuses rather than orphaning, and says what to do instead. Registration is
 * checked first and on its own, since it is the record with money on it.
 *
 * Third, an admin deleting themselves ends their own session mid-request, which
 * reads as a failure even when it worked. Refusing is clearer than succeeding
 * into a logout.
 *
 * That third guard needed to know who was asking, so the requesting admin is
 * now a parameter. It was described here from the start but never enforced:
 * with only a userId there was nothing to compare against, so any admin could
 * remove themselves as long as a second admin existed, and the console deleted
 * the account it was authenticated as.
 *
 * Deleting a user with nothing attached is still allowed. That covers accounts
 * that registered and then never engaged with anything.
 *
 * Refusals are thrown as HttpError so the controller reports the reason instead
 * of guessing at it from the wording. See utils/httpError.js.
 */
const deleteUser = async (userId, requestingAdminId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw badRequest("That user id is not valid.");
  }

  const user = await User.findById(userId);
  if (!user) throw notFound("User not found");

  const isAdmin = user.roles?.includes("Admin");

  // Checked first, and even for a non-admin. An admin removing a spam account
  // should not be able to wipe the records that account created.
  const registrations = await Registration.countDocuments({ user: userId });
  if (registrations > 0) {
    throw conflict(
      `This account has ${registrations} registration${
        registrations === 1 ? "" : "s"
      }, so it cannot be deleted. Cancel the registrations instead, then remove the account.`,
    );
  }

  const [events, clubs] = await Promise.all([
    Event.countDocuments({ createdBy: userId }),
    Club.countDocuments({ createdBy: userId }),
  ]);

  if (events > 0 || clubs > 0) {
    const parts = [];
    if (events > 0) {
      parts.push(`${events} event${events === 1 ? "" : "s"} they created`);
    }
    if (clubs > 0) {
      parts.push(
        `${clubs} club application${clubs === 1 ? "" : "s"} they submitted`,
      );
    }
    throw conflict(
      `This account still owns ${parts.join(" and ")}. Remove or reassign ${
        events > 0 && clubs > 0 ? "them" : "it"
      } first, then delete the account.`,
    );
  }

  // Guarded after the ownership checks, so it cannot be used to sidestep them
  // by picking a different victim: there still has to be an admin left.
  if (isAdmin) {
    const adminCount = await User.countDocuments({ roles: "Admin" });
    if (adminCount <= 1) {
      throw conflict(
        "This is the only admin account. Promote another admin before removing it, or nobody can reach this console.",
      );
    }
  }

  // Last, once the other refusals are out of the way, so the explanation for
  // clicking your own row is never a confusing ownership message. Compared as
  // strings because the id comes from params and the admin's from the token.
  //
  // An unidentifiable caller is refused rather than allowed through. Comparing
  // against a missing id never matches, so the alternative is failing open on
  // the one check that exists to stop an admin removing the account they are
  // signed in as. For a deletion that is the wrong way to be wrong.
  if (!requestingAdminId) {
    throw conflict(
      "Cannot verify which admin is making this request, so nothing was deleted.",
    );
  }

  if (String(userId) === String(requestingAdminId)) {
    throw conflict(
      "This is your own account. Use Sign out instead of deleting yourself.",
    );
  }

  await User.findByIdAndDelete(userId);
  return { success: true, message: "User deleted successfully" };
};

export default {
  getAllUsers,
  deleteUser,
};