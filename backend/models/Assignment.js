const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
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

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "upcoming",
        "due_soon",
        "due_tomorrow",
        "overdue",
        "submitted",
        "graded",
      ],
      default: "upcoming",
    },

    submissionContent: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    submittedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);