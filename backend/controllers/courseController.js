const Course = require("../models/Course");
const Assignment = require("../models/Assignment");

// -------------------------
// DTO MAPPER
// -------------------------
const toCourseDTO = async (course) => {
  const taskCount = await Assignment.countDocuments({
    courseId: course._id,
  });

  return {
    id: course._id.toString(),
    title: course.title,
    instructor: course.instructor,
    taskCount,
    progress: course.progress,
  };
};

// -------------------------
// ADD COURSE
// -------------------------
exports.addCourse = async (req, res) => {
  const userId = req.user.id;

  try {
    const {
      title,
      instructor,
      term,
      year,
      progress,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const newCourse = new Course({
      userId,
      title,
      instructor,
      term,
      year,
      progress: progress ?? 0,
      status: status ?? "active",
    });

    await newCourse.save();

    return res.status(201).json(await toCourseDTO(newCourse));
  } catch (error) {
    console.error("Error adding course:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// -------------------------
// GET ALL COURSES
// -------------------------
exports.getAllCourses = async (req, res) => {
  const userId = req.user.id;

  try {
    const courses = await Course.find({ userId }).sort({
      createdAt: -1,
    });

    const courseDTOs = await Promise.all(
      courses.map(toCourseDTO)
    );

    return res.json(courseDTOs);
  } catch (error) {
    console.error("Error getting courses:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// -------------------------
// GET ONE COURSE
// -------------------------
exports.getCourse = async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.id;

  try {
    const course = await Course.findOne({
      _id: courseId,
      userId,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.json(await toCourseDTO(course));
  } catch (error) {
    console.error("Error getting course:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// -------------------------
// UPDATE COURSE
// -------------------------
exports.updateCourse = async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.id;

  try {
    const course = await Course.findOne({
      _id: courseId,
      userId,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const updates = {};

    const allowedFields = [
      "title",
      "instructor",
      "term",
      "year",
      "progress",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.json(await toCourseDTO(updatedCourse));
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// -------------------------
// DELETE COURSE
// -------------------------
exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};