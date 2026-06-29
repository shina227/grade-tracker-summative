const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getLesson,
  updateLesson,
  deleteLesson,
  completeLesson,
} = require("../controllers/lessonsController");

const router = express.Router();

router.use(protect);

// GET /v1/lessons/:lessonId
router.get("/:lessonId", getLesson);

// PATCH /v1/lessons/:lessonId (Teacher, Admin)
router.patch("/:lessonId", requireRole("teacher", "admin"), updateLesson);

// DELETE /v1/lessons/:lessonId (Teacher, Admin)
router.delete("/:lessonId", requireRole("teacher", "admin"), deleteLesson);

// POST /v1/lessons/:lessonId/complete (Student only)
router.post("/:lessonId/complete", requireRole("student"), completeLesson);

module.exports = router;
