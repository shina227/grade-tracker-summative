const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    lastAnnouncementReadAt: { type: Date, default: null },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

EnrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
