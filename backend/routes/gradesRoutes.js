const express = require("express");
const { getGrades, getGrade, createGrade } = require("../controllers/gradeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getGrades);
router.get("/:id", getGrade);
router.post("/", createGrade);

module.exports = router;