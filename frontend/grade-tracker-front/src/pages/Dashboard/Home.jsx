import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import UpcomingAssignments from "../../components/Dashboard/UpcomingAssignments";
import CourseOverview from "../../components/Dashboard/CourseOverview";
import OverallGPA from "../../components/Dashboard/OverallGPA";
import RecentGrades from "../../components/Dashboard/RecentGrades";
import { calculateOverallGPA, getLetterGrade } from "../../utils/helper";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [assignmentsData, setAssignmentsData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [gradesData, setGradesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [a, c, g] = await Promise.all([
        axiosInstance.get(API_PATHS.ASSIGNMENTS.GET_ALL_ASSIGNMENTS),
        axiosInstance.get(API_PATHS.COURSES.GET_ALL_COURSES),
        axiosInstance.get(API_PATHS.GRADES.GET_ALL_GRADES),
      ]);

      setAssignmentsData(a.data);
      setCoursesData(c.data);
      setGradesData(g.data);
    };

    fetchData();
  }, []);

  const upcomingAssignments = assignmentsData
    .filter((a) => a.status === "Pending")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const recentGrades = [...gradesData]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const overallGPA = calculateOverallGPA(gradesData);

  const courseGrades = coursesData.map((course) => {
    const courseGrades = gradesData.filter(
      (g) => g.courseId?._id === course._id || g.courseId === course._id
    );

    if (courseGrades.length === 0)
      return { ...course, averageGrade: 0, letterGrade: "N/A" };

    const totalWeighted = courseGrades.reduce(
      (sum, g) => sum + (g.score * g.weight) / 100,
      0
    );

    const totalWeight = courseGrades.reduce((sum, g) => sum + g.weight, 0);

    const averageGrade = totalWeight ? (totalWeighted / totalWeight) * 100 : 0;

    return {
      ...course,
      averageGrade,
      letterGrade: getLetterGrade(averageGrade),
    };
  });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-green-600 bg-green-100 border-green-200";
    if (grade >= 80) return "text-blue-600 bg-blue-100 border-blue-200";
    if (grade >= 70) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    if (grade >= 60) return "text-orange-600 bg-orange-100 border-orange-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">
            Welcome back, {user?.fullName?.split(" ")[0] || "Student"}!
          </h2>
          <p className="text-sm text-gray-700">
            Here's a summary of your academic progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UpcomingAssignments
              upcomingAssignments={upcomingAssignments}
              navigate={navigate}
              formatDate={formatDate}
            />

            <CourseOverview
              courseGrades={courseGrades}
              navigate={navigate}
              getGradeColor={getGradeColor}
            />
          </div>

          <div className="space-y-6">
            <OverallGPA overallGPA={overallGPA} />

            <RecentGrades
              recentGrades={recentGrades}
              navigate={navigate}
              getGradeColor={getGradeColor}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
