const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const User = require("../models/User");

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Builds the full course DTO for a single course document.
 * Fetches enrolledCount, taskCount, and (for students) their own progress
 * in one pass using Promise.all.
 *
 * @param {object} course      - Mongoose course doc (populated instructorId)
 * @param {string|null} studentId - Pass req.user._id when caller is a student
 */
const toCourseDTO = async (course, studentId = null) => {
  const courseObjId = course._id;

  const [enrolledCount, taskCount, enrollment] = await Promise.all([
    Enrollment.countDocuments({ courseId: courseObjId }),
    Assignment.countDocuments({ courseId: courseObjId }),
    studentId
      ? Enrollment.findOne({ courseId: courseObjId, studentId }).lean()
      : null,
  ]);

  return {
    id: course._id.toString(),
    title: course.title,
    instructor: course.instructorId?.fullName ?? "Unknown",
    instructorId: course.instructorId?._id?.toString() ?? null,
    progress: enrollment?.progress ?? 0,
    taskCount,
    status: course.status,
    term: course.term ?? null,
    year: course.year ?? null,
    enrolledCount,
  };
};

/**
 * Checks whether the requesting user is allowed to access a specific course.
 * Returns the course doc if allowed, or sends the appropriate error response.
 */
const resolveCourseAccess = async (req, res, courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    return null;
  }

  const course = await Course.findById(courseId).populate("instructorId", "fullName");
  if (!course) {
    res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    return null;
  }

  const { role, _id: userId } = req.user;

  if (role === "admin") return course;

  if (role === "teacher") {
    if (course.instructorId._id.toString() !== userId.toString()) {
      res.status(403).json({ message: "You do not have access to this course.", code: "FORBIDDEN" });
      return null;
    }
    return course;
  }

  // Student — must be enrolled
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

// ─── GET /v1/courses ─────────────────────────────────────────────────────────

exports.getAllCourses = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { role, _id: userId } = req.user;

    // Build the base course filter
    let courseFilter = {};
    if (req.query.status) courseFilter.status = req.query.status;

    let courseIds = null; // used for student scoping

    if (role === "student") {
      // Students only see courses they're enrolled in
      const enrollments = await Enrollment.find({ studentId: userId }).select("courseId").lean();
      courseIds = enrollments.map((e) => e.courseId);
      courseFilter._id = { $in: courseIds };
    } else if (role === "teacher") {
      courseFilter.instructorId = userId;
    }
    // admin: no extra filter

    if (req.query.search) {
      courseFilter.title = new RegExp(req.query.search, "i");
    }

    const [courses, total] = await Promise.all([
      Course.find(courseFilter)
        .populate("instructorId", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(courseFilter),
    ]);

    const studentId = role === "student" ? userId : null;
    const data = await Promise.all(courses.map((c) => toCourseDTO(c, studentId)));

    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error in getAllCourses:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/courses ────────────────────────────────────────────────────────

exports.createCourse = async (req, res) => {
  try {
    const { title, term, year, status } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: { title: "Title is required." },
      });
    }

    // Teachers are always the instructor of their own courses.
    // Admins could theoretically create on behalf of a teacher but for now
    // we set instructorId to the requesting user.
    const instructorId = req.user._id;

    const course = await Course.create({
      instructorId,
      title,
      term: term ?? null,
      year: year ?? null,
      status: status ?? "active",
    });

    await course.populate("instructorId", "fullName");
    const dto = await toCourseDTO(course, null);

    return res.status(201).json(dto);
  } catch (err) {
    console.error("Error in createCourse:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/courses/:courseId ───────────────────────────────────────────────

exports.getCourse = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const studentId = req.user.role === "student" ? req.user._id : null;
    const dto = await toCourseDTO(course, studentId);

    return res.status(200).json(dto);
  } catch (err) {
    console.error("Error in getCourse:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/courses/:courseId ─────────────────────────────────────────────

exports.updateCourse = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    // Students must never reach here (resolveCourseAccess would 403),
    // but guard anyway
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Access denied.", code: "FORBIDDEN" });
    }

    const ALLOWED = ["title", "term", "year", "status"];
    const updates = {};
    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Course.findByIdAndUpdate(course._id, updates, {
      new: true,
      runValidators: true,
    }).populate("instructorId", "fullName");

    const dto = await toCourseDTO(updated, null);
    return res.status(200).json(dto);
  } catch (err) {
    console.error("Error in updateCourse:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/courses/:courseId ────────────────────────────────────────────

exports.deleteCourse = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    }

    const course = await Course.findByIdAndDelete(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    }

    // Cascade: remove all enrollments, assignments, modules, lessons, completions, and announcements for this course.
    const Module = require("../models/Module");
    const Lesson = require("../models/Lesson");
    const LessonCompletion = require("../models/LessonCompletion");
    const Announcement = require("../models/Announcement");

    const lessonIds = await Lesson.find({ courseId: course._id }).distinct("_id");
    await Promise.all([
      Enrollment.deleteMany({ courseId: course._id }),
      Assignment.deleteMany({ courseId: course._id }),
      Module.deleteMany({ courseId: course._id }),
      Lesson.deleteMany({ courseId: course._id }),
      LessonCompletion.deleteMany({ lessonId: { $in: lessonIds } }),
      Announcement.deleteMany({ courseId: course._id }),
    ]);

    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteCourse:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/courses/:courseId/students ──────────────────────────────────────

exports.getCourseStudents = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      Enrollment.find({ courseId: course._id })
        .populate("studentId", "fullName email")
        .sort({ enrolledAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enrollment.countDocuments({ courseId: course._id }),
    ]);

    const data = enrollments.map((e) => ({
      id: e.studentId._id.toString(),
      name: e.studentId.fullName,
      email: e.studentId.email,
      progress: e.progress,
      enrolledAt: e.enrolledAt,
    }));

    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error in getCourseStudents:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/courses/:courseId/enroll ───────────────────────────────────────

exports.enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    }

    if (!studentId) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: { studentId: "studentId is required." },
      });
    }

    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    }

    // Verify the student exists and is actually a student
    const student = await User.findOne({ _id: studentId, role: "student", isActive: true });
    if (!student) {
      return res.status(404).json({ message: "Student not found.", code: "USER_NOT_FOUND" });
    }

    // Check for duplicate enrollment
    const existing = await Enrollment.findOne({ courseId, studentId });
    if (existing) {
      return res.status(409).json({
        message: "This student is already enrolled in the course.",
        code: "ALREADY_ENROLLED",
      });
    }

    await Enrollment.create({ courseId, studentId });

    return res.status(200).json({ message: "Student enrolled successfully." });
  } catch (err) {
    // Unique index violation fallback
    if (err.code === 11000) {
      return res.status(409).json({
        message: "This student is already enrolled in the course.",
        code: "ALREADY_ENROLLED",
      });
    }
    console.error("Error in enrollStudent:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/courses/:courseId/students/:studentId ────────────────────────

exports.unenrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(404).json({ message: "Not found.", code: "NOT_FOUND" });
    }

    const course = await resolveCourseAccess(req, res, courseId);
    if (!course) return;

    const enrollment = await Enrollment.findOneAndDelete({ courseId, studentId });
    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found.",
        code: "NOT_FOUND",
      });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Error in unenrollStudent:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};