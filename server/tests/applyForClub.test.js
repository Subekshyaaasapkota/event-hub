import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Submitting a club application, and what happens when one is rejected.
 *
 * The reject dialog in ClubDirectory tells the owner they can submit the
 * application again. That sentence is a claim about this file, so it gets a test
 * rather than living only in a comment: applyForClub has to actually let a
 * Rejected club back in, replacing the old record instead of tripping over it.
 *
 * It also pins the two cases that must NOT reopen. A Pending application means
 * the owner already has one in the queue, and an Approved one means their club
 * exists. Both used to be refused, and both still are, because quietly replacing
 * an approved club's record would drop the Club role off the owner.
 *
 * The rejection history does not survive a reapply: the old document is deleted
 * and a new one is created under a fresh _id. That is pre-existing and left as
 * it is, but it is why these tests assert on deleteOne rather than on an update.
 *
 * Mocked models: MONGODB_URL points at a live Atlas cluster.
 */

const { RegisterClub, User } = vi.hoisted(() => ({
  RegisterClub: {
    findOne: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
  },
  User: { findByIdAndUpdate: vi.fn() },
}));

vi.mock("../src/models/RegisterClub.js", () => ({ default: RegisterClub }));
vi.mock("../src/models/User.js", () => ({ default: User }));

// clubService exports a default object.
const { default: clubService } = await import(
  "../src/services/clubService.js"
);
const { applyForClub } = clubService;

const userId = "507f1f77bcf86cd799439011";
const newClubId = "507f1f77bcf86cd7994390bb";

const clubData = {
  name: "Robotics Society",
  email: "club@example.com",
  description: "We build things.",
};

const existing = (status) => ({
  _id: "507f1f77bcf86cd7994390cc",
  name: "Robotics Society",
  status,
});

describe("applyForClub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    RegisterClub.findOne.mockResolvedValue(null);
    RegisterClub.create.mockResolvedValue({ _id: newClubId, status: "Pending" });
    RegisterClub.deleteOne.mockResolvedValue({ deletedCount: 1 });
    User.findByIdAndUpdate.mockResolvedValue({});
  });

  it("creates a pending application for a user who has none", async () => {
    await applyForClub(userId, clubData);

    expect(RegisterClub.deleteOne).not.toHaveBeenCalled();
    expect(RegisterClub.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Robotics Society",
        createdBy: userId,
        status: "Pending",
        isVerified: false,
      }),
    );
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
      club: newClubId,
    });
  });

  it("lets a rejected club apply again, replacing the old record", async () => {
    RegisterClub.findOne.mockResolvedValue(existing("Rejected"));

    const result = await applyForClub(userId, clubData);

    // The rejected document is removed rather than updated, so the reapply is a
    // genuinely new application and not a stale one carrying old wording.
    expect(RegisterClub.deleteOne).toHaveBeenCalledWith({
      _id: existing("Rejected")._id,
    });
    expect(RegisterClub.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Pending" }),
    );
    expect(result._id).toBe(newClubId);
  });

  it("repoints the user before deleting the rejected record", async () => {
    RegisterClub.findOne.mockResolvedValue(existing("Rejected"));

    await applyForClub(userId, clubData);

    // Order, not just presence. User.club is moved to the new document while
    // the old one still exists and only then is the old one removed, so there
    // is no point in the sequence where User.club names a document that has
    // been deleted. The previous order deleted first and left that dangling
    // whenever the User write failed.
    const order = [
      ["create", RegisterClub.create.mock.invocationCallOrder[0]],
      ["user", User.findByIdAndUpdate.mock.invocationCallOrder[0]],
      ["delete", RegisterClub.deleteOne.mock.invocationCallOrder[0]],
    ].sort((a, b) => a[1] - b[1]);

    expect(order.map(([step]) => step)).toEqual(["create", "user", "delete"]);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
      club: newClubId,
    });
    // The null write is gone: there is no window that needs it any more.
    expect(User.findByIdAndUpdate).not.toHaveBeenCalledWith(userId, {
      club: null,
    });
  });

  it("leaves the rejected club in place when creating the replacement fails", async () => {
    RegisterClub.findOne.mockResolvedValue(existing("Rejected"));
    RegisterClub.create.mockRejectedValue(new Error("write concern error"));

    await expect(applyForClub(userId, clubData)).rejects.toThrow(
      /write concern/,
);

    // Nothing was removed and the user's reference was never touched, so the
    // owner can simply submit again.
    expect(RegisterClub.deleteOne).not.toHaveBeenCalled();
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("refuses a second application while one is pending", async () => {
    RegisterClub.findOne.mockResolvedValue(existing("Pending"));

    await expect(applyForClub(userId, clubData)).rejects.toThrow(
      /already have a club application/i,
    );
    expect(RegisterClub.create).not.toHaveBeenCalled();
    expect(RegisterClub.deleteOne).not.toHaveBeenCalled();
  });

  it("refuses to reopen an approved club", async () => {
    RegisterClub.findOne.mockResolvedValue(existing("Approved"));

    // Replacing an approved club's record would take the Club role off its owner
    // with no way to tell, so this stays closed.
    await expect(applyForClub(userId, clubData)).rejects.toThrow(
      /already approved/i,
    );
    expect(RegisterClub.create).not.toHaveBeenCalled();
    expect(RegisterClub.deleteOne).not.toHaveBeenCalled();
  });
});