const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    // Denormalized from the module — enables efficient course-level queries
    // (e.g. "total lessons in this course") without a double-join through Module.
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["video", "reading", "quiz", "other"],
      default: "other",
    },
    duration: { type: String, default: null },      // e.g. "8 min"
    description: { type: String, default: "" },
    overview: { type: String, default: "" },
    videoUrl: { type: String, default: null },
    order: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

// Ensure lesson order is unique per module
LessonSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model("Lesson", LessonSchema);
