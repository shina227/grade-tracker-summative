const mongoose = require("mongoose");
const Course = require("../models/Course");

// Single aggregation pipeline — fetches courses with taskCount in one DB round-trip
const coursesWithTaskCount = (matchStage) =>
  Course.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "assignments",
        localField: "_id",
        foreignField: "courseId",
        as: "tasks",
      },
    },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        title: 1,
        instructor: 1,
        progress: 1,
        taskCount: { $size: "$tasks" },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

// GET /courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await coursesWithTaskCount({
      userId: new mongoose.Types.ObjectId(req.user.id),
    });
    return res.json(courses);
  } catch (error) {
    console.error("Error getting courses:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /courses/:id
exports.getCourse = async (req, res) => {
  try {
    const [course] = await coursesWithTaskCount({
      _id: new mongoose.Types.ObjectId(req.params.id),
      userId: new mongoose.Types.ObjectId(req.user.id),
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    return res.json(course);
  } catch (error) {
    console.error("Error getting course:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /courses
exports.addCourse = async (req, res) => {
  try {
    const { title, instructor, term, year, progress, status } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const course = await Course.create({
      userId: req.user.id,
      title,
      instructor,
      term,
      year,
      progress: progress ?? 0,
      status: status ?? "active",
    });

    const [courseDTO] = await coursesWithTaskCount({ _id: course._id });
    return res.status(201).json(courseDTO);
  } catch (error) {
    console.error("Error adding course:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /courses/:id
exports.updateCourse = async (req, res) => {
  const allowedFields = ["title", "instructor", "term", "year", "progress", "status"];

  try {
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]])
    );

    const updated = await Course.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Course not found" });

    const [courseDTO] = await coursesWithTaskCount({ _id: updated._id });
    return res.json(courseDTO);
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Course not found" });

    return res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({ message: "Server error" });
  }
};