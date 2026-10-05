import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Admin verification for events.
 *
 * Two things are worth locking down here, and neither of them is the approve
 * button working.
 *
 * The first is that a club cannot approve its own event. Verification is only
 * real if the club cannot set it, and updateEvent used to spread the entire
 * request body straight into findByIdAndUpdate, so a club could send
 * {"status":"published"} or {"verificationStatus":"approved"} and have it
 * accepted. Every other field it could reach with the same request is covered
 * too, because they came through the same hole: createdBy and organizer would
 * hand the event to somebody else, and currentParticipants would let a club fake
 * a full event.
 *
 * The second is that "published" no longer means "visible". Before this, every
 * new event went public immediately. Now it starts pending and stays invisible
 * until approved, and every public query filters on both conditions. A filter
 * missing from one of those queries is invisible until an unreviewed event turns
 * up on the homepage, so each is asserted individually.
 *
 * Mocked models, for the same reason as the other suites: MONGODB_URL points at
 * a live Atlas cluster.
 */

const { Events } = vi.hoisted(() => ({
  Events: {
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../src/models/Events.js", () => ({ default: Events }));
vi.mock("../src/models/RegisterClub.js", () => ({ default: { findOne: vi.fn() } }));
vi.mock("../src/models/User.js", () => ({ default: { findById: vi.fn() } }));

const eventService = (await import("../src/services/eventService.js")).default;

const validId = "507f1f77bcf86cd799439011";

/** A chainable query double. Resolves to itself so .populate()/.sort() work. */
const makeQuery = (resolved = []) => {
  const query = Promise.resolve(resolved);
  query.populate = vi.fn(() => query);
  query.sort = vi.fn(() => query);
  query.limit = vi.fn(() => query);
  return query;
};

beforeEach(() => {
  vi.clearAllMocks();
  Events.find.mockImplementation(() => makeQuery([]));
  Events.findByIdAndUpdate.mockImplementation(() => makeQuery());
});

describe("a club cannot approve its own event", () => {
  it("drops verificationStatus from an update", async () => {
    await eventService.updateEvent(validId, {
      title: "A better title",
      verificationStatus: "approved",
    });

    const update = Events.findByIdAndUpdate.mock.calls[0][1];
    expect(update).not.toHaveProperty("verificationStatus");
    expect(update.title).toBe("A better title");
  });

  it("drops the ownership and counter fields", async () => {
    await eventService.updateEvent(validId, {
      createdBy: "someone-else",
      organizer: "someone-elses-club",
      currentParticipants: 9999,
      title: "Still allowed",
    });

    const update = Events.findByIdAndUpdate.mock.calls[0][1];
    // The three that would let a club redirect or inflate its own event.
    expect(update).not.toHaveProperty("createdBy");
    expect(update).not.toHaveProperty("organizer");
    expect(update).not.toHaveProperty("currentParticipants");
    expect(update.title).toBe("Still allowed");
  });

  it("still lets a club set the lifecycle status", async () => {
    await eventService.updateEvent(validId, { status: "draft" });

    const update = Events.findByIdAndUpdate.mock.calls[0][1];
    // Lifecycle stays the club's business. Visibility is decided separately, so
    // setting draft early does not need to touch verification.
    expect(update.status).toBe("draft");
  });

  it("still lets a club set participantCount, its own declared capacity", async () => {
    await eventService.updateEvent(validId, { participantCount: 120 });

    const update = Events.findByIdAndUpdate.mock.calls[0][1];
    expect(update.participantCount).toBe(120);
  });
});

describe("a new event cannot skip review", () => {
  it("is created pending regardless of what the payload claims", async () => {
    Events.create.mockImplementation((data) => data);

    await eventService.createEvent({
      title: "Backdoor",
      verificationStatus: "approved",
      verifiedBy: "someone",
    });

    // Forcing the field after the spread is the point. A payload value has to
    // lose, or a club could hand-roll a request that skips the gate entirely.
    expect(Events.create.mock.calls[0][0].verificationStatus).toBe("pending");
  });
});

describe("every public query requires an approved event", () => {
  const expectsApprovedFilter = () => {
    const filter = Events.find.mock.calls[0][0];
    expect(filter).toMatchObject({
      status: "published",
      verificationStatus: "approved",
    });
  };

  it("filters the full public list", async () => {
    await eventService.getAllEvents();
    expectsApprovedFilter();
  });

  it("filters the nearby search, including the no-index fallback", async () => {
    await eventService.getNearbyEvents(85.3, 27.7, 10, 50);
    expectsApprovedFilter();

    vi.clearAllMocks();
    Events.find.mockImplementation(() => makeQuery([]));

    // The fallback path is a separate query object, so it needs its own
    // assertion. It runs whenever the 2dsphere index is missing, which is
    // exactly the situation where nobody is looking.
    const { default: EventsModel } = await import("../src/models/Events.js");
    EventsModel.find.mockImplementationOnce(() => {
      throw new Error("unable to find index");
    });

    await eventService.getNearbyEvents(85.3, 27.7, 10, 50);
    expectsApprovedFilter();
  });

  it("filters recommendations", async () => {
    const { default: UserModel } = await import("../src/models/User.js");
    UserModel.findById.mockResolvedValue({ interestedSkills: [] });

    await eventService.getRecommendedEvents(validId);
    expectsApprovedFilter();
  });

  it("filters search results", async () => {
    await eventService.searchEvents({ q: "workshop", category: "Workshop" });
    expectsApprovedFilter();
  });
});

describe("the club still sees its own unapproved events", () => {
  it("does not filter the organiser's own event list", async () => {
    await eventService.getEventsByOrganizer(validId);

    // A club whose event is pending has to be able to find it, otherwise it
    // cannot edit or resubmit the thing that is being held up.
    expect(Events.find.mock.calls[0][0]).not.toHaveProperty("verificationStatus");
  });
});

describe("admin review list", () => {
  it("returns everything when no filter is given, including pending", async () => {
    await eventService.getAllEventsForAdmin();

    // The admin list must not carry the public filter, or there would be nothing
    // left to approve.
    expect(Events.find.mock.calls[0][0]).toEqual({});
  });

  it("narrows to the pending queue on request", async () => {
    await eventService.getAllEventsForAdmin({ verificationStatus: "pending" });

    expect(Events.find.mock.calls[0][0]).toEqual({ verificationStatus: "pending" });
  });

  it("treats an explicit all as no filter rather than the string 'all'", async () => {
    await eventService.getAllEventsForAdmin({ verificationStatus: "all" });

    expect(Events.find.mock.calls[0][0]).toEqual({});
  });

  it("records who decided and when", async () => {
    await eventService.setEventVerification(validId, "approved", {
      adminId: validId,
    });

    const update = Events.findByIdAndUpdate.mock.calls[0][1];
    expect(update.verificationStatus).toBe("approved");
    expect(update.verifiedBy).toBeDefined();
    expect(update.verifiedAt).toBeInstanceOf(Date);
  });

  it("leaves an existing review note alone when none is supplied", async () => {
    await eventService.setEventVerification(validId, "approved", {
      adminId: validId,
    });

    // Approving should not blank the note an admin left when rejecting earlier.
    expect(Events.findByIdAndUpdate.mock.calls[0][1]).not.toHaveProperty(
      "verificationNote",
    );
  });

  it("writes a note when one is supplied", async () => {
    await eventService.setEventVerification(validId, "rejected", {
      adminId: validId,
      note: "Poster is for a different event",
    });

    expect(Events.findByIdAndUpdate.mock.calls[0][1].verificationNote).toBe(
      "Poster is for a different event",
    );
  });
});