const User = require("../models/User");
const Courses = require("../models/Courses");

// Add Course
exports.addCourse = async (req, res) => {
  const userId = req.user.id;

  try {
    const { courseName, term, year, assignments, currentGrade, status } =
      req.body;

    // Check for missing fields
    if (!courseName || !term || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCourse = new Courses({
      userId,
      courseName,
      term,
      year,
      assignments: assignments || [],
      currentGrade: currentGrade || 0,
      status: status || "In Progress",
    });

    await newCourse.save();
    res.status(200).json(newCourse);
  } catch (error) {
    console.error("Error adding course:", error);

    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Courses
exports.getAllCourses = async (req, res) => {
  const userId = req.user.id;

  try {
    const courses = await Courses.find({ userId }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error("Error getting courses:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Course details
exports.updateCourse = async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.id;

  try {
    // Find the course by ID
    const course = await Courses.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Make sure the logged-in user owns the course
    if (course.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    // Update only the fields provided in req.body
    const updates = {};
    const allowedFields = [
      "courseName",
      "term",
      "year",
      "assignments",
      "currentGrade",
      "status",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedCourse = await Courses.findByIdAndUpdate(courseId, updates, {
      new: true,
    });

    res.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
  try {
    await Courses.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
