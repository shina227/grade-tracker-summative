const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// ─── Helpers ────────────────────────────────────────────────────────────────

const toAssignmentDTO = (assignment) => ({
  id: assignment._id?.toString() || "",
  courseId: assignment.courseId?._id?.toString() ?? assignment.courseId?.toString() ?? null,
  courseName: assignment.courseId?.title ?? "Unknown Course",
  instructor: assignment.instructor || assignment.courseId?.instructorId?.fullName || "",
  title: assignment.title || "Untitled",
  description: assignment.description || "",
  dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString() : null,
  status: assignment.status || "upcoming",
  points: assignment.points || 0,
  submissionType: assignment.submissionType || "file_upload",
  gradingRubric: assignment.gradingRubric || [],
  reminderNote: assignment.reminderNote || "",
});

const resolveCourseAccess = async (req, res, courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    return null;
  }

  const course = await Course.findById(courseId).populate("instructorId", "fullName");
  if (!course) {
    res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    return null;
  }

  const { role, _id: userId } = req.user;
  if (role === "admin") return course;

  if (role === "teacher") {
    if (course.instructorId._id.toString() !== userId.toString()) {
      res.status(403).json({ message: "You do not have access to this course.", code: "FORBIDDEN" });
      return null;
    }
    return course;
  }

  if (role === "student") {
    const enrollment = await Enrollment.findOne({ courseId, studentId: userId });
    if (!enrollment) {
      res.status(403).json({ message: "You are not enrolled in this course.", code: "FORBIDDEN" });
      return null;
    }
    return course;
  }

  res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
  return null;
};

// ─── GET /v1/courses/:courseId/assignments ───────────────────────────────────

exports.getCourseAssignments = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { courseId: course._id };
    if (req.query.status) filter.status = req.query.status;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate({ path: "courseId", select: "title instructorId", populate: { path: "instructorId", select: "fullName" } })
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: assignments.map(toAssignmentDTO),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error in getCourseAssignments:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/assignments ──────────────────────────────────────────────────────

exports.getAssignments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { role, _id: userId } = req.user;
    let courseIds = null;

    if (req.query.courseId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.courseId)) {
        return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
      }
      courseIds = [req.query.courseId];
    } else {
      if (role === "student") {
        const enrollments = await Enrollment.find({ studentId: userId }).select("courseId").lean();
        courseIds = enrollments.map((e) => e.courseId);
      } else if (role === "teacher") {
        const courses = await Course.find({ instructorId: userId }).select("_id").lean();
        courseIds = courses.map((c) => c._id);
      }
    }

    const filter = {};
    if (courseIds !== null) filter.courseId = { $in: courseIds };
    if (req.query.status) filter.status = req.query.status;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate({ path: "courseId", select: "title instructorId", populate: { path: "instructorId", select: "fullName" } })
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: assignments.map(toAssignmentDTO),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error in getAssignments:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/courses/:courseId/assignments ──────────────────────────────────

exports.createAssignment = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    if (req.user.role === "student") {
      return res.status(403).json({ message: "Students cannot create assignments.", code: "FORBIDDEN" });
    }

    const { title, description, dueDate, points, submissionType, gradingRubric, reminderNote } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: {
          ...(!title && { title: "Title is required." }),
          ...(!dueDate && { dueDate: "Due date is required." }),
        },
      });
    }

    const assignment = await Assignment.create({
      courseId: course._id,
      title,
      description: description ?? "",
      instructor: course.instructorId?.fullName ?? "",
      dueDate,
      points: points ?? 100,
      submissionType: submissionType ?? "file_upload",
      gradingRubric: gradingRubric ?? [],
      reminderNote: reminderNote ?? "",
      status: "upcoming",
    });

    await assignment.populate({ path: "courseId", select: "title instructorId", populate: { path: "instructorId", select: "fullName" } });

    return res.status(201).json(toAssignmentDTO(assignment));
  } catch (err) {
    console.error("Error in createAssignment:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/assignments/:assignmentId ───────────────────────────────────────

exports.getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(404).json({ message: "Assignment not found.", code: "NOT_FOUND" });
    }

    const assignment = await Assignment.findById(assignmentId).populate({
      path: "courseId",
      select: "title instructorId",
      populate: { path: "instructorId", select: "fullName" },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found.", code: "NOT_FOUND" });
    }

    // Check course access
    const courseAccess = await resolveCourseAccess(req, res, assignment.courseId._id);
    if (!courseAccess) return;

    return res.status(200).json(toAssignmentDTO(assignment));
  } catch (err) {
    console.error("Error in getAssignment:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/assignments/:assignmentId ─────────────────────────────────────

exports.updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(404).json({ message: "Assignment not found.", code: "NOT_FOUND" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found.", code: "NOT_FOUND" });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    }

    if (req.user.role === "teacher" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden", code: "FORBIDDEN" });
    }

    const ALLOWED = ["title", "description", "dueDate", "points", "submissionType", "gradingRubric", "reminderNote", "status"];
    const updates = {};
    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Assignment.findByIdAndUpdate(assignmentId, updates, {
      new: true,
      runValidators: true,
    }).populate({ path: "courseId", select: "title instructorId", populate: { path: "instructorId", select: "fullName" } });

    return res.status(200).json(toAssignmentDTO(updated));
  } catch (err) {
    console.error("Error in updateAssignment:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/assignments/:assignmentId ────────────────────────────────────

exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(404).json({ message: "Assignment not found.", code: "NOT_FOUND" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found.", code: "NOT_FOUND" });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    }

    if (req.user.role === "teacher" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden", code: "FORBIDDEN" });
    }

    const Submission = require("../models/Submission");
    await Promise.all([
      Assignment.findByIdAndDelete(assignmentId),
      Submission.deleteMany({ assignmentId }),
    ]);

    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteAssignment:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};