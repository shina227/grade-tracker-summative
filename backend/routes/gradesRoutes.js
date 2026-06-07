const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  getGrades,
  getGrade,
  createGrade,
} = require("../controllers/gradeController");

const router = express.Router();

/**
 * GET all grades
 */
router.get("/", protect, getGrades);

/**
 * GET single grade
 */
router.get("/:id", protect, getGrade);

/**
 * CREATE grade (manual/system use)
 */
router.post("/", protect, createGrade);

module.exports = router;