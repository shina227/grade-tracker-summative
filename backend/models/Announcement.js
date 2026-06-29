const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for listing pinned items first, then newest first
AnnouncementSchema.index({ courseId: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model("Announcement", AnnouncementSchema);
