const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Grade = require("../models/Grade");

// Get Dashboard Stats (frontend contract)
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    // Active courses
    const activeCourses = await Course.countDocuments({
      userId,
      status: { $ne: "Completed" },
    });

    // Assignments
    const assignments = await Assignment.find({ userId });

    const pendingAssignments = assignments.filter(
      (a) => a.status === "Pending"
    ).length;

    const assignmentsDueThisWeek = assignments.filter(
      (a) =>
        a.dueDate &&
        a.dueDate >= now &&
        a.dueDate <= next7Days &&
        a.status !== "Completed"
    ).length;

    // Grades
    const grades = await Grade.find({ userId });

    const averageGrade =
      grades.length > 0
        ? Number(
            (
              grades.reduce((sum, g) => sum + g.score, 0) / grades.length
            ).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      activeCourses,
      pendingAssignments,
      averageGrade,
      assignmentsDueThisWeek,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};