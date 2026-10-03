import jwt from "jsonwebtoken";

function auth(req, res, next) {
  const authHeader = req.headers?.authorization;
  let authToken;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    authToken = authHeader.split(" ")[1];
  } else if (req.cookies?.authToken) {
  authToken = req.cookies.authToken;
  } else if (req.headers.cookie) {
  // Fallback when cookie-parser middleware is unavailable
  const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
  const [key, ...rest] = cookie.trim().split("=");
  acc[key] = rest.join("=");
  return acc;
  }, {});
  authToken = cookies.authToken;
  }

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

export default auth;