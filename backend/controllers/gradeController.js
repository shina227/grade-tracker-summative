const Grade = require("../models/Grade");
const Course = require("../models/Course");

// HELPERS

const toGradeDTO = (grade) => ({
  id: grade._id.toString(),
  title: grade.title,
  courseId: grade.courseId?._id?.toString() ?? grade.courseId.toString(),
  courseName: grade.courseId?.title ?? "Unknown",
  score: grade.score,
  maxScore: grade.maxScore,
  gradedAt: grade.gradedAt.toISOString(),
});

// GET /grades
exports.getGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ userId: req.user.id })
      .populate("courseId", "title")
      .sort({ gradedAt: -1 });

    return res.json(grades.map(toGradeDTO));
  } catch (error) {
    console.error("Error fetching grades:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /grades/:id
exports.getGrade = async (req, res) => {
  try {
    const grade = await Grade.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("courseId", "title");

    if (!grade) return res.status(404).json({ message: "Grade not found" });

    return res.json(toGradeDTO(grade));
  } catch (error) {
    console.error("Error fetching grade:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /grades
exports.createGrade = async (req, res) => {
  try {
    const { courseId, assignmentId, title, score, maxScore, gradedAt } = req.body;

    if (!courseId || !title || score === undefined || !maxScore) {
      return res.status(400).json({ message: "courseId, title, score, and maxScore are required" });
    }

    const course = await Course.findOne({ _id: courseId, userId: req.user.id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const grade = await Grade.create({
      userId: req.user.id,
      courseId,
      assignmentId,   // optional
      title,
      score,
      maxScore,
      gradedAt: gradedAt ? new Date(gradedAt) : undefined, // falls back to schema default
    });

    await grade.populate("courseId", "title");

    return res.status(201).json(toGradeDTO(grade));
  } catch (error) {
    console.error("Error creating grade:", error);
    return res.status(500).json({ message: "Server error" });
  }
};