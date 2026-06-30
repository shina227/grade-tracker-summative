const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// ─── Helpers ────────────────────────────────────────────────────────────────

const toAnnouncementDTO = (announcement, lastReadAt = null, isStudent = false) => {
  let isUnread = false;
  if (isStudent) {
    if (!lastReadAt) {
      isUnread = true;
    } else {
      isUnread = new Date(announcement.createdAt) > new Date(lastReadAt);
    }
  }

  return {
    id: announcement._id.toString(),
    courseId: announcement.courseId?._id?.toString() ?? announcement.courseId?.toString() ?? "",
    title: announcement.title,
    body: announcement.body,
    author: announcement.authorId?.fullName ?? "Unknown",
    authorId: announcement.authorId?._id?.toString() ?? announcement.authorId?.toString() ?? "",
    isPinned: announcement.isPinned,
    isUnread,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  };
};

const resolveCourseAccess = async (req, res, courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    return null;
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    return null;
  }

  const { role, _id: userId } = req.user;
  if (role === "admin") return course;

  if (role === "teacher") {
    if (course.instructorId.toString() !== userId.toString()) {
      res.status(403).json({ message: "You do not have access to this course.", code: "FORBIDDEN" });
      return null;
    }
    return course;
  }

  if (role === "student") {
    const enrollment = await Enrollment.findOne({ courseId, studentId: userId });
    if (!enrollment) {
      res.status(403).json({ message: "You are not enrolled in this course.", code: "FORBIDDEN" });
      return null;
    }
    return course;
  }

  res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
  return null;
};

// ─── GET /v1/courses/:courseId/announcements ─────────────────────────────────

exports.listAnnouncements = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { role, _id: userId } = req.user;
    let enrollment = null;
    let lastReadAtBeforeFetch = null;

    if (role === "student") {
      enrollment = await Enrollment.findOne({ courseId: course._id, studentId: userId });
      if (enrollment) {
        lastReadAtBeforeFetch = enrollment.lastAnnouncementReadAt;
      }
    }

    const [announcements, total] = await Promise.all([
      Announcement.find({ courseId: course._id })
        .populate("authorId", "fullName")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments({ courseId: course._id }),
    ]);

    const data = announcements.map((a) => toAnnouncementDTO(a, lastReadAtBeforeFetch, role === "student"));

    // If student, update lastAnnouncementReadAt to now after reading
    if (role === "student" && enrollment) {
      await Enrollment.findByIdAndUpdate(enrollment._id, { lastAnnouncementReadAt: new Date() });
    }

    return res.status(200).json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error in listAnnouncements:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/courses/:courseId/announcements ────────────────────────────────

exports.createAnnouncement = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    if (req.user.role === "student") {
      return res.status(403).json({ message: "Students cannot create announcements.", code: "FORBIDDEN" });
    }

    const { title, body, isPinned } = req.body;
    if (!title || !body) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: {
          ...(!title && { title: "Title is required." }),
          ...(!body && { body: "Body is required." }),
        },
      });
    }

    const announcement = await Announcement.create({
      courseId: course._id,
      title,
      body,
      authorId: req.user._id,
      isPinned: isPinned ?? false,
    });

    await announcement.populate("authorId", "fullName");

    // Trigger notification to all enrolled students
    const Notification = require("../models/Notification");
    const enrollments = await Enrollment.find({ courseId: course._id }).select("studentId").lean();
    if (enrollments.length > 0) {
      const notificationDocs = enrollments.map((e) => ({
        userId: e.studentId,
        title: `New Announcement in ${course.title}`,
        body: title,
        isRead: false,
      }));
      await Notification.insertMany(notificationDocs).catch((e) => console.error("Error creating notifications:", e));
    }

    return res.status(201).json(toAnnouncementDTO(announcement, null, false));
  } catch (err) {
    console.error("Error in createAnnouncement:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/courses/:courseId/announcements/:announcementId ───────────────

exports.updateAnnouncement = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const { announcementId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(announcementId)) {
      return res.status(404).json({ message: "Announcement not found.", code: "NOT_FOUND" });
    }

    const announcement = await Announcement.findOne({ _id: announcementId, courseId: course._id });
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found.", code: "NOT_FOUND" });
    }

    // Teacher check: must be author or course instructor
    if (
      req.user.role === "teacher" &&
      course.instructorId.toString() !== req.user._id.toString() &&
      announcement.authorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }

    const ALLOWED = ["title", "body", "isPinned"];
    const updates = {};
    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Announcement.findByIdAndUpdate(announcementId, updates, {
      new: true,
      runValidators: true,
    }).populate("authorId", "fullName");

    return res.status(200).json(toAnnouncementDTO(updated, null, false));
  } catch (err) {
    console.error("Error in updateAnnouncement:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/courses/:courseId/announcements/:announcementId ──────────────

exports.deleteAnnouncement = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const { announcementId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(announcementId)) {
      return res.status(404).json({ message: "Announcement not found.", code: "NOT_FOUND" });
    }

    const announcement = await Announcement.findOne({ _id: announcementId, courseId: course._id });
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found.", code: "NOT_FOUND" });
    }

    if (
      req.user.role === "teacher" &&
      course.instructorId.toString() !== req.user._id.toString() &&
      announcement.authorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }

    await Announcement.findByIdAndDelete(announcementId);

    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteAnnouncement:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};
