const express = require("express");
const {
  addAssignment,
  getAllAssignments,
  getAssignmentsByCourse,
  deleteAssignment,
  updateAssignment,
} = require("../controllers/assignmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addAssignment);
router.get("/get", protect, getAllAssignments);
router.get("/course/:courseId", protect, getAssignmentsByCourse);
router.patch("/:id", protect, updateAssignment);
router.delete("/:id", protect, deleteAssignment);

module.exports = router;
