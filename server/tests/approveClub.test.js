import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Approving a club.
 *
 * The ordering here is the whole point of this file. approveClub writes the
 * status and the Club role first, then emails the owner. The email call used to
 * be allowed to throw, so any SMTP failure made the whole function reject after
 * the database had already committed. The admin saw "Failed to approve club",
 * the club was Approved, the owner had the role, and the sensible reaction to
 * that error was to press Approve again.
 *
 * So: a mail failure must not change the outcome, and a mail failure must not
 * undo the role.
 *
 * Mocked models and a stubbed mailer: MONGODB_URL points at a live Atlas
 * cluster, and a real send would leave a message in a shared inbox.
 */

const { RegisterClub, User, sendVerificationEmail } = vi.hoisted(() => ({
  RegisterClub: {
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
  User: { findByIdAndUpdate: vi.fn() },
  sendVerificationEmail: vi.fn(),
}));

vi.mock("../src/models/RegisterClub.js", () => ({ default: RegisterClub }));
vi.mock("../src/models/User.js", () => ({ default: User }));
// The mailer lives in utils/, not services/.
vi.mock("../src/utils/emailService.js", () => ({
  sendVerificationEmail,
}));

// clubService also uses a default export.
const { default: clubService } = await import(
  "../src/services/clubService.js"
);
const { approveClub } = clubService;

const clubId = "507f1f77bcf86cd799439011";

/** Query double that resolves to a populated club, like .populate() does. */
const asPopulatedQuery = (club) => ({ populate: vi.fn().mockResolvedValue(club) });

describe("approveClub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendVerificationEmail.mockResolvedValue(undefined);
    User.findByIdAndUpdate.mockResolvedValue({});
    RegisterClub.findByIdAndUpdate.mockImplementation(() =>
      asPopulatedQuery({
        _id: clubId,
        name: "Robotics Society",
        email: "club@example.com",
        status: "Approved",
        createdBy: { _id: "user-1", email: "owner@example.com" },
      }),
    );
  });

  it("approves the club and grants the Club role", async () => {
    const club = await approveClub(clubId);

    expect(club.status).toBe("Approved");
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("user-1", {
      $addToSet: { roles: "Club" },
    });
  });

  it("emails the club's own address, not the owner's", async () => {
    await approveClub(clubId);

    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "club@example.com",
      "Robotics Society",
    );
  });

  it("still resolves when the email send fails", async () => {
    sendVerificationEmail.mockRejectedValue(new Error("SMTP unreachable"));

    // The regression: this used to reject, so the client reported a failure for
    // an approval that had already been written.
    await expect(approveClub(clubId)).resolves.toMatchObject({
      status: "Approved",
    });
  });

  it("keeps the Club role granted when the email send fails", async () => {
    sendVerificationEmail.mockRejectedValue(new Error("SMTP unreachable"));

    await approveClub(clubId);

    // The role write happens before the email, so a later failure cannot undo it.
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("user-1", {
      $addToSet: { roles: "Club" },
    });
  });

  it("does not email when the club has no creator to attribute it to", async () => {
    RegisterClub.findByIdAndUpdate.mockImplementation(() =>
      asPopulatedQuery({
        _id: clubId,
        name: "Ghost Club",
        email: "club@example.com",
        status: "Approved",
        createdBy: null,
      }),
    );

    const club = await approveClub(clubId);

    expect(club.status).toBe("Approved");
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });
});