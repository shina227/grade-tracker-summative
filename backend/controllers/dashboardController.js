const Course = require("../models/Courses");
const Assignment = require("../models/Assignments");
const Grade = require("../models/Grades");

// Get Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total Courses
    const totalCourses = await Course.countDocuments({ userId });

    // Total Assignments
    const totalAssignments = await Assignment.countDocuments({ userId });

    // Average Grade
    const grades = await Grade.find({ userId });
    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
        : 0;

    // Completed vs In-progress courses
    const completedCourses = await Course.countDocuments({
      userId,
      status: "Completed",
    });
    const inProgressCourses = await Course.countDocuments({
      userId,
      status: "In Progress",
    });

    // Assignments due within the next 30 days
    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);

    const upcomingAssignments = await Assignment.find({
      userId,
      dueDate: { $gte: now, $lte: next30Days },
    }).sort({ dueDate: 1 });

    // Final dashboard summary
    res.status(200).json({
      totalCourses,
      totalAssignments,
      averageGrade: averageGrade.toFixed(2),
      completedCourses,
      inProgressCourses,
      upcomingAssignments,
    });
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
