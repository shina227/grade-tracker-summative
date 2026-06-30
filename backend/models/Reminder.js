const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    detail: { type: String, default: "" },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

ReminderSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model("Reminder", ReminderSchema);
