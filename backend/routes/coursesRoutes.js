const express = require("express");
const {
  addCourse,
  getAllCourses,
  getCourse,
  deleteCourse,
  updateCourse,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addCourse);
router.get("/", protect, getAllCourses);
router.get("/:id", protect, getCourse);
router.patch("/:id", protect, updateCourse);
router.delete("/:id", protect, deleteCourse);

module.exports = router;