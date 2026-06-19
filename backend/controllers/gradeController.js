const Grade = require("../models/Grade");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");

// HELPERS

const toGradeDTO = (grade) => ({
  id: grade._id?.toString() || "",
  title: grade.title || "Untitled",
  courseId: grade.courseId?._id?.toString() ?? grade.courseId?.toString() ?? "",
  courseName: grade.courseId?.title ?? "Unknown",
  score: grade.score ?? 0,
  maxScore: grade.maxScore ?? 1,
  gradedAt: grade.gradedAt ? new Date(grade.gradedAt).toISOString() : new Date().toISOString(),
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

    // Validate assignment if provided
    if (assignmentId) {
      const assignment = await Assignment.findOne({ _id: assignmentId, userId: req.user.id });
      if (!assignment) return res.status(404).json({ message: "Assignment not found" });
      
      // Update assignment status
      assignment.status = "graded";
      await assignment.save();
    }

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

// PATCH /grades/:id
exports.updateGrade = async (req, res) => {
  const allowedFields = ["title", "score", "maxScore", "gradedAt"];

  try {
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]])
    );

    if (updates.gradedAt) {
      updates.gradedAt = new Date(updates.gradedAt);
    }

    const grade = await Grade.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    ).populate("courseId", "title");

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    return res.json(toGradeDTO(grade));
  } catch (error) {
    console.error("Error updating grade:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /grades/:id
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    // Optionally revert assignment status to 'submitted' if it was linked
    if (grade.assignmentId) {
      await Assignment.findOneAndUpdate(
        { _id: grade.assignmentId, userId: req.user.id },
        { status: "submitted" }
      );
    }

    return res.json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error deleting grade:", error);
    return res.status(500).json({ message: "Server error" });
  }
};