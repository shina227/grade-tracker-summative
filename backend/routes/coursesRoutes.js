const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getAllCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  enrollStudent,
  unenrollStudent,
} = require("../controllers/courseController");

const {
  listModules,
  createModule,
  updateModule,
  deleteModule,
  listLessons,
  createLesson,
} = require("../controllers/modulesController");

const {
  getCourseAssignments,
  createAssignment,
} = require("../controllers/assignmentController");

const {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementsController");

const router = express.Router();

// All course routes require authentication
router.use(protect);

// ── Course CRUD ───────────────────────────────────────────────────────────────

router.get("/", getAllCourses);
router.post("/", requireRole("teacher", "admin"), createCourse);
router.get("/:courseId", getCourse);
router.patch("/:courseId", requireRole("teacher", "admin"), updateCourse);
router.delete("/:courseId", requireRole("admin"), deleteCourse);

// ── Enrollment sub-routes ─────────────────────────────────────────────────────

router.get("/:courseId/students", requireRole("teacher", "admin"), getCourseStudents);
router.post("/:courseId/enroll", requireRole("teacher", "admin"), enrollStudent);
router.delete("/:courseId/students/:studentId", requireRole("teacher", "admin"), unenrollStudent);

// ── Modules & Lessons sub-routes ──────────────────────────────────────────────

router.get("/:courseId/modules", listModules);
router.post("/:courseId/modules", requireRole("teacher", "admin"), createModule);
router.patch("/:courseId/modules/:moduleId", requireRole("teacher", "admin"), updateModule);
router.delete("/:courseId/modules/:moduleId", requireRole("teacher", "admin"), deleteModule);

router.get("/:courseId/modules/:moduleId/lessons", listLessons);
router.post("/:courseId/modules/:moduleId/lessons", requireRole("teacher", "admin"), createLesson);

// ── Assignments sub-routes ───────────────────────────────────────────────────

router.get("/:courseId/assignments", getCourseAssignments);
router.post("/:courseId/assignments", requireRole("teacher", "admin"), createAssignment);

// ── Announcements sub-routes ─────────────────────────────────────────────────

router.get("/:courseId/announcements", listAnnouncements);
router.post("/:courseId/announcements", requireRole("teacher", "admin"), createAnnouncement);
router.patch("/:courseId/announcements/:announcementId", requireRole("teacher", "admin"), updateAnnouncement);
router.delete("/:courseId/announcements/:announcementId", requireRole("teacher", "admin"), deleteAnnouncement);

module.exports = router;