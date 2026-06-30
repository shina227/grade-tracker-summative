const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Grade = require("../models/Grade");

// ─── GET /v1/dashboard/student ───────────────────────────────────────────────

exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Enrolled active course IDs
    const enrollments = await Enrollment.find({ studentId: userId }).select("courseId").lean();
    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    // Get IDs of all assignments in enrolled courses
    const allEnrolledAssignments = await Assignment.find({ courseId: { $in: enrolledCourseIds } })
      .select("_id dueDate status")
      .lean();

    // Get IDs of assignments student has already submitted
    const submittedList = await Submission.find({
      studentId: userId,
      assignmentId: { $in: allEnrolledAssignments.map((a) => a._id) },
    }).select("assignmentId").lean();
    const submittedSet = new Set(submittedList.map((s) => s.assignmentId.toString()));

    // Filter pending assignments (not yet submitted, and assignment is not closed)
    const pending = allEnrolledAssignments.filter(
      (a) => !submittedSet.has(a._id.toString()) && a.status !== "closed"
    );

    const pendingAssignments = pending.length;
    const assignmentsDueThisWeek = pending.filter(
      (a) => new Date(a.dueDate) >= now && new Date(a.dueDate) <= in7Days
    ).length;

    const [activeCourses, gradeAgg] = await Promise.all([
      Course.countDocuments({ _id: { $in: enrolledCourseIds }, status: "active" }),
      Grade.aggregate([
        { $match: { studentId: userId } },
        {
          $group: {
            _id: null,
            avg: { $avg: { $multiply: [{ $divide: ["$score", "$maxScore"] }, 100] } },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      activeCourses,
      pendingAssignments,
      averageGrade: gradeAgg[0]?.avg ? Math.round(gradeAgg[0].avg) : 0,
      assignmentsDueThisWeek,
    });
  } catch (err) {
    console.error("Student dashboard error:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/dashboard/teacher ───────────────────────────────────────────────

exports.getTeacherDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    // Active courses taught
    const teacherCourses = await Course.find({ instructorId: userId, status: "active" })
      .select("_id")
      .lean();
    const courseIds = teacherCourses.map((c) => c._id);

    // All assignments in taught courses
    const teacherAssignments = await Assignment.find({ courseId: { $in: courseIds } })
      .select("_id")
      .lean();
    const assignmentIds = teacherAssignments.map((a) => a._id);

    const [uniqueStudents, pendingSubmissions, avgGradeAgg, assignmentsThisWeek] = await Promise.all([
      Enrollment.distinct("studentId", { courseId: { $in: courseIds } }),
      Submission.countDocuments({ assignmentId: { $in: assignmentIds }, status: "submitted" }),
      Grade.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        {
          $group: {
            _id: null,
            avg: { $avg: { $multiply: [{ $divide: ["$score", "$maxScore"] }, 100] } },
          },
        },
      ]),
      Assignment.countDocuments({
        courseId: { $in: courseIds },
        createdAt: { $gte: startOfWeek },
      }),
    ]);

    return res.status(200).json({
      activeCourses: teacherCourses.length,
      totalStudents: uniqueStudents.length,
      pendingSubmissions,
      averageClassGrade: avgGradeAgg[0]?.avg ? Math.round(avgGradeAgg[0].avg) : 0,
      assignmentsPublishedThisWeek: assignmentsThisWeek,
    });
  } catch (err) {
    console.error("Teacher dashboard error:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};