const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// ─── Helpers ────────────────────────────────────────────────────────────────

const toSubmissionDTO = (submission) => ({
  id: submission._id.toString(),
  assignmentId: submission.assignmentId?._id?.toString() ?? submission.assignmentId?.toString() ?? "",
  studentId: submission.studentId?._id?.toString() ?? submission.studentId?.toString() ?? "",
  studentName: submission.studentId?.fullName ?? undefined,
  fileUrl: submission.fileUrl,
  content: submission.content ?? "",
  status: submission.status,
  feedback: submission.feedback ?? null,
  submittedAt: submission.submittedAt,
});

// ─── POST /v1/assignments/:assignmentId/submissions ─────────────────────────

exports.submitAssignmentWork = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(404).json({ message: "Assignment not found.", code: "NOT_FOUND" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found.", code: "NOT_FOUND" });
    }

    // Verify assignment is open
    if (assignment.status === "closed") {
      return res.status(403).json({ message: "Assignment is closed for submissions.", code: "ASSIGNMENT_CLOSED" });
    }

    const studentId = req.user._id;

    // Verify student enrollment in the course
    const enrollment = await Enrollment.findOne({ courseId: assignment.courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({ message: "You are not enrolled in this course.", code: "FORBIDDEN" });
    }

    const { fileUrl, content } = req.body;
    if (!fileUrl) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: { fileUrl: "fileUrl is required." },
      });
    }

    // Check if already submitted
    const existing = await Submission.findOne({ assignmentId, studentId });
    if (existing) {
      return res.status(409).json({
        message: "You have already submitted work for this assignment.",
        code: "ALREADY_SUBMITTED",
      });
    }

    const submission = await Submission.create({
      assignmentId,
      studentId,
      fileUrl,
      content: content ?? "",
      status: "submitted",
      submittedAt: new Date(),
    });

    return res.status(201).json(toSubmissionDTO(submission));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "You have already submitted work for this assignment.",
        code: "ALREADY_SUBMITTED",
      });
    }
    console.error("Error in submitAssignmentWork:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/assignments/:assignmentId/submissions ──────────────────────────

exports.listAssignmentSubmissions = async (req, res) => {
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

    // Only Course Teacher or Admin can list submissions
    const { role, _id: userId } = req.user;
    if (role === "teacher" && course.instructorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }
    if (role === "student") {
      return res.status(403).json({ message: "Students cannot view all submissions.", code: "FORBIDDEN" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      Submission.find({ assignmentId })
        .populate("studentId", "fullName email")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Submission.countDocuments({ assignmentId }),
    ]);

    const data = submissions.map(toSubmissionDTO);

    return res.status(200).json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error in listAssignmentSubmissions:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/assignments/:assignmentId/submissions/:submissionId ────────────

exports.getSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId) || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(404).json({ message: "Submission not found.", code: "NOT_FOUND" });
    }

    const submission = await Submission.findOne({ _id: submissionId, assignmentId }).populate("studentId", "fullName email");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found.", code: "NOT_FOUND" });
    }

    const assignment = await Assignment.findById(assignmentId);
    const course = await Course.findById(assignment.courseId);

    const { role, _id: userId } = req.user;
    if (role === "student" && submission.studentId._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only view your own submission.", code: "FORBIDDEN" });
    }
    if (role === "teacher" && course.instructorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }

    return res.status(200).json(toSubmissionDTO(submission));
  } catch (err) {
    console.error("Error in getSubmission:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/assignments/:assignmentId/submissions/:submissionId ───────────

exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId) || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(404).json({ message: "Submission not found.", code: "NOT_FOUND" });
    }

    const submission = await Submission.findOne({ _id: submissionId, assignmentId });
    if (!submission) {
      return res.status(404).json({ message: "Submission not found.", code: "NOT_FOUND" });
    }

    const assignment = await Assignment.findById(assignmentId);
    const course = await Course.findById(assignment.courseId);

    const { role, _id: userId } = req.user;
    if (role === "teacher" && course.instructorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }

    const { status, feedback } = req.body;
    if (status !== undefined) submission.status = status;
    if (feedback !== undefined) submission.feedback = feedback;

    await submission.save();
    await submission.populate("studentId", "fullName email");

    return res.status(200).json(toSubmissionDTO(submission));
  } catch (err) {
    console.error("Error in updateSubmissionStatus:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/submissions/:submissionId/resubmit ───────────────────────────

exports.resubmitAssignmentWork = async (req, res) => {
  try {
    const { submissionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(404).json({ message: "Submission not found.", code: "NOT_FOUND" });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found.", code: "NOT_FOUND" });
    }

    // Must belong to authenticated student
    if (submission.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only resubmit your own work.", code: "FORBIDDEN" });
    }

    // Must have "returned" status to allow resubmission
    if (submission.status !== "returned") {
      return res.status(400).json({
        message: "Only submissions marked as 'returned' can be resubmitted.",
        code: "INVALID_STATUS",
      });
    }

    const { fileUrl, content } = req.body;
    if (!fileUrl) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: { fileUrl: "fileUrl is required for resubmission." },
      });
    }

    submission.fileUrl = fileUrl;
    if (content !== undefined) submission.content = content;
    submission.status = "submitted";
    submission.submittedAt = new Date();

    await submission.save();
    await submission.populate("studentId", "fullName email");

    return res.status(200).json(toSubmissionDTO(submission));
  } catch (err) {
    console.error("Error in resubmitAssignmentWork:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};
