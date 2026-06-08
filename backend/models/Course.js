const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    instructor: { type: String, default: "Unknown" },
    term: String,
    year: Number,
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);