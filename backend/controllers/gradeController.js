const mongoose = require("mongoose");
const Grade = require("../models/Grade");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

// ─── Helpers ────────────────────────────────────────────────────────────────

const toGradeDTO = (grade) => ({
  id: grade._id.toString(),
  courseId: grade.courseId?._id?.toString() ?? grade.courseId?.toString() ?? "",
  courseName: grade.courseId?.title ?? "Unknown Course",
  assignmentId: grade.assignmentId?._id?.toString() ?? grade.assignmentId?.toString() ?? null,
  studentId: grade.studentId?._id?.toString() ?? grade.studentId?.toString() ?? "",
  title: grade.title || "Untitled",
  score: grade.score,
  maxScore: grade.maxScore,
  feedback: grade.feedback ?? "",
  gradedAt: grade.gradedAt ? new Date(grade.gradedAt).toISOString() : new Date().toISOString(),
});

// ─── GET /v1/grades ───────────────────────────────────────────────────────────

exports.getGrades = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { role, _id: userId } = req.user;
    const filter = {};

    if (req.query.courseId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.courseId)) {
        return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
      }
      filter.courseId = req.query.courseId;
    }

    if (role === "student") {
      filter.studentId = userId;
    } else if (role === "teacher") {
      const teacherCourses = await Course.find({ instructorId: userId }).select("_id").lean();
      const teacherCourseIds = teacherCourses.map((c) => c._id);
      if (filter.courseId) {
        if (!teacherCourseIds.some((id) => id.toString() === filter.courseId.toString())) {
          return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
        }
      } else {
        filter.courseId = { $in: teacherCourseIds };
      }
    }

    const [grades, total] = await Promise.all([
      Grade.find(filter)
        .populate("courseId", "title")
        .sort({ gradedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Grade.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: grades.map(toGradeDTO),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error in getGrades:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/grades ──────────────────────────────────────────────────────────

exports.createGrade = async (req, res) => {
  try {
    const { courseId, assignmentId, studentId, title, score, maxScore, feedback, gradedAt } = req.body;

    if (!courseId || !studentId || !title || score === undefined || !maxScore) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: {
          ...(!courseId && { courseId: "courseId is required." }),
          ...(!studentId && { studentId: "studentId is required." }),
          ...(!title && { title: "title is required." }),
          ...(score === undefined && { score: "score is required." }),
          ...(!maxScore && { maxScore: "maxScore is required." }),
        },
      });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });

    // Access check for teacher
    if (req.user.role === "teacher" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }

    // Verify student exists
    const student = await User.findOne({ _id: studentId, role: "student", isActive: true });
    if (!student) return res.status(404).json({ message: "Student not found.", code: "USER_NOT_FOUND" });

    if (assignmentId) {
      const assignment = await Assignment.findOne({ _id: assignmentId, courseId });
      if (!assignment) return res.status(404).json({ message: "Assignment not found.", code: "NOT_FOUND" });

      const existingGrade = await Grade.findOne({ assignmentId, studentId });
      if (existingGrade) {
        return res.status(409).json({
          message: "A grade already exists for this assignment and student.",
          code: "GRADE_ALREADY_EXISTS",
        });
      }
    }

    const grade = await Grade.create({
      courseId,
      assignmentId: assignmentId ?? null,
      studentId,
      title,
      score,
      maxScore,
      feedback: feedback ?? "",
      gradedAt: gradedAt ? new Date(gradedAt) : new Date(),
    });

    // Sync Submission status if applicable
    if (assignmentId) {
      await Submission.findOneAndUpdate(
        { assignmentId, studentId },
        { status: "graded", feedback: feedback ?? undefined }
      );
    }

    await grade.populate("courseId", "title");

    return res.status(201).json(toGradeDTO(grade));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "A grade already exists for this assignment and student.",
        code: "GRADE_ALREADY_EXISTS",
      });
    }
    console.error("Error in createGrade:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/grades/:gradeId ──────────────────────────────────────────────────

exports.getGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      return res.status(404).json({ message: "Grade not found.", code: "NOT_FOUND" });
    }

    const grade = await Grade.findById(gradeId).populate("courseId", "title instructorId");
    if (!grade) return res.status(404).json({ message: "Grade not found.", code: "NOT_FOUND" });

    const { role, _id: userId } = req.user;
    if (role === "student" && grade.studentId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only view your own grades.", code: "FORBIDDEN" });
    }
    if (role === "teacher" && grade.courseId.instructorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }

    return res.status(200).json(toGradeDTO(grade));
  } catch (err) {
    console.error("Error in getGrade:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/grades/:gradeId ────────────────────────────────────────────────

exports.updateGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      return res.status(404).json({ message: "Grade not found.", code: "NOT_FOUND" });
    }

    const grade = await Grade.findById(gradeId).populate("courseId", "instructorId");
    if (!grade) return res.status(404).json({ message: "Grade not found.", code: "NOT_FOUND" });

    if (req.user.role === "teacher" && grade.courseId.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }

    const ALLOWED = ["score", "maxScore", "feedback", "title", "gradedAt"];
    const updates = {};
    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Grade.findByIdAndUpdate(gradeId, updates, {
      new: true,
      runValidators: true,
    }).populate("courseId", "title");

    // Also update submission feedback if linked
    if (updates.feedback !== undefined && updated.assignmentId) {
      await Submission.findOneAndUpdate(
        { assignmentId: updated.assignmentId, studentId: updated.studentId },
        { feedback: updates.feedback }
      );
    }

    return res.status(200).json(toGradeDTO(updated));
  } catch (err) {
    console.error("Error in updateGrade:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/grades/:gradeId ───────────────────────────────────────────────

exports.deleteGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      return res.status(404).json({ message: "Grade not found.", code: "NOT_FOUND" });
    }

    const grade = await Grade.findById(gradeId).populate("courseId", "instructorId");
    if (!grade) return res.status(404).json({ message: "Grade not found.", code: "NOT_FOUND" });

    if (req.user.role === "teacher" && grade.courseId.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }

    await Grade.findByIdAndDelete(gradeId);

    // Revert submission status if applicable
    if (grade.assignmentId) {
      await Submission.findOneAndUpdate(
        { assignmentId: grade.assignmentId, studentId: grade.studentId },
        { status: "submitted" }
      );
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteGrade:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};