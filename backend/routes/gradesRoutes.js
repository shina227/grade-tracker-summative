const express = require("express");
const {
  addGrade,
  getAllGrades,
  updateGrade,
  deleteGrade,
} = require("../controllers/gradeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addGrade);
router.get("/get", protect, getAllGrades);
router.patch("/:id", protect, updateGrade);
router.delete("/:id", protect, deleteGrade);

module.exports = router;
