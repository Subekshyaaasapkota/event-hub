import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Admin event deletion.
 *
 * The console has offered a Delete button on every event since it was built, and
 * it did not work. It called a `deleteEvent` that useAdmin never returned, so it
 * threw before a request was made, and neither existing route would have helped
 * anyway: eventsController and clubService both compare event.createdBy against
 * the caller, so an admin could never delete an event they did not create.
 *
 * The branch that matters is the refusal. Both existing delete paths call
 * Events.findByIdAndDelete on its own, so deleting an event that people have
 * signed up for leaves those rows pointing at something that no longer exists,
 * and some of them have payments recorded. So this covers refusing when
 * registrations exist, rather than covering the happy path twice.
 *
 * Mocked models, for the same reason as the registration suite: MONGODB_URL
 * points at a live Atlas cluster.
 */

const { Event, Registration, isValidObjectId } = vi.hoisted(() => ({
  Event: {
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
  Registration: {
    countDocuments: vi.fn(),
  },
  // Declared up front so the mongoose factory below can close over it. The
  // controller calls mongoose.Types.ObjectId.isValid, and if that resolved to
  // the real implementation a valid-looking fixture id would pass on its own,
  // leaving the 400 branch unreachable.
  isValidObjectId: vi.fn(),
}));

/**
 * Mongoose is mocked with a real Schema, not a hand-written stand-in.
 *
 * The controller's transitive imports reach User.js and RegisterClub.js, which
 * build real schemas at module scope. A bare object here made every one of them
 * fail on mongoose.Schema being undefined, which stops the file loading at all.
 * Only ObjectId.isValid is replaced, since that is the branch under test.
 */
vi.mock("mongoose", async () => {
  const actual = await vi.importActual("mongoose");
  return {
    default: {
      ...actual,
      Types: {
        ...actual.Types,
        ObjectId: {
          ...actual.Types.ObjectId,
          isValid: isValidObjectId,
        },
      },
    },
  };
});

vi.mock("../src/models/Events.js", () => ({ default: Event }));
vi.mock("../src/models/Registration.js", () => ({ default: Registration }));

const { deleteEvent } = await import(
  "../src/controllers/adminController.js"
);

const validId = "507f1f77bcf86cd799439011";

/** Minimal response double that records what the controller sent. */
const makeRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

describe("admin deleteEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isValidObjectId.mockReturnValue(true);
    Event.findById.mockResolvedValue({ _id: validId, title: "Test event" });
    Event.findByIdAndDelete.mockResolvedValue({ _id: validId });
    Registration.countDocuments.mockResolvedValue(0);
  });

  it("rejects an id that is not a valid ObjectId without touching the database", async () => {
    isValidObjectId.mockReturnValue(false);

    const res = makeRes();
    await deleteEvent({ params: { id: "not-an-id" } }, res);

    expect(res.statusCode).toBe(400);
    // A malformed id must not become a query.
    expect(Event.findById).not.toHaveBeenCalled();
    expect(Event.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("returns 404 when the event does not exist", async () => {
    Event.findById.mockResolvedValue(null);

    const res = makeRes();
    await deleteEvent({ params: { id: validId } }, res);

    expect(res.statusCode).toBe(404);
    expect(Event.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("refuses and does not delete when the event has registrations", async () => {
    Registration.countDocuments.mockResolvedValue(1);

    const res = makeRes();
    await deleteEvent({ params: { id: validId } }, res);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/cannot be deleted/i);
    expect(res.body.message).toMatch(/cancel it instead/i);
    // The whole point: nothing is removed while registrations point at it.
    expect(Event.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("pluralises the refusal when more than one registration exists", async () => {
    Registration.countDocuments.mockResolvedValue(7);

    const res = makeRes();
    await deleteEvent({ params: { id: validId } }, res);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/7 registrations/);
  });

  it("deletes an event that has no registrations", async () => {
    Registration.countDocuments.mockResolvedValue(0);

    const res = makeRes();
    await deleteEvent({ params: { id: validId } }, res);

    expect(res.statusCode).toBe(200);
    expect(Event.findByIdAndDelete).toHaveBeenCalledWith(validId);
  });

  it("reports a database failure rather than claiming success", async () => {
    Event.findByIdAndDelete.mockRejectedValue(new Error("write failed"));

    const res = makeRes();
    await deleteEvent({ params: { id: validId } }, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/write failed/);
  });
});