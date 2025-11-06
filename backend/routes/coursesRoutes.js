const express = require("express");
const {
  addCourse,
  getAllCourses,
  deleteCourse,
  updateCourse,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addCourse);
router.get("/get", protect, getAllCourses);
router.patch("/:id", protect, updateCourse);
router.delete("/:id", protect, deleteCourse);

module.exports = router;
