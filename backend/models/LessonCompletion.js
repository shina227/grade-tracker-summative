const mongoose = require("mongoose");

const LessonCompletionSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// A student can only complete a given lesson once
LessonCompletionSchema.index({ lessonId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("LessonCompletion", LessonCompletionSchema);
