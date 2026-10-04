import jwt from "jsonwebtoken";

function readToken(req) {
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  if (req.cookies?.authToken) {
    return req.cookies.authToken;
  }
  if (req.headers.cookie) {
    // Fallback when cookie-parser middleware is unavailable
    const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
      const [key, ...rest] = cookie.trim().split("=");
      acc[key] = rest.join("=");
      return acc;
    }, {});
    return cookies.authToken;
  }
  return undefined;
}

function auth(req, res, next) {
  const authToken = readToken(req);

  if (!authToken || authToken === "undefined" || authToken === "null") {
    return res.status(401).json({ error: "Unauthorized: no token provided" });
  }

  if (!process.env.JWT_SECRET) {
    console.error(" JWT_SECRET is missing from the server .env file.");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    req.user = jwt.verify(authToken, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: invalid or expired token" });
  }
}

/**
 * Attaches req.user when a usable token is present and stays out of the way
 * when there is not one. Use this on endpoints that are public by default but
 * need to recognise the caller in order to decide what they may see.
 *
 * A missing or invalid token is deliberately not an error here. Rejecting it
 * would break anonymous access to the public part of the route, which is the
 * opposite of what a pass-through middleware is for.
 */
function optionalAuth(req, res, next) {
  const authToken = readToken(req);

  if (authToken && authToken !== "undefined" && authToken !== "null" && process.env.JWT_SECRET) {
    try {
      req.user = jwt.verify(authToken, process.env.JWT_SECRET);
    } catch (error) {
      // Expired or tampered token on a public route: carry on anonymously.
      req.user = undefined;
    }
  }

  next();
}

export default auth;
export { optionalAuth };