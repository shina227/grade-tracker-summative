const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
} = require("../controllers/gradeController");

const router = express.Router();

router.use(protect);

// GET /v1/grades (Student, Teacher, Admin)
router.get("/", getGrades);

// GET /v1/grades/:gradeId (Student own grade, Teacher own course, Admin)
router.get("/:gradeId", getGrade);

// POST /v1/grades (Teacher, Admin)
router.post("/", requireRole("teacher", "admin"), createGrade);

// PATCH /v1/grades/:gradeId (Teacher, Admin)
router.patch("/:gradeId", requireRole("teacher", "admin"), updateGrade);

// DELETE /v1/grades/:gradeId (Teacher, Admin)
router.delete("/:gradeId", requireRole("teacher", "admin"), deleteGrade);

module.exports = router;