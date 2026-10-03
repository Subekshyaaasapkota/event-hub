import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import logger from "./middlewares/logger.js";
import connectDB from "./database.js";
import syncIndexes from "./scripts/syncIndexes.js";
import auth from "./routes/auth.js";
import events from "./routes/events.js";
import registrationRoute from "./routes/registration.js";
import clubs from "./routes/clubs.js";
import admin from "./routes/admin.js";
import payment from "./routes/payment.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

// Accept a comma separated list, e.g. FRONTEND_URL=http://localhost:5173,https://my.app
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
  origin(origin, callback) {
  // Allow same-origin/tooling requests that send no Origin header
  if (!origin || allowedOrigins.includes(origin)) {
  return callback(null, true);
  }
  return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
  }),
);

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(logger);

app.get("/", (req, res) => {
  res.json({ app: "EventHub API", version: "1.0.0", port: PORT });
});

/**
 * Lightweight health check - also reports whether the database is reachable.
 * Useful for verifying a fresh setup without needing a browser.
 */
app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = states[mongoose.connection.readyState] || "unknown";

  res.status(dbState === "connected" ? 200 : 503).json({
  status: dbState === "connected" ? "ok" : "degraded",
  database: dbState,
  uptime: Math.round(process.uptime()),
  });
});

app.use("/api/auth", auth);
app.use("/api/events", events);
app.use("/api/registrations", registrationRoute);
app.use("/api/clubs", clubs);
app.use("/api/admin", admin);
app.use("/api/payments", payment);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack || err.message);
  res.status(err.status || 500).json({
  error: err.message || "Internal server error",
  });
});

const start = async () => {
  // Connect before accepting traffic so a bad database never serves requests
  await connectDB();

  console.log(" Ensuring indexes...");
  await syncIndexes();

  const server = app.listen(PORT, () => {
  console.log(` EventHub API listening on http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  });

  const shutdown = (signal) => {
  console.log(`\n${signal} received - shutting down...`);
  server.close(async () => {
  await mongoose.connection.close().catch(() => {});
  process.exit(0);
  });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start();