/**
 * requireRole(...roles)
 *
 * Middleware factory that restricts a route to users with one of the specified roles.
 * Must be used AFTER the `protect` middleware (which populates req.user).
 *
 * Usage:
 *   router.get("/", protect, requireRole("admin"), listUsers);
 *   router.get("/", protect, requireRole("admin", "teacher"), someHandler);
 */
exports.requireRole = (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
        code: "FORBIDDEN",
      });
    }
    next();
  };
