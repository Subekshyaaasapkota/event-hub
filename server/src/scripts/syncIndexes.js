/**
 * Makes sure every declared Mongo index actually exists.
 *
 * Mongoose only tries to build indexes once per process. If that attempt fails,
 * for example because the Atlas cluster was paused and unreachable at boot,
 * mongoose caches the rejection and never retries. The result is a collection
 * missing indexes it declares in the schema, and queries that suddenly fail at
 * runtime with errors like "unable to find index for $geoNear query".
 *
 * createIndexes() only adds what is missing, it never drops anything, so it is
 * safe to call on every boot. Failures are logged instead of thrown, because a
 * missing secondary index should not stop the server from serving traffic.
 */

import User from "../models/User.js";
import RegisterClub from "../models/RegisterClub.js";
import Events from "../models/Events.js";
import Registration from "../models/Registration.js";

const MODELS = [
  ["User", User],
  ["RegisterClub", RegisterClub],
  ["Event", Events],
  ["Registration", Registration],
];

const syncIndexes = async () => {
  const results = [];

  for (const [name, model] of MODELS) {
    try {
      await model.createIndexes();
      results.push({ name, ok: true, count: model.schema.indexes().length });
    } catch (error) {
      results.push({ name, ok: false, error: error.message });
    }
  }

  const failed = results.filter((r) => !r.ok);

  for (const r of results) {
    if (r.ok) {
      console.log(`  ${r.name}: ${r.count} index(es) ready`);
    } else {
      console.error(`  ${r.name}: index creation FAILED - ${r.error}`);
    }
  }

  if (failed.length) {
    console.warn(
      `  ${failed.length} model(s) have incomplete indexes, some queries may be slow or fail`,
    );
  }

  return { ok: failed.length === 0, failed: failed.map((f) => f.name) };
};

export default syncIndexes;
