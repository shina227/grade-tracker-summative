const express = require("express");
const { 
  getGrades, 
  getGrade, 
  createGrade, 
  updateGrade, 
  deleteGrade 
} = require("../controllers/gradeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getGrades);
router.get("/:id", getGrade);
router.post("/", createGrade);
router.patch("/:id", updateGrade);
router.delete("/:id", deleteGrade);

module.exports = router;