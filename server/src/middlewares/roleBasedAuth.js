/**
 * Authorization middleware.
 *
 * Accepts a single role or a list of roles:
 *  roleBasedAuth("Admin")
 *  roleBasedAuth("Club", "Admin")
 *  roleBasedAuth(["Club", "Admin"])
 *
 * Users must hold at least one of the listed roles.
 */
function roleBasedAuth(...roles) {
  const allowedRoles = roles.flat().filter(Boolean);

  if (allowedRoles.length === 0) {
  console.error(
  "  roleBasedAuth was called without a role - denying by default.",
  );
  }

  return (req, res, next) => {
  if (!req.user) {
  return res.status(401).json({ error: "Not authenticated" });
  }

  if (allowedRoles.length === 0) {
  return res.status(403).json({ error: "Access denied" });
  }

  const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
  const isAllowed = allowedRoles.some((role) => userRoles.includes(role));

  if (!isAllowed) {
  return res
  .status(403)
  .json({ error: "Access denied: insufficient permissions" });
  }

  next();
  };
}

export default roleBasedAuth;