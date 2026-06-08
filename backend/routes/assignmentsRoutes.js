const express = require("express");
const {
  addAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} = require("../controllers/assignmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getAssignments);
router.get("/:id", getAssignment);
router.post("/", addAssignment);
router.patch("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);
router.post("/:id/submit", submitAssignment);

module.exports = router;