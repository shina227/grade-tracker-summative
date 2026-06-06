const Course = require("../models/Course");

const toCourseDTO = (course) => {
  return {
    id: course._id.toString(),
    title: course.courseName,
    instructor: "Unknown", // not in DB yet
    taskCount: course.assignments?.length || 0,
    progress: course.currentGrade || 0,
  };
};

// ADD COURSE
exports.addCourse = async (req, res) => {
  const userId = req.user.id;

  try {
    const { courseName, term, year, assignments, currentGrade, status } =
      req.body;

    if (!courseName || !term || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCourse = new Course({
      userId,
      courseName,
      term,
      year,
      assignments: assignments || [],
      currentGrade: currentGrade || 0,
      status: status || "In Progress",
    });

    await newCourse.save();

    return res.status(201).json(toCourseDTO(newCourse));
  } catch (error) {
    console.error("Error adding course:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL COURSES
exports.getAllCourses = async (req, res) => {
  const userId = req.user.id;

  try {
    const courses = await Course.find({ userId }).sort({ createdAt: -1 });

    return res.json(courses.map(toCourseDTO));
  } catch (error) {
    console.error("Error getting courses:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


// GET ONE COURSE
exports.getCourse = async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.id;

  try {
    const course = await Course.findOne({
      _id: courseId,
      userId,
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json(toCourseDTO(course));
  } catch (error) {
    console.error("Error getting course:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE COURSE
exports.updateCourse = async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.id;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized to update this course",
      });
    }

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

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updates,
      { new: true }
    );

    return res.json(toCourseDTO(updatedCourse));
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// DELETE COURSE
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    return res.json({ message: "Course deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};