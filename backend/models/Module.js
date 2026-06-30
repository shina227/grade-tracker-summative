const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    order: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

// Ensure module order is unique per course
ModuleSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model("Module", ModuleSchema);
