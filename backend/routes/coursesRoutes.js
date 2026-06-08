const express = require("express");
const {
  addCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // all routes require auth

router.get("/", getAllCourses);
router.get("/:id", getCourse);
router.post("/", addCourse);
router.patch("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;