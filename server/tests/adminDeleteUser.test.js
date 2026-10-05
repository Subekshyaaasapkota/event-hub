import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Admin user deletion.
 *
 * The service had a comment reading "Optional: Implement safeguard logic here"
 * and no safeguard, then called User.findByIdAndDelete directly. Three things
 * fell out of that, and each has a test below:
 *
 *   - deleting the last admin locked every admin out of the console
 *   - deleting a user who had registered left Registration rows pointing at a
 *     user that no longer exists, and registrations carry payments
 *   - deleting a user who owned events or club applications did the same to
 *     Events.createdBy and RegisterClub.createdBy
 *
 * The refusals are the behaviour worth pinning. If a future change turns one of
 * these back into a delete, the corresponding test fails.
 *
 * Mocked models: MONGODB_URL points at a live Atlas cluster.
 */

const { User, Event, Registration, Club, isValidObjectId } = vi.hoisted(() => ({
  User: {
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
  Event: { countDocuments: vi.fn() },
  Registration: { countDocuments: vi.fn() },
  Club: { countDocuments: vi.fn() },
  isValidObjectId: vi.fn(),
}));

vi.mock("mongoose", async () => {
  const actual = await vi.importActual("mongoose");
  return {
    default: {
      ...actual,
      Types: {
        ...actual.Types,
        ObjectId: { ...actual.Types.ObjectId, isValid: isValidObjectId },
      },
    },
  };
});

vi.mock("../src/models/User.js", () => ({ default: User }));
vi.mock("../src/models/Events.js", () => ({ default: Event }));
vi.mock("../src/models/Registration.js", () => ({ default: Registration }));
vi.mock("../src/models/RegisterClub.js", () => ({ default: Club }));

// adminService exports a default object, not named exports.
const { default: adminService } = await import(
  "../src/services/adminService.js"
);
const { deleteUser } = adminService;

const userId = "507f1f77bcf86cd799439011";

const admin = { _id: userId, name: "Admin", roles: ["Admin"] };
const student = { _id: userId, name: "Student", roles: ["Student"] };

describe("admin deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isValidObjectId.mockReturnValue(true);
    Registration.countDocuments.mockResolvedValue(0);
    Event.countDocuments.mockResolvedValue(0);
    Club.countDocuments.mockResolvedValue(0);
    User.countDocuments.mockResolvedValue(3);
  });

  it("rejects an invalid id without querying", async () => {
    isValidObjectId.mockReturnValue(false);

    await expect(deleteUser("nope")).rejects.toThrow(/not valid/i);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("reports a missing user", async () => {
    User.findById.mockResolvedValue(null);

    await expect(deleteUser(userId)).rejects.toThrow(/not found/i);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses when the account has registrations, and says to cancel instead", async () => {
    User.findById.mockResolvedValue(student);
    Registration.countDocuments.mockResolvedValue(3);

    await expect(deleteUser(userId)).rejects.toThrow(/cannot be deleted/i);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses when the account still owns events", async () => {
    User.findById.mockResolvedValue(student);
    Event.countDocuments.mockResolvedValue(2);

    await expect(deleteUser(userId)).rejects.toThrow(/2 events they created/i);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses when the account still owns club applications", async () => {
    User.findById.mockResolvedValue(student);
    Club.countDocuments.mockResolvedValue(1);

    await expect(deleteUser(userId)).rejects.toThrow(/1 club application/i);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses to remove the last admin", async () => {
    User.findById.mockResolvedValue(admin);
    User.countDocuments.mockResolvedValue(1);

    await expect(deleteUser(userId)).rejects.toThrow(/only admin account/i);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("allows removing an admin when another one remains", async () => {
    User.findById.mockResolvedValue(admin);
    User.countDocuments.mockResolvedValue(2);

    await expect(deleteUser(userId)).resolves.toMatchObject({ success: true });
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
  });

  it("does not run the admin count for a non-admin", async () => {
    User.findById.mockResolvedValue(student);

    await expect(deleteUser(userId)).resolves.toMatchObject({ success: true });
    // Counting admins would be a pointless query for anyone else.
    expect(User.countDocuments).not.toHaveBeenCalled();
  });

  it("deletes an account with nothing attached", async () => {
    User.findById.mockResolvedValue(student);

    await expect(deleteUser(userId)).resolves.toMatchObject({ success: true });
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
  });
});