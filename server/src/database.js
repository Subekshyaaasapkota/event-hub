import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGODB_URL;

const DB_NAME = process.env.MONGODB_DB_NAME || "event_hub_portal";

const connectDB = async () => {
  if (!url) {
  console.error(
  "\n MONGODB_URL is not defined.\n" +
  "  Copy server/.env.example to server/.env and fill in your connection string.\n",
  );
  process.exit(1);
  }

  try {
  await mongoose.connect(url, {
  dbName: DB_NAME,
  serverSelectionTimeoutMS: 10000,
  });

  console.log(` MongoDB connected (database: ${DB_NAME})`);
  return mongoose.connection;
  } catch (error) {
  console.error("\n Could not connect to MongoDB.\n");
  console.error(`  Reason: ${error.message}\n`);

  if (error.name === "MongoServerSelectionError" && /ENOTFOUND|EAI_AGAIN/.test(error.message)) {
  console.error("  Hint: your computer could not resolve the MongoDB host name.");
  console.error("  Check your internet connection, or point MONGODB_URL at a local");
  console.error("  MongoDB instance, for example: mongodb://127.0.0.1:27017\n");
  } else if (/Authentication failed/.test(error.message)) {
  console.error("  Hint: the username/password inside MONGODB_URL are not valid.\n");
  }

  process.exit(1);
  }
};

export default connectDB;