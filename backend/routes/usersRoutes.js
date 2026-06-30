const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getMe,
  updateMe,
  updateMyPassword,
  listUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");

const router = express.Router();

// All /users routes require authentication
router.use(protect);

// ── Self-service routes ───────────────────────────────────────────────────────

// GET  /v1/users/me
router.get("/me", getMe);

// PATCH /v1/users/me  (avatarUrl only)
router.patch("/me", updateMe);

// PATCH /v1/users/me/password
router.patch("/me/password", updateMyPassword);

// ── Admin routes ──────────────────────────────────────────────────────────────

// GET  /v1/users         (Admin only)
router.get("/", requireRole("admin"), listUsers);

// POST /v1/users         (Admin only)
router.post("/", requireRole("admin"), createUser);

// ── Admin + Teacher routes ────────────────────────────────────────────────────

// GET  /v1/users/:userId (Admin: any user | Teacher: enrolled students only)
router.get("/:userId", requireRole("admin", "teacher"), getUserById);

// PATCH /v1/users/:userId (Admin only)
router.patch("/:userId", requireRole("admin"), updateUser);

// DELETE /v1/users/:userId (Admin only)
router.delete("/:userId", requireRole("admin"), deleteUser);

module.exports = router;
