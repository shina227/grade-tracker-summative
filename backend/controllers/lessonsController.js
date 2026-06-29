const mongoose = require("mongoose");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const LessonCompletion = require("../models/LessonCompletion");
const Module = require("../models/Module");

// Helper to recalculate course and module progress for a student
const updateStudentProgress = async (courseId, studentId) => {
  const allLessonsInCourse = await Lesson.find({ courseId }).select("_id moduleId").lean();
  if (allLessonsInCourse.length === 0) return { moduleProgress: 0, courseProgress: 0 };

  const lessonIds = allLessonsInCourse.map((l) => l._id);
  const completedCount = await LessonCompletion.countDocuments({
    lessonId: { $in: lessonIds },
    studentId,
  });

  const courseProgress = Math.round((completedCount / allLessonsInCourse.length) * 100);

  // Update Enrollment record
  await Enrollment.findOneAndUpdate(
    { courseId, studentId },
    { progress: courseProgress }
  );

  return { courseProgress };
};

// ─── GET /v1/lessons/:lessonId ───────────────────────────────────────────────

exports.getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(404).json({ message: "Lesson not found.", code: "NOT_FOUND" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found.", code: "NOT_FOUND" });
    }

    const course = await Course.findById(lesson.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    }

    const { role, _id: userId } = req.user;

    if (role === "teacher" && course.instructorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden", code: "FORBIDDEN" });
    }

    if (role === "student") {
      const enrollment = await Enrollment.findOne({ courseId: course._id, studentId: userId });
      if (!enrollment || course.status !== "active") {
        return res.status(403).json({ message: "Course is not active or not enrolled.", code: "FORBIDDEN" });
      }
    }

    let isCompleted = false;
    if (role === "student") {
      const completion = await LessonCompletion.findOne({ lessonId: lesson._id, studentId: userId });
      isCompleted = !!completion;
    }

    return res.status(200).json({
      id: lesson._id.toString(),
      moduleId: lesson.moduleId.toString(),
      courseId: lesson.courseId.toString(),
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      status: role === "student" ? (isCompleted ? "completed" : "not_started") : null,
      order: lesson.order,
      description: lesson.description,
      overview: lesson.overview,
      videoUrl: lesson.videoUrl,
    });
  } catch (err) {
    console.error("Error in getLesson:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/lessons/:lessonId ──────────────────────────────────────────────

exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(404).json({ message: "Lesson not found.", code: "NOT_FOUND" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found.", code: "NOT_FOUND" });
    }

    const course = await Course.findById(lesson.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    }

    if (req.user.role === "teacher" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden", code: "FORBIDDEN" });
    }

    const ALLOWED = ["title", "type", "duration", "description", "overview", "order", "videoUrl"];
    const updates = {};
    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Lesson.findByIdAndUpdate(lessonId, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      id: updated._id.toString(),
      moduleId: updated.moduleId.toString(),
      courseId: updated.courseId.toString(),
      title: updated.title,
      type: updated.type,
      duration: updated.duration,
      order: updated.order,
      description: updated.description,
      overview: updated.overview,
      videoUrl: updated.videoUrl,
    });
  } catch (err) {
    console.error("Error in updateLesson:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/lessons/:lessonId ────────────────────────────────────────────

exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(404).json({ message: "Lesson not found.", code: "NOT_FOUND" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found.", code: "NOT_FOUND" });
    }

    const course = await Course.findById(lesson.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found.", code: "NOT_FOUND" });
    }

    if (req.user.role === "teacher" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden", code: "FORBIDDEN" });
    }

    await Lesson.findByIdAndDelete(lessonId);
    await LessonCompletion.deleteMany({ lessonId });

    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteLesson:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/lessons/:lessonId/complete ─────────────────────────────────────

exports.completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(404).json({ message: "Lesson not found.", code: "NOT_FOUND" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found.", code: "NOT_FOUND" });
    }

    const studentId = req.user._id;
    const enrollment = await Enrollment.findOne({ courseId: lesson.courseId, studentId });
    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled in this course.", code: "FORBIDDEN" });
    }

    // Idempotent completion
    await LessonCompletion.findOneAndUpdate(
      { lessonId, studentId },
      { completedAt: new Date() },
      { upsert: true, new: true }
    );

    // Calculate progress for module and course
    const moduleLessons = await Lesson.find({ moduleId: lesson.moduleId }).select("_id").lean();
    const moduleLessonIds = moduleLessons.map((l) => l._id);
    const completedModuleCount = await LessonCompletion.countDocuments({
      lessonId: { $in: moduleLessonIds },
      studentId,
    });
    const moduleProgress = Math.round((completedModuleCount / moduleLessons.length) * 100);

    const { courseProgress } = await updateStudentProgress(lesson.courseId, studentId);

    return res.status(200).json({
      lessonId: lesson._id.toString(),
      status: "completed",
      moduleProgress,
      courseProgress,
    });
  } catch (err) {
    console.error("Error in completeLesson:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};
