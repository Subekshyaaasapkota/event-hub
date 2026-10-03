import { sendContactMessage } from "../utils/emailService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Anything longer than this is almost certainly abuse, not a support request.
const LIMITS = { name: 120, email: 200, subject: 150, message: 4000 };
const MIN_MESSAGE_LENGTH = 10;

/**
 * POST /api/contact
 *
 * Backs the public contact form. Rate limited per IP so the form cannot be used
 * to mail-bomb the owner's inbox.
 */
const rateLimit = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const isRateLimited = (ip) => {
  const now = Date.now();
  const hits = (rateLimit.get(ip) || []).filter((t) => now - t < WINDOW_MS);

  if (hits.length >= MAX_PER_WINDOW) {
    rateLimit.set(ip, hits);
    return true;
  }

  hits.push(now);
  rateLimit.set(ip, hits);
  return false;
};

// Keep the map from growing without bound on a long running process.
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [ip, hits] of rateLimit) {
    const kept = hits.filter((t) => t > cutoff);
    if (kept.length === 0) rateLimit.delete(ip);
    else rateLimit.set(ip, kept);
  }
}, WINDOW_MS).unref();

const submitContactMessage = async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim();
  const subject = String(req.body?.subject ?? "").trim() || "No subject";
  const message = String(req.body?.message ?? "").trim();

  const problems = [];
  if (!name) problems.push("name is required");
  if (name.length > LIMITS.name) problems.push("name is too long");
  if (!email) problems.push("email is required");
  else if (!EMAIL_REGEX.test(email)) problems.push("email is not valid");
  else if (email.length > LIMITS.email) problems.push("email is too long");
  if (!message) problems.push("message is required");
  else if (message.length < MIN_MESSAGE_LENGTH)
    problems.push("message is too short");
  else if (message.length > LIMITS.message)
    problems.push("message is too long");
  if (subject.length > LIMITS.subject) problems.push("subject is too long");

  if (problems.length) {
    return res.status(422).json({ error: `Invalid: ${problems.join(", ")}` });
  }

  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "You have sent several messages already. Please try again later.",
    });
  }

  const result = await sendContactMessage({ name, email, subject, message });

  if (result.success) {
    return res.status(200).json({ message: "Thanks, we will get back to you." });
  }

  // The visitor did nothing wrong, so do not blame them for our mail config.
  console.error("Contact form delivery failed:", result.error);
  return res.status(503).json({
    error:
      "Messaging is temporarily unavailable. Please email us directly instead.",
  });
};

export { submitContactMessage };
