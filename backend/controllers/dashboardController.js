const Course = require("../models/Courses");
const Assignment = require("../models/Assignments");
const Grade = require("../models/Grades");

// Get Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    // Courses
    const activeCourses = await Course.countDocuments({
      userId,
      status: { $ne: "Completed" },
    });

    // Assignments (all)
    const allAssignments = await Assignment.find({ userId });

    const pendingAssignments = allAssignments.filter(
      (a) => a.status === "Pending"
    ).length;

    const assignmentsDueThisWeek = allAssignments.filter(
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
    console.error("Error getting dashboard data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
