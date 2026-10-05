// scripts/backfillEventVerification.js
//
// Events used to go public the moment they were created. They now start life as
// verificationStatus "pending" and only an admin can approve them. Every event
// that already exists in the database predates that field, so it has no
// verificationStatus at all and would fall over to the schema default of
// "pending" the moment the public queries started filtering on approval.
//
// The result of running this without it: every currently-visible event silently
// vanishes from the public site. That is why this is not optional to run before
// deploying the filter.
//
// Only `published` events are backfilled to "approved". That is exactly the set
// that was publicly visible before the gate existed, so it is exactly the set
// whose disappearance would be a regression. Draft, cancelled and completed
// events were never on the public list, so leaving them "pending" changes
// nothing an end user can see, and leaving them is the conservative choice: a
// human can decide about those later.
//
// This is safe to re-run. It only matches events that still have no
// verificationStatus, so a second run reports 0 and writes nothing.
//
// Usage. Dry run is the default and writes nothing:
//
//   node src/scripts/backfillEventVerification.js
//   node src/scripts/backfillEventVerification.js --apply

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../database.js";
import Event from "../models/Events.js";

dotenv.config();

const APPLY = process.argv.includes("--apply");

const run = async () => {
  await connectDB();

  //  Reads every event and groups it, rather than asking Mongo for counts per
  //  status. One pass over the collection is cheaper than four count queries and
  //  it can print a sample of what it is about to touch.
  const events = await Event.find(
    { verificationStatus: { $exists: false } },
    { status: 1, title: 1, verificationStatus: 1 },
  ).lean();

  console.log(
    `\nEvents with no verificationStatus: ${events.length}\n`,
  );

  const byStatus = events.reduce((acc, event) => {
    const key = event.status || "(missing status)";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`  ${status.padEnd(12)} ${count}`);
  }

  //  Only the published ones were publicly reachable, so only those are restored.
  const toApprove = events.filter((event) => event.status === "published");

  console.log(
    `\nWill set verificationStatus "approved" on ${toApprove.length} published event(s).`,
  );
  console.log(
    `Leaving ${events.length - toApprove.length} non-published event(s) as pending.`,
  );

  for (const event of toApprove.slice(0, 10)) {
    console.log(`    ${event.title}`);
  }
  if (toApprove.length > 10) {
    console.log(`    ...and ${toApprove.length - 10} more`);
  }

  if (!toApprove.length) {
    console.log("\nNothing to do.\n");
    return;
  }

  if (!APPLY) {
    console.log(
      "\nDry run. Nothing was written. Re-run with --apply to make these changes.\n",
    );
    return;
  }

  const result = await Event.updateMany(
    { _id: { $in: toApprove.map((event) => event._id) } },
    { $set: { verificationStatus: "approved" } },
  );

  console.log(`\nApplied. ${result.modifiedCount} event(s) updated.\n`);
};

run()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });