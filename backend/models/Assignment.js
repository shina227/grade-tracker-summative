const mongoose = require("mongoose");

const RubricCriterionSchema = new mongoose.Schema(
  {
    criterion: { type: String, required: true },
    points: { type: Number, required: true },
  },
  { _id: false }
);

const AssignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    instructor: { type: String, default: "" },
    points: { type: Number, default: 0 },
    submissionType: { type: String, default: "file_upload" },
    gradingRubric: { type: [RubricCriterionSchema], default: [] },
    reminderNote: { type: String, default: "" },
    dueDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["upcoming", "overdue", "closed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);