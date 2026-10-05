/**
 * An error that carries the HTTP status it should be reported as.
 *
 * Services throw plain Errors, which lose the difference between "you asked for
 * something impossible" and "the database is down". Controllers were left
 * guessing, and the guess was made by matching on substrings of the message
 * text: if a message is reworded, or a new refusal is added, the check silently
 * stops matching and the user gets a 500 for a deliberate refusal.
 *
 * app.js already returns err.status for anything that reaches the global
 * handler, so attaching the status here is all that is needed.
 *
 * message stays a plain sentence aimed at whoever reads it in the console, so
 * these can still be displayed directly.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const badRequest = (message) => new HttpError(400, message);
export const notFound = (message) => new HttpError(404, message);

/**
 * 409, for a request that was understood and deliberately refused. The client
 * shows these as a reason and what to do about it, rather than as a failure.
 */
export const conflict = (message) => new HttpError(409, message);