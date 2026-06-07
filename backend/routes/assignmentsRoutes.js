const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  addAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

/**
 * CORE CRUD (matches frontend)
 */
router.get("/", protect, getAssignments);
router.get("/:id", protect, getAssignment);
router.post("/", protect, addAssignment);
router.patch("/:id", protect, updateAssignment);
router.delete("/:id", protect, deleteAssignment);

/**
 * SUBMISSION FLOW (frontend feature)
 */
router.post("/:id/submit", protect, submitAssignment);

module.exports = router;