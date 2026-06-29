const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, required: true },
    content: { type: String, default: "" },
    status: {
      type: String,
      enum: ["submitted", "returned", "graded"],
      default: "submitted",
    },
    feedback: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent multiple submissions for the same assignment by the same student
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", SubmissionSchema);
