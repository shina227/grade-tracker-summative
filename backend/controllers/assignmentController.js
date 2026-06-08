const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

// HELPERS

const computeStatus = (assignment) => {
  if (["submitted", "graded"].includes(assignment.status)) {
    return assignment.status;
  }

  const daysUntilDue =
    (new Date(assignment.dueDate) - Date.now()) / (1000 * 60 * 60 * 24);

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue < 1) return "due_tomorrow";
  if (daysUntilDue < 3) return "due_soon";
  return "upcoming";
};

const toAssignmentDTO = (assignment) => ({
  id: assignment._id.toString(),
  title: assignment.title,
  courseId: assignment.courseId?._id?.toString() ?? assignment.courseId.toString(),
  courseName: assignment.courseId?.title ?? "Unknown",
  dueDate: assignment.dueDate.toISOString(),
  status: computeStatus(assignment),
});

// GET /assignments
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user.id })
      .populate("courseId", "title")
      .sort({ dueDate: 1 });

    return res.json(assignments.map(toAssignmentDTO));
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /assignments/:id
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
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /assignments
exports.addAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate } = req.body;

    if (!courseId || !title || !dueDate) {
      return res.status(400).json({
        message: "courseId, title, and dueDate are required",
      });
    }

    // Ensure the course belongs to this user
    const course = await Course.findOne({ _id: courseId, userId: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const assignment = await Assignment.create({
      userId: req.user.id,
      courseId,
      title,
      description: description ?? "",
      dueDate,
    });

    // Populate in one step after creation
    await assignment.populate("courseId", "title");

    return res.status(201).json(toAssignmentDTO(assignment));
  } catch (error) {
    console.error("Error creating assignment:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /assignments/:id
exports.updateAssignment = async (req, res) => {
  const allowedFields = ["title", "description", "dueDate"];

  try {
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]])
    );

    const updated = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    ).populate("courseId", "title");

    if (!updated) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.json(toAssignmentDTO(updated));
  } catch (error) {
    console.error("Error updating assignment:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /assignments/:id/submit
exports.submitAssignment = async (req, res) => {
  try {
    const updated = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        submissionContent: req.body.content ?? "",
        fileUrl: req.body.fileUrl ?? "",
        submittedAt: new Date(),
        status: "submitted",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /assignments/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const deleted = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return res.status(500).json({ message: "Server error" });
  }
};