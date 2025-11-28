const User = require("../models/User");
const Assignment = require("../models/Assignments");
const Course = require("../models/Courses");
const Grade = require("../models/Grades");

// Add Assignment
exports.addAssignment = async (req, res) => {
  const { courseId, title, description, dueDate, grade, weight, status } =
    req.body;
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
      grade,
      status,
      userId: req.user.id,
    });

    await assignment.save();

    course.assignments.push(assignment._id);
    await course.save();

    // create a grade record if grade is provided
    if (grade !== undefined) {
      const newGrade = new Grade({
        userId: req.user.id,
        courseId,
        assignmentId: assignment._id,
        score: grade,
        weight: weight || 0,
      });
      await newGrade.save();
    }

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
    const assignments = await Assignment.find({ userId })
      .populate("courseId", "courseName term year status")
      .sort({ createdAt: -1 });

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
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    // update fields
    const { title, description, dueDate, grade, weight, status } = req.body;
    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    if (status !== undefined) assignment.status = status;
    if (grade !== undefined) assignment.grade = grade;
    if (weight !== undefined) assignment.weight = weight;

    await assignment.save();

    // Update or create corresponding grade
    if (grade !== undefined) {
      const existingGrade = await Grade.findOne({
        assignmentId: assignment._id,
      });
      if (existingGrade) {
        existingGrade.score = grade;
        existingGrade.weight = weight || existingGrade.weight;
        await existingGrade.save();
      } else {
        const newGrade = new Grade({
          userId: assignment.userId,
          courseId: assignment.courseId,
          assignmentId: assignment._id,
          score: grade,
          weight: weight || 0,
        });
        await newGrade.save();
      }
    }

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
