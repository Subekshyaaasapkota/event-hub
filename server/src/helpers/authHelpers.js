import jwt from "jsonwebtoken";

function createAuthToken(data) {
  const token = jwt.sign(data, process.env.JWT_SECRET, {
  expiresIn: 86400, //Expire the login in 1 day(24hr)
  });
  return token;
}
export { createAuthToken };
