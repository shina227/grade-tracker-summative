const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

/**
 * DTO mapper (backend → frontend contract)
 */
const toAssignmentDTO = (assignment) => ({
  id: assignment._id.toString(),
  title: assignment.title,
  courseId: assignment.courseId?._id?.toString() || assignment.courseId,
  courseName: assignment.courseId?.title || "Unknown",
  dueDate: assignment.dueDate.toISOString(),
  status: assignment.status,
});

/**
 * GET /assignments
 */
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      userId: req.user.id,
    })
      .populate("courseId", "title")
      .sort({ dueDate: 1 });

    return res.json(assignments.map(toAssignmentDTO));
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * GET /assignments/:id
 */
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("courseId", "title");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.json(toAssignmentDTO(assignment));
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * POST /assignments
 */
exports.addAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate } = req.body;

    if (!courseId || !title || !dueDate) {
      return res.status(400).json({
        message: "Course, title, and due date are required",
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      userId: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const assignment = await Assignment.create({
      userId: req.user.id,
      courseId,
      title,
      description: description || "",
      dueDate,
      status: "upcoming",
    });

    const populated = await Assignment.findById(
      assignment._id
    ).populate("courseId", "title");

    return res.status(201).json(toAssignmentDTO(populated));
  } catch (error) {
    console.error("Error creating assignment:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * POST /assignments/:id/submit
 */
exports.submitAssignment = async (req, res) => {
  try {
    const { content, fileUrl } = req.body;

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.submissionContent = content || "";
    assignment.fileUrl = fileUrl || "";
    assignment.submittedAt = new Date();
    assignment.status = "submitted";

    await assignment.save();

    return res.status(204).send();
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * PATCH /assignments/:id
 */
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const allowedFields = [
      "title",
      "description",
      "dueDate",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        assignment[field] = req.body[field];
      }
    });

    await assignment.save();

    const populated = await Assignment.findById(
      assignment._id
    ).populate("courseId", "title");

    return res.json(toAssignmentDTO(populated));
  } catch (error) {
    console.error("Error updating assignment:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * DELETE /assignments/:id
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const deleted = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};