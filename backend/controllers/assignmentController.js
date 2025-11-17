const User = require("../models/User");
const Assignment = require("../models/Assignments");
const Course = require("../models/Courses");

// Add Assignment
exports.addAssignment = async (req, res) => {
  const { courseId, title, description, dueDate, weight } = req.body;
  try {
    // Check required fields
    if (!courseId || !title) {
      return res.status(400).json({ message: "Course and title are required" });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const assignment = new Assignment({
      courseId,
      title,
      description,
      dueDate,
      weight,
      userId: req.user.id,
    });

    await assignment.save();

    // Optionally push to course.assignments array
    course.assignments.push(assignment._id);
    await course.save();

    res.status(200).json(assignment);
  } catch (error) {
    console.error("Error adding assignment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Assignments
exports.getAllAssignments = async (req, res) => {
  const userId = req.user.id;

  try {
    const assignments = await Assignment.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(assignments);
  } catch (error) {
    console.error("Error getting assignments:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get assignments for a course
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      courseId: req.params.courseId,
    }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    console.error("Error getting assignments:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
