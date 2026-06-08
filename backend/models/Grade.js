const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Optional — grade may not always be tied to a tracked assignment
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
    title: { type: String, required: true },   // e.g. "Midterm Exam"
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1 },
    gradedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grade", GradeSchema);