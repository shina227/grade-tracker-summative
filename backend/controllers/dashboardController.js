const mongoose = require("mongoose");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Grade = require("../models/Grade");

// GET /dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [activeCourses, pendingAssignments, assignmentsDueThisWeek, gradeAgg] =
      await Promise.all([
        // Courses with status "active"
        Course.countDocuments({ userId, status: "active" }),

        // Assignments not yet submitted or graded
        Assignment.countDocuments({
          userId,
          status: { $nin: ["submitted", "graded"] },
        }),

        // Upcoming assignments due within the next 7 days
        Assignment.countDocuments({
          userId,
          status: { $nin: ["submitted", "graded"] },
          dueDate: { $gte: now, $lte: in7Days },
        }),

        // Average grade as a percentage — computed in DB
        Grade.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: null,
              avg: {
                $avg: { $multiply: [{ $divide: ["$score", "$maxScore"] }, 100] },
              },
            },
          },
        ]),
      ]);

    return res.json({
      activeCourses,
      pendingAssignments,
      assignmentsDueThisWeek,
      averageGrade: gradeAgg[0]?.avg ? Math.round(gradeAgg[0].avg) : 0,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};