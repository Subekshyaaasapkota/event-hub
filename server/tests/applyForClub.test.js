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

  it("clears the stale club reference before pointing at the new one", async () => {
    RegisterClub.findOne.mockResolvedValue(existing("Rejected"));

    await applyForClub(userId, clubData);

    // Two writes in order: null, then the new id. The null write is what stops
    // User.club pointing at a document that was just deleted.
    const calls = User.findByIdAndUpdate.mock.calls;
    expect(calls).toContainEqual([userId, { club: null }]);
    expect(calls[calls.length - 1]).toEqual([userId, { club: newClubId }]);
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