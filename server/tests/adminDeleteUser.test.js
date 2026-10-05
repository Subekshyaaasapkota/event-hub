import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Admin user deletion.
 *
 * The service had a comment reading "Optional: Implement safeguard logic here"
 * and no safeguard, then called User.findByIdAndDelete directly. Four things
 * fell out of that, and each has a test below:
 *
 *   - deleting the last admin locked every admin out of the console
 *   - deleting a user who had registered left Registration rows pointing at a
 *     user that no longer exists, and registrations carry payments
 *   - deleting a user who owned events or club applications did the same to
 *     Events.createdBy and RegisterClub.createdBy
 *   - deleting yourself ended the session the request was authenticated with.
 *     This was documented from the start and never enforced, because the service
 *     was never told who was asking: it only had the id to delete. The requesting
 *     admin is a second argument now, and it is compared as strings because it
 *     comes from the JWT payload, which keys the primary key as `id`.
 *
 * The refusals are the behaviour worth pinning. If a future change turns one of
 * these back into a delete, the corresponding test fails. Each also asserts the
 * status it now carries, because the controller used to recover that from the
 * wording of the message and the wording is not a contract.
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
// The admin making the request. Deliberately different from userId: most cases
// are an admin removing somebody else.
const adminId = "507f1f77bcf86cd7994390aa";

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

    const err = await deleteUser("nope", adminId).catch((e) => e);
    expect(err.message).toMatch(/not valid/i);
    expect(err.status).toBe(400);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("reports a missing user", async () => {
    User.findById.mockResolvedValue(null);

    const err = await deleteUser(userId, adminId).catch((e) => e);
    expect(err.message).toMatch(/not found/i);
    expect(err.status).toBe(404);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses when the account has registrations, and says to cancel instead", async () => {
    User.findById.mockResolvedValue(student);
    Registration.countDocuments.mockResolvedValue(3);

    const err = await deleteUser(userId, adminId).catch((e) => e);
    expect(err.message).toMatch(/cannot be deleted/i);
    expect(err.status).toBe(409);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses when the account still owns events", async () => {
    User.findById.mockResolvedValue(student);
    Event.countDocuments.mockResolvedValue(2);

    const err = await deleteUser(userId, adminId).catch((e) => e);
    expect(err.message).toMatch(/2 events they created/i);
    expect(err.status).toBe(409);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses when the account still owns club applications", async () => {
    User.findById.mockResolvedValue(student);
    Club.countDocuments.mockResolvedValue(1);

    const err = await deleteUser(userId, adminId).catch((e) => e);
    expect(err.message).toMatch(/1 club application/i);
    expect(err.status).toBe(409);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses to remove the last admin", async () => {
    User.findById.mockResolvedValue(admin);
    User.countDocuments.mockResolvedValue(1);

    const err = await deleteUser(userId, adminId).catch((e) => e);
    expect(err.message).toMatch(/only admin account/i);
    expect(err.status).toBe(409);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("allows removing an admin when another one remains", async () => {
    User.findById.mockResolvedValue(admin);
    User.countDocuments.mockResolvedValue(2);

    await expect(deleteUser(userId, adminId)).resolves.toMatchObject({
      success: true,
    });
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
  });

  it("does not run the admin count for a non-admin", async () => {
    User.findById.mockResolvedValue(student);

    await expect(deleteUser(userId, adminId)).resolves.toMatchObject({
      success: true,
    });
    // Counting admins would be a pointless query for anyone else.
    expect(User.countDocuments).not.toHaveBeenCalled();
  });

  it("deletes an account with nothing attached", async () => {
    User.findById.mockResolvedValue(student);

    await expect(deleteUser(userId, adminId)).resolves.toMatchObject({
      success: true,
    });
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
  });

  it("refuses to delete the account making the request", async () => {
    // Requesting admin and target are the same id, with another admin still
    // present so the last-admin guard cannot be what stops it.
    User.findById.mockResolvedValue(admin);
    User.countDocuments.mockResolvedValue(2);

    const err = await deleteUser(userId, userId).catch((e) => e);
    expect(err.message).toMatch(/your own account/i);
    expect(err.status).toBe(409);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses to delete yourself even as a non-admin", async () => {
    // An admin whose roles were changed underneath them still holds a token.
    User.findById.mockResolvedValue(student);

    const err = await deleteUser(userId, userId).catch((e) => e);
    expect(err.message).toMatch(/your own account/i);
    expect(err.status).toBe(409);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses when the requesting admin cannot be identified", async () => {
    // Comparing against a missing id never matches, so allowing it through would
    // fail open on the check that exists to stop a self-delete. It has to fail
    // closed instead.
    User.findById.mockResolvedValue(student);

    const err = await deleteUser(userId, undefined).catch((e) => e);
    expect(err.message).toMatch(/cannot verify/i);
    expect(err.status).toBe(409);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("matches the token's id against params despite the key names differing", async () => {
    // authService maps user._id to `id` in the JWT payload, so the two arrive
    // under different names. The comparison has to survive that.
    User.findById.mockResolvedValue(student);

    const err = await deleteUser(userId, userId.toString()).catch((e) => e);
    expect(err.message).toMatch(/your own account/i);
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });
});