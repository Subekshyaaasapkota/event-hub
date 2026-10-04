import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Controller level checks for the registration endpoint.
 *
 * The service is mocked so these tests are about the controller's own duties:
 * checking what arrived, refusing to let a registrant control privileged
 * fields, and turning a bad event id into a 400 rather than a 500.
 */

const { registrationService, Events } = vi.hoisted(() => ({
  registrationService: {
    registerForEvent: vi.fn(),
    getEventRegistrations: vi.fn(),
  },
  Events: { findById: vi.fn() },
}));

vi.mock("../src/services/registrationService.js", () => ({
  default: registrationService,
}));
vi.mock("../src/models/Events.js", () => ({ default: Events }));

const { registerForEvent, getEventRegistrations } = await import(
  "../src/controllers/registrationController.js"
);

const mockRes = () => {
  const res = { statusCode: null, body: null };
  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload) => {
    res.body = payload;
    return res;
  });
  return res;
};

const VALID = {
  name: "Asha Rai",
  email: "asha@example.com",
  phone: "9812345678",
};

/** Build a request, merging overrides into an otherwise valid body. */
const buildReq = (overrides = {}, bodyOverrides = {}) => ({
  params: { eventId: "event1" },
  user: { id: "user1" },
  body: { ...VALID, ...bodyOverrides, ...overrides },
});

/** The formData the service was handed. */
const sentForm = () => registrationService.registerForEvent.mock.calls[0][2];

beforeEach(() => {
  vi.clearAllMocks();
  registrationService.registerForEvent.mockResolvedValue({
    status: 201,
    data: { message: "ok" },
  });
});

describe("required fields", () => {
  it("accepts a complete form", async () => {
    const res = mockRes();
    await registerForEvent(buildReq(), res);

    expect(res.statusCode).toBe(201);
    expect(sentForm()).toEqual(VALID);
  });

  it("insists on a name", async () => {
    const res = mockRes();
    await registerForEvent(buildReq({}, { name: "" }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.name).toMatch(/full name/i);
    expect(registrationService.registerForEvent).not.toHaveBeenCalled();
  });

  it("treats a name of only spaces as missing", async () => {
    const res = mockRes();
    await registerForEvent(buildReq({}, { name: "   " }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.name).toBeDefined();
  });

  it("rejects a name of one character", async () => {
    const res = mockRes();
    await registerForEvent(buildReq({}, { name: "A" }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.name).toMatch(/too short/i);
  });

  it("insists on an email", async () => {
    // The form used to let this through. With nothing to contact the organiser
    // with, a saved registration was close to useless.
    const res = mockRes();
    await registerForEvent(buildReq({}, { email: "" }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.email).toMatch(/email address/i);
  });

  it("insists on a phone number", async () => {
    const res = mockRes();
    await registerForEvent(buildReq({}, { phone: "" }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.phone).toMatch(/phone number/i);
  });

  it("rejects an email that is not an email", async () => {
    const res = mockRes();
    await registerForEvent(buildReq({}, { email: "not-an-email" }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.email).toMatch(/email address/i);
  });

  it("rejects a phone number made of letters", async () => {
    const res = mockRes();
    await registerForEvent(buildReq({}, { phone: "abc" }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.phone).toMatch(/digits/i);
  });

  it("rejects an entirely empty body", async () => {
    // This is the case that used to create a confirmed registration carrying
    // no name, no phone and no email at all.
    const res = mockRes();
    await registerForEvent(
      { params: { eventId: "event1" }, user: { id: "user1" }, body: {} },
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(Object.keys(res.body.errors).sort()).toEqual(["email", "name", "phone"]);
    expect(registrationService.registerForEvent).not.toHaveBeenCalled();
  });

  it("reports every problem at once rather than one at a time", async () => {
    const res = mockRes();
    await registerForEvent(
      { params: { eventId: "event1" }, user: { id: "user1" }, body: { college: "TU" } },
      res,
    );

    expect(Object.keys(res.body.errors).sort()).toEqual(["email", "name", "phone"]);
  });

  it("refuses to guess when a field arrives as something other than text", async () => {
    const res = mockRes();
    await registerForEvent(
      buildReq({}, { name: { first: "Asha" }, phone: 9812345678 }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.name).toBeDefined();
    expect(res.body.errors.phone).toBeDefined();
  });

  it("caps the length of every field it stores", async () => {
    const res = mockRes();
    await registerForEvent(
      buildReq({}, { remarks: "x".repeat(501), name: "y".repeat(81) }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.remarks).toMatch(/500 characters/i);
    expect(res.body.errors.name).toMatch(/80 characters or fewer/i);
  });
});

describe("phone numbers people can actually be reached on", () => {
  it.each([
    ["a plain mobile number", "9812345678"],
    ["a number with the country code", "+9779812345678"],
    ["a number written with spaces", "981 234 5678"],
    ["a number with dashes", "981-234-5678"],
    ["a landline with brackets", "(01) 2345678"],
  ])("accepts %s", async (_label, phone) => {
    const res = mockRes();
    await registerForEvent(buildReq({}, { phone }), res);

    expect(res.statusCode).toBe(201);
    expect(sentForm().phone).toBe(phone);
  });
});

describe("fields a registrant may set", () => {
  it("keeps the five intended fields", async () => {
    await registerForEvent(
      buildReq(
        {},
        { college: "Tribhuvan University", remarks: "Vegetarian" },
      ),
      mockRes(),
    );

    expect(sentForm()).toEqual({
      ...VALID,
      college: "Tribhuvan University",
      remarks: "Vegetarian",
    });
  });

  it("drops privileged fields so a registrant cannot award themselves a seat", async () => {
    await registerForEvent(
      buildReq({
        // None of these belong to the person filling in the form.
        status: "Confirmed",
        user: "someone-else",
        event: "another-event",
        paymentService: "None",
        paymentInfo: { amount: 0, transactionId: "forged" },
        holdExpiresAt: new Date("2099-01-01"),
      }),
      mockRes(),
    );

    expect(sentForm()).toEqual(VALID);
    expect(sentForm()).not.toHaveProperty("status");
    expect(sentForm()).not.toHaveProperty("user");
    expect(sentForm()).not.toHaveProperty("paymentInfo");
    // A hold deadline is set by the service, never by the person registering.
    expect(sentForm()).not.toHaveProperty("holdExpiresAt");
  });

  it("trims values and discards blank ones", async () => {
    await registerForEvent(
      buildReq({}, { name: "  Asha Rai  ", email: " asha@example.com " }),
      mockRes(),
    );

    expect(sentForm()).toEqual(VALID);
  });
});

describe("failure handling", () => {
  it("returns 400 for a malformed event id", async () => {
    registrationService.registerForEvent.mockRejectedValue(
      Object.assign(new Error("Cast to ObjectId failed"), { name: "CastError" }),
    );
    const res = mockRes();
    await registerForEvent(buildReq({}, {}), res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid event id/i);
  });

  it("returns 500 without leaking the raw error when the service breaks", async () => {
    registrationService.registerForEvent.mockRejectedValue(
      new Error("connection to replica set timed out at 10.0.4.19:27017"),
    );
    const res = mockRes();
    await registerForEvent(buildReq(), res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/could not complete/i);
    expect(JSON.stringify(res.body)).not.toMatch(/10\.0\.4\.19/);
  });

  it("passes the service status through, so 409 conflicts reach the client", async () => {
    registrationService.registerForEvent.mockResolvedValue({
      status: 409,
      data: { error: "This event is already full" },
    });
    const res = mockRes();
    await registerForEvent(buildReq(), res);

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already full/i);
  });
});

describe("reading an event roster", () => {
  it("lets an admin read any roster", async () => {
    registrationService.getEventRegistrations.mockResolvedValue({
      status: 200,
      data: [],
    });
    const res = mockRes();
    await getEventRegistrations(
      { params: { eventId: "event1" }, user: { id: "admin1", roles: ["Admin"] } },
      res,
    );

    expect(Events.findById).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  it("denies a club reading another club roster", async () => {
    Events.findById.mockReturnValue({
      select: () => Promise.resolve({ createdBy: "someoneElse" }),
    });
    const res = mockRes();
    await getEventRegistrations(
      { params: { eventId: "event1" }, user: { id: "user1", roles: ["Club"] } },
      res,
    );

    expect(res.statusCode).toBe(403);
    expect(registrationService.getEventRegistrations).not.toHaveBeenCalled();
  });

  it("denies a club reading a roster for an event with no owner", async () => {
    Events.findById.mockReturnValue({
      select: () => Promise.resolve({ createdBy: null }),
    });
    const res = mockRes();
    await getEventRegistrations(
      { params: { eventId: "event1" }, user: { id: "user1", roles: ["Club"] } },
      res,
    );

    expect(res.statusCode).toBe(403);
  });
});
