const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { resubmitAssignmentWork } = require("../controllers/submissionsController");

const router = express.Router();

router.use(protect);

// PATCH /v1/submissions/:submissionId/resubmit (Student only)
router.patch("/:submissionId/resubmit", requireRole("student"), resubmitAssignmentWork);

module.exports = router;
