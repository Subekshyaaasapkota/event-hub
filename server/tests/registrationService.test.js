import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Registration rules, exercised directly.
 *
 * These run against mocked models on purpose. The real MONGODB_URL points at
 * a live Atlas cluster, so a suite that hit the database would leave test rows
 * in a shared environment. The rules under test are pure branching, so mocking
 * the models is enough to prove each branch.
 */

const { Event, Registration } = vi.hoisted(() => ({
  Event: {
    findById: vi.fn(),
    // findOneAndUpdate is the seat claim. It resolves to an event when a seat
    // was taken and to null when the event was full, which is the whole point
    // of doing the check and the write in one operation.
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
  Registration: {
    findOne: vi.fn(),
    create: vi.fn(),
    // Used by the expired hold sweep.
    find: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock("../src/models/Events.js", () => ({ default: Event }));
vi.mock("../src/models/Registration.js", () => ({ default: Registration }));

const { default: registrationService } = await import(
  "../src/services/registrationService.js"
);

const FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const IN_THE_FUTURE = Date.now() + 20 * 60 * 1000;

const FORM = { name: "Asha Rai", email: "asha@example.com", phone: "9812345678" };

/** A published, bookable event with room left. Individual tests override one field. */
const buildEvent = (overrides = {}) => ({
  _id: "event1",
  status: "published",
  eventDate: FUTURE,
  deadline: FUTURE,
  participantCount: 10,
  currentParticipants: 2,
  isPaid: false,
  price: 0,
  ...overrides,
});

const UID = "user1";

/** No expired holds, which is the normal case. */
const noExpiredHolds = () =>
  Registration.find.mockReturnValue({
    select: () => ({ lean: async () => [] }),
  });

beforeEach(() => {
  vi.clearAllMocks();

  Event.findByIdAndUpdate.mockResolvedValue({});
  // Default: the conditional update matched, so a seat was available.
  Event.findOneAndUpdate.mockResolvedValue({ _id: "event1" });

  Registration.findOne.mockResolvedValue(null);
  Registration.create.mockImplementation(async (doc) => ({ _id: "reg1", ...doc }));
  Registration.updateMany.mockResolvedValue({ modifiedCount: 0 });

  noExpiredHolds();
});

describe("event must be registerable", () => {
  it("rejects an event that does not exist", async () => {
    Event.findById.mockResolvedValue(null);
    const res = await registrationService.registerForEvent("event1", UID, FORM);
    expect(res.status).toBe(404);
    expect(Registration.create).not.toHaveBeenCalled();
  });

  it("rejects a draft event", async () => {
    Event.findById.mockResolvedValue(buildEvent({ status: "draft" }));
    const res = await registrationService.registerForEvent("event1", UID, FORM);
    expect(res.status).toBe(409);
    expect(res.data.error).toMatch(/not open for registration/i);
  });

  it("names cancellation specifically", async () => {
    Event.findById.mockResolvedValue(buildEvent({ status: "cancelled" }));
    const res = await registrationService.registerForEvent("event1", UID, FORM);
    expect(res.status).toBe(409);
    expect(res.data.error).toMatch(/cancelled/i);
  });

  it("rejects an event that has already started", async () => {
    Event.findById.mockResolvedValue(buildEvent({ eventDate: PAST }));
    const res = await registrationService.registerForEvent("event1", UID, FORM);
    expect(res.status).toBe(409);
    expect(res.data.error).toMatch(/already started/i);
  });

  it("rejects a passed deadline", async () => {
    Event.findById.mockResolvedValue(buildEvent({ deadline: PAST }));
    const res = await registrationService.registerForEvent("event1", UID, FORM);
    expect(res.status).toBe(409);
    expect(res.data.error).toMatch(/deadline/i);
  });

  it("rejects an event whose last seat has gone", async () => {
    Event.findById.mockResolvedValue(
      buildEvent({ participantCount: 10, currentParticipants: 9 }),
    );
    // The conditional update matched nothing, which is how MongoDB says the
    // ceiling was already reached.
    Event.findOneAndUpdate.mockResolvedValue(null);

    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(409);
    expect(res.data.error).toMatch(/full/i);
    expect(Registration.create).not.toHaveBeenCalled();
  });
});

describe("claiming a seat", () => {
  it("makes the capacity test and the increment a single operation", async () => {
    // This is the fix for the last seat being oversold. An $expr ceiling inside
    // the update means MongoDB evaluates "is there room" and takes the seat in
    // one atomic step, so two people cannot both read nine of ten and both
    // write. A read followed by a write could not offer that guarantee.
    Event.findById.mockResolvedValue(buildEvent());
    await registrationService.registerForEvent("event1", UID, FORM);

    expect(Event.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: "event1",
        $expr: { $lt: ["$currentParticipants", "$participantCount"] },
      },
      { $inc: { currentParticipants: 1 } },
      { new: true },
    );
  });

  it("reads no ceiling when capacity is zero, which means unlimited", async () => {
    Event.findById.mockResolvedValue(
      buildEvent({ participantCount: 0, currentParticipants: 500 }),
    );
    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(201);
    const [filter] = Event.findOneAndUpdate.mock.calls[0];
    expect(filter).not.toHaveProperty("$expr");
  });

  it("gives the seat back when the registration row cannot be saved", async () => {
    // Otherwise one failed write quietly shrinks the event by a place, and the
    // room never comes back.
    Event.findById.mockResolvedValue(buildEvent());
    Registration.create.mockRejectedValue(new Error("disk full"));

    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(500);
    expect(Event.findByIdAndUpdate).toHaveBeenCalledWith("event1", {
      $inc: { currentParticipants: -1 },
    });
  });

  it("reports a lost unique index race as already registered", async () => {
    Event.findById.mockResolvedValue(buildEvent());
    Registration.create.mockRejectedValue(
      Object.assign(new Error("E11000 duplicate key"), { code: 11000 }),
    );
    // First lookup finds nothing, so the service attempts a create. The second
    // lookup is the recovery read after the index rejects it.
    Registration.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: "reg1" });

    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(409);
    expect(res.data.error).toMatch(/already registered/i);
    expect(res.data.registration._id).toBe("reg1");
    // The seat taken before the failed create has to go back, otherwise the
    // winner of the race ends up with one seat and two counters.
    expect(Event.findByIdAndUpdate).toHaveBeenCalledWith("event1", {
      $inc: { currentParticipants: -1 },
    });
  });
});

describe("free events", () => {
  it("confirms immediately and keeps the seat", async () => {
    Event.findById.mockResolvedValue(buildEvent());
    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(201);
    expect(res.data.registration.status).toBe("Confirmed");
    expect(Registration.create).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "event1",
        user: UID,
        status: "Confirmed",
        // A free event never holds a seat, so it never carries a deadline.
        holdExpiresAt: null,
      }),
    );
  });
});

describe("paid events hold a seat while payment is in flight", () => {
  const paid = () => buildEvent({ isPaid: true, price: 500 });

  it("takes the seat at registration instead of waiting for the payment", async () => {
    // Previously the seat was only counted on confirmation, so the capacity
    // check compared against a counter that had not moved and waved through
    // every pending checkout. A ten seat event sold ten paid seats and no
    // more, but nothing stopped the eleventh person from reaching the payment
    // page as well.
    Event.findById.mockResolvedValue(paid());
    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(201);
    expect(res.data.registration.status).toBe("Pending");
    expect(Event.findOneAndUpdate).toHaveBeenCalled();
  });

  it("sets a deadline for the hold and records the amount owed", async () => {
    Event.findById.mockResolvedValue(paid());
    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.data.registration.paymentService).toBe("Khalti");
    expect(res.data.registration.paymentInfo.amount).toBe(500);

    // Somewhere around half an hour out, which is long enough to finish a
    // checkout and short enough that an abandoned one does not hold a place
    // on a small event for long.
    const minutesOut =
      (res.data.registration.holdExpiresAt.getTime() - Date.now()) / 60000;
    expect(minutesOut).toBeGreaterThan(29);
    expect(minutesOut).toBeLessThan(31);
  });

  it("refuses a second checkout once the paid event is full", async () => {
    Event.findById.mockResolvedValue(paid());
    Event.findOneAndUpdate.mockResolvedValue(null);

    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(409);
    expect(res.data.error).toMatch(/full/i);
    expect(Registration.create).not.toHaveBeenCalled();
  });

  it("extends an existing hold on retry rather than taking a second seat", async () => {
    Event.findById.mockResolvedValue(paid());
    const save = vi.fn();
    Registration.findOne.mockResolvedValue({
      status: "Pending",
      holdExpiresAt: new Date(IN_THE_FUTURE),
      paymentInfo: { amount: 500 },
      save,
    });

    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalled();
    // Already holding one, so claiming again would cost the event a place.
    expect(Event.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("takes a fresh seat when the previous row had given its seat back", async () => {
    Event.findById.mockResolvedValue(paid());
    Registration.findOne.mockResolvedValue({
      status: "Cancelled",
      holdExpiresAt: null,
      paymentInfo: null,
      save: vi.fn(),
    });

    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(200);
    expect(Event.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });
});

describe("one seat per person", () => {
  it("rejects a second confirmed registration", async () => {
    Event.findById.mockResolvedValue(buildEvent());
    Registration.findOne.mockResolvedValue({ status: "Confirmed", save: vi.fn() });

    const res = await registrationService.registerForEvent("event1", UID, FORM);

    expect(res.status).toBe(409);
    expect(res.data.error).toMatch(/already registered/i);
    // Nothing to claim, so nothing was taken.
    expect(Event.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

describe("abandoned checkouts give their seat back", () => {
  it("releases holds whose deadline has passed", async () => {
    // Without this, someone who closes the payment tab would hold a place on a
    // small event forever, quietly shrinking it to nobody.
    Event.findById.mockResolvedValue(buildEvent({ isPaid: true, price: 500 }));
    Registration.find.mockReturnValue({
      select: () => ({ lean: async () => [{ _id: "stale1" }, { _id: "stale2" }] }),
    });
    Registration.updateMany.mockResolvedValue({ modifiedCount: 2 });

    await registrationService.registerForEvent("event1", UID, FORM);

    expect(Registration.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ["stale1", "stale2"] }, status: "Pending" },
      { $set: { status: "Cancelled", holdExpiresAt: null } },
    );
    expect(Event.findByIdAndUpdate).toHaveBeenCalledWith("event1", {
      $inc: { currentParticipants: -2 },
    });
  });

  it("only asks for holds that are pending and past their deadline", async () => {
    Event.findById.mockResolvedValue(buildEvent());
    await registrationService.registerForEvent("event1", UID, FORM);

    const [filter] = Registration.find.mock.calls[0];
    expect(filter.status).toBe("Pending");
    // $ne null keeps confirmed seats and every free event out of the sweep.
    expect(filter.holdExpiresAt.$ne).toBeNull();
    expect(filter.holdExpiresAt.$lt).toBeInstanceOf(Date);
  });

  it("does not hand back a seat for a hold that was paid while the sweep ran", async () => {
    Event.findById.mockResolvedValue(buildEvent({ isPaid: true, price: 500 }));
    Registration.find.mockReturnValue({
      select: () => ({ lean: async () => [{ _id: "raced" }] }),
    });
    // The person paid between the read and the write, so the guarded update
    // matched nothing and their seat must stand.
    Registration.updateMany.mockResolvedValue({ modifiedCount: 0 });

    await registrationService.registerForEvent("event1", UID, FORM);

    expect(Event.findByIdAndUpdate).not.toHaveBeenCalledWith("event1", {
      $inc: { currentParticipants: -1 },
    });
  });

  it("skips the seat bookkeeping entirely when nothing expired", async () => {
    Event.findById.mockResolvedValue(buildEvent());
    await registrationService.registerForEvent("event1", UID, FORM);

    expect(Registration.updateMany).not.toHaveBeenCalled();
    expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});

describe("form fields reach the service intact", () => {
  it("stores what the controller allowed through", async () => {
    Event.findById.mockResolvedValue(buildEvent());
    await registrationService.registerForEvent("event1", UID, FORM);

    expect(Registration.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Asha Rai",
        email: "asha@example.com",
        phone: "9812345678",
      }),
    );
  });
});
