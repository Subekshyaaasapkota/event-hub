import mongoose from "mongoose";

/**
 * True when the value can address a MongoDB document.
 *
 * A malformed id can never identify a resource, so callers should treat it the
 * same as "does not exist" rather than letting the driver throw a CastError
 * and surfacing a 500 for what is really a bad request.
 */
export const isValidObjectId = (value) =>
mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === String(value);

/**
 * Standard error payload for a request that referenced an id we cannot resolve.
 * Returns true when the response was sent, so callers can `return` on it.
 */
export const sendInvalidId = (res, { what = "record", id, param = "id" } = {}) => {
if (res.headersSent) return true;

if (!isValidObjectId(id)) {
res.status(404).json({ error: `No ${what} found with ${param} "${id}"` });
return true;
}

return false;
};
