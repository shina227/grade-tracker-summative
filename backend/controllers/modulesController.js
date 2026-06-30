const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Verifies the requesting user has access to the given course.
 * Returns the course doc on success, sends the error response and returns null on failure.
 */
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

/**
 * Builds the module DTO.
 * completedCount is only meaningful for students — 0 for teachers/admins.
 */
const toModuleDTO = async (mod, studentId = null) => {
  const [lessonCount, completedCount] = await Promise.all([
    Lesson.countDocuments({ moduleId: mod._id }),
    studentId
      ? LessonCompletion.countDocuments({
          lessonId: {
            $in: await Lesson.find({ moduleId: mod._id }).distinct("_id"),
          },
          studentId,
        })
      : Promise.resolve(0),
  ]);

  return {
    id: mod._id.toString(),
    courseId: mod.courseId.toString(),
    title: mod.title,
    order: mod.order,
    lessonCount,
    completedCount,
  };
};

// ─── GET /v1/courses/:courseId/modules ───────────────────────────────────────

exports.listModules = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [modules, total] = await Promise.all([
      Module.find({ courseId: course._id })
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Module.countDocuments({ courseId: course._id }),
    ]);

    const studentId = req.user.role === "student" ? req.user._id : null;
    const data = await Promise.all(modules.map((m) => toModuleDTO(m, studentId)));

    return res.status(200).json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error in listModules:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/courses/:courseId/modules ──────────────────────────────────────

exports.createModule = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const { title, order } = req.body;
    if (!title) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: { title: "Title is required." },
      });
    }

    const mod = await Module.create({
      courseId: course._id,
      title,
      order: order ?? 1,
    });

    const dto = await toModuleDTO(mod, null);
    return res.status(201).json(dto);
  } catch (err) {
    console.error("Error in createModule:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/courses/:courseId/modules/:moduleId ───────────────────────────

exports.updateModule = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const { moduleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(404).json({ message: "Module not found.", code: "NOT_FOUND" });
    }

    const ALLOWED = ["title", "order"];
    const updates = {};
    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const mod = await Module.findOneAndUpdate(
      { _id: moduleId, courseId: course._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!mod) return res.status(404).json({ message: "Module not found.", code: "NOT_FOUND" });

    const dto = await toModuleDTO(mod, null);
    return res.status(200).json(dto);
  } catch (err) {
    console.error("Error in updateModule:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/courses/:courseId/modules/:moduleId ──────────────────────────

exports.deleteModule = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const { moduleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(404).json({ message: "Module not found.", code: "NOT_FOUND" });
    }

    const mod = await Module.findOneAndDelete({ _id: moduleId, courseId: course._id });
    if (!mod) return res.status(404).json({ message: "Module not found.", code: "NOT_FOUND" });

    // Cascade: remove all lessons in this module and their completion records
    const lessonIds = await Lesson.find({ moduleId: mod._id }).distinct("_id");
    await Promise.all([
      Lesson.deleteMany({ moduleId: mod._id }),
      LessonCompletion.deleteMany({ lessonId: { $in: lessonIds } }),
    ]);

    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteModule:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/courses/:courseId/modules/:moduleId/lessons ─────────────────────

exports.listLessons = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const { moduleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(404).json({ message: "Module not found.", code: "NOT_FOUND" });
    }

    const mod = await Module.findOne({ _id: moduleId, courseId: course._id });
    if (!mod) return res.status(404).json({ message: "Module not found.", code: "NOT_FOUND" });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [lessons, total] = await Promise.all([
      Lesson.find({ moduleId: mod._id }).sort({ order: 1 }).skip(skip).limit(limit).lean(),
      Lesson.countDocuments({ moduleId: mod._id }),
    ]);

    // For students, fetch which lessons they've completed in one query
    let completedSet = new Set();
    if (req.user.role === "student") {
      const lessonIds = lessons.map((l) => l._id);
      const completions = await LessonCompletion.find({
        lessonId: { $in: lessonIds },
        studentId: req.user._id,
      }).select("lessonId").lean();
      completedSet = new Set(completions.map((c) => c.lessonId.toString()));
    }

    const data = lessons.map((l) => ({
      id: l._id.toString(),
      moduleId: l.moduleId.toString(),
      title: l.title,
      type: l.type,
      duration: l.duration ?? null,
      status: req.user.role === "student"
        ? (completedSet.has(l._id.toString()) ? "completed" : "not_started")
        : null,
      order: l.order,
      description: l.description,
      overview: l.overview,
    }));

    return res.status(200).json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error in listLessons:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/courses/:courseId/modules/:moduleId/lessons ────────────────────

exports.createLesson = async (req, res) => {
  try {
    const course = await resolveCourseAccess(req, res, req.params.courseId);
    if (!course) return;

    const { moduleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(404).json({ message: "Module not found.", code: "NOT_FOUND" });
    }

    const mod = await Module.findOne({ _id: moduleId, courseId: course._id });
    if (!mod) return res.status(404).json({ message: "Module not found.", code: "NOT_FOUND" });

    const { title, type, duration, description, overview, order, videoUrl } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: { title: "Title is required." },
      });
    }

    const lesson = await Lesson.create({
      moduleId: mod._id,
      courseId: course._id,
      title,
      type: type ?? "other",
      duration: duration ?? null,
      description: description ?? "",
      overview: overview ?? "",
      order: order ?? 1,
      videoUrl: videoUrl ?? null,
    });

    return res.status(201).json({
      id: lesson._id.toString(),
      moduleId: lesson.moduleId.toString(),
      courseId: lesson.courseId.toString(),
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      status: null,
      order: lesson.order,
      description: lesson.description,
      overview: lesson.overview,
      videoUrl: lesson.videoUrl,
    });
  } catch (err) {
    console.error("Error in createLesson:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};
