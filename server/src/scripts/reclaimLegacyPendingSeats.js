// scripts/reclaimLegacyPendingSeats.js
//
// A Pending registration from before seat holds existed never expires. Holds
// arrived with payment and set holdExpiresAt, and sweepExpiredHolds only
// reclaims rows where that deadline is set and in the past:
//
//   holdExpiresAt: { $ne: null, $lt: new Date() }
//
// A legacy row has no deadline at all, so it fails that filter forever. It stays
// Pending and its seat stays counted against currentParticipants for good. An
// event can sit permanently full of seats held by people who abandoned the
// payment page before holds were introduced.
//
// Why this is a script and not an automatic sweep. Whether these rows should be
// cancelled is a judgement about real data that the code cannot make. Some may
// belong to somebody who did pay, through a path that failed to record it, and
// cancelling one of those releases a seat and loses a real registration. So
// nothing happens on its own: this prints what it would do, and only writes when
// explicitly told to.
//
// What makes a row safe to reclaim. All four conditions, not one of them:
//
//   status Pending              it is still holding a seat
//   holdExpiresAt null          legacy, so there is no deadline to wait for
//   paymentService "None"       no payment was ever started through a gateway
//   no paymentInfo              ...and nothing was recorded on the row either
//
// The last two together are the important ones: they are what distinguishes
// "walked away from the payment page" from "paid and we lost the record". A row
// with a transaction id is left alone whatever else it looks like, because
// reclaiming it could hand a paid seat to somebody else.
//
// The age cutoff exists for the same reason. Someone mid-payment right now also
// matches every condition above, so anything younger than the cutoff is skipped.
//
// Usage. Dry run is the default and writes nothing:
//
//   node src/scripts/reclaimLegacyPendingSeats.js
//   node src/scripts/reclaimLegacyPendingSeats.js --apply
//   node src/scripts/reclaimLegacyPendingSeats.js --apply --older-than-hours 48
//
// Read the dry-run output before using --apply. It lists every row it will touch.

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../database.js";
import Event from "../models/Events.js";
import Registration from "../models/Registration.js";

dotenv.config();

const HOURS = Number(
  process.argv.find((a) => a.startsWith("--older-than-hours="))?.split("=")[1] ??
    // --older-than-hours 48 is also accepted, as two arguments.
    (() => {
      const i = process.argv.indexOf("--older-than-hours");
      return i !== -1 ? process.argv[i + 1] : undefined;
    })() ?? 24,
);

const apply = process.argv.includes("--apply");

/**
 * The rows that are safe to reclaim: pending, no deadline to wait for, and no
 * trace of a payment on either side of the ledger.
 */
const reclaimable = () => ({
  status: "Pending",
  holdExpiresAt: null,
  paymentService: "None",
  $and: [
    { $or: [{ paymentInfo: { $exists: false } }, { paymentInfo: null }] },
    {
      $or: [
        { "paymentInfo.amount": { $exists: false } },
        { "paymentInfo.amount": null },
      ],
    },
    { "paymentInfo.transactionId": { $exists: false } },
    { "paymentInfo.pidx": { $exists: false } },
    { "paymentInfo.paymentDate": { $exists: false } },
  ],
  createdAt: { $lt: new Date(Date.now() - HOURS * 60 * 60 * 1000) },
});

const run = async () => {
  // Reuses the app's own connectDB so the dbName and the failure hints match,
  // rather than a second connection path that can drift from it.
  await connectDB();

  const filter = reclaimable();
  const rows = await Registration.find(filter)
    .select("_id event user paymentService paymentInfo createdAt")
    .populate("event", "title")
    .populate("user", "name email")
    .lean();

  console.log(`\nLegacy Pending registrations older than ${HOURS}h`);
  console.log(`Safe to reclaim: ${rows.length}\n`);

  // Grouped by event, because the seat counter is per event and that is how an
  // operator will want to sanity check the list.
  const byEvent = new Map();
  for (const row of rows) {
    const key = String(row.event?._id ?? "unknown event");
    if (!byEvent.has(key)) byEvent.set(key, { title: row.event?.title, rows: [] });
    byEvent.get(key).rows.push(row);
  }

  for (const [eventId, group] of byEvent) {
    console.log(`  ${eventId}  ${group.title ?? "(event deleted)"}`);
    for (const row of group.rows) {
      console.log(
        `    ${row._id}  ${row.user?.name ?? "?"} <${row.user?.email ?? "?"}>  ${new Date(row.createdAt).toISOString()}`,
      );
    }
  }

  const totalSeats = rows.length;
  console.log(`\nSeats that would be returned to ${byEvent.size} event(s): ${totalSeats}`);

  if (!apply) {
    console.log("\nDry run. Nothing was written. Pass --apply to do it.");
    await mongoose.disconnect();
    return;
  }

  if (rows.length === 0) {
    console.log("\nNothing to do.");
    await mongoose.disconnect();
    return;
  }

  const ids = rows.map((row) => row._id);

  // Per event, so currentParticipants cannot go negative on an event that only
  // had some of its holds reclaimed, and so a partial failure cannot corrupt a
  // count for an event this run never touched.
  let reclaimed = 0;
  for (const [eventId] of byEvent) {
    const ofEvent = rows.filter((row) => String(row.event?._id) === eventId).map((r) => r._id);
    const result = await Registration.updateMany(
      { _id: { $in: ofEvent }, status: "Pending" },
      { $set: { status: "Cancelled", holdExpiresAt: null } },
    );
    if (result.modifiedCount > 0) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { currentParticipants: -result.modifiedCount },
      });
      reclaimed += result.modifiedCount;
    }
  }

  console.log(`\nReclaimed ${reclaimed} seat(s) across ${byEvent.size} event(s).`);
  console.log(`Ids: ${ids.join(", ")}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});