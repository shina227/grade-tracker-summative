const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

const {
  submitAssignmentWork,
  listAssignmentSubmissions,
  getSubmission,
  updateSubmissionStatus,
} = require("../controllers/submissionsController");

const router = express.Router();

router.use(protect);

// ── Assignment CRUD ───────────────────────────────────────────────────────────

router.get("/", getAssignments);
router.get("/:assignmentId", getAssignment);
router.patch("/:assignmentId", requireRole("teacher", "admin"), updateAssignment);
router.delete("/:assignmentId", requireRole("teacher", "admin"), deleteAssignment);

// ── Submissions sub-routes ───────────────────────────────────────────────────

// POST /v1/assignments/:assignmentId/submissions (Student)
router.post("/:assignmentId/submissions", requireRole("student"), submitAssignmentWork);

// GET /v1/assignments/:assignmentId/submissions (Teacher, Admin)
router.get("/:assignmentId/submissions", requireRole("teacher", "admin"), listAssignmentSubmissions);

// GET /v1/assignments/:assignmentId/submissions/:submissionId
router.get("/:assignmentId/submissions/:submissionId", getSubmission);

// PATCH /v1/assignments/:assignmentId/submissions/:submissionId (Teacher, Admin)
router.patch("/:assignmentId/submissions/:submissionId", requireRole("teacher", "admin"), updateSubmissionStatus);

module.exports = router;