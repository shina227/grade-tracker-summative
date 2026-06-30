const express = require("express");
const { getStudentDashboard, getTeacherDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

// GET /v1/dashboard/student  (Student only)
router.get("/student", requireRole("student"), getStudentDashboard);

// GET /v1/dashboard/teacher  (Teacher only)
router.get("/teacher", requireRole("teacher"), getTeacherDashboard);

module.exports = router;