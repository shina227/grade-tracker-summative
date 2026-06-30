const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      default: null,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1 },
    feedback: { type: String, default: "" },
    gradedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate grade entry for the same assignment and student
GradeSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { assignmentId: { $ne: null } } }
);

module.exports = mongoose.model("Grade", GradeSchema);