const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    term: { type: String, default: null },
    year: { type: Number, default: null },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);