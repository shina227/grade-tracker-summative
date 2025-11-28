import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { LuDownload, LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import {
  calculateOverallGPA,
  getLetterGrade,
  calculateGradeDistribution,
} from "../../utils/helper";
import GradeDistributionChart from "../../components/Grades/GradeDistributionChart";
import GPATrendChart from "../../components/Grades/GPATrendChart";
import { filterByTimeRange } from "../../utils/helper";

const Grades = () => {
  useUserAuth();

  const [gradesData, setGradesData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("semester");
  const filteredGrades = filterByTimeRange(gradesData, timeRange);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gradesRes, coursesRes] = await Promise.all([
          axiosInstance.get(API_PATHS.GRADES.GET_ALL_GRADES),
          axiosInstance.get(API_PATHS.COURSES.GET_ALL_COURSES),
        ]);

        if (gradesRes.data) setGradesData(gradesRes.data);
        if (coursesRes.data) setCoursesData(coursesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate GPA stats
  const overallGPA = calculateOverallGPA(filteredGrades);

  // Calculate semester GPA (mock - would need actual semester filter)
  const semesterGPA = calculateOverallGPA(gradesData);

  // Calculate total credits
  const totalCredits = filteredGrades.reduce(
    (sum, g) => sum + (g.weight || 0),
    0
  );

  // Calculate grade distribution
  const gradeDistribution = calculateGradeDistribution(filteredGrades);

  // Calculate course breakdown
  const courseBreakdown = coursesData.map((course) => {
    const courseGrades = filteredGrades.filter(
      (g) => g.courseId?._id === course._id || g.courseId === course._id
    );

    if (courseGrades.length === 0) {
      return {
        ...course,
        averageGrade: 0,
        letterGrade: "N/A",
        percentage: 0,
      };
    }

    const totalWeighted = courseGrades.reduce(
      (sum, g) => sum + (g.score * g.weight) / 100,
      0
    );
    const totalWeight = courseGrades.reduce((sum, g) => sum + g.weight, 0);
    const averageGrade =
      totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;

    return {
      ...course,
      averageGrade: averageGrade,
      letterGrade: getLetterGrade(averageGrade),
      percentage: averageGrade,
      instructor: "Instructor", // Mock data
    };
  });

  // Generate report
  const handleGenerateReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.GRADES.GENERATE_PDF, {
        responseType: "blob",
      });

      // Create a blob from the PDF stream
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "grades_report.pdf";
      document.body.appendChild(a);
      a.click();

      // Clean up
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate report.");
    }
  };

  return (
    <DashboardLayout activeMenu="Grades">
      <div className="my-5 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-lg">Grades Analytics</h1>
            <p className="text-xs text-gray-600">
              Visualize your academic progress and generate reports.
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-[13px] cursor-pointer"
          >
            <LuDownload size={16} />
            Generate Report
          </button>
        </div>

        {/* Time Range Filters */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setTimeRange("semester")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              timeRange === "semester"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            This Semester
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
              timeRange === "year"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            This Year
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
              timeRange === "all"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Time
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Overall GPA */}
          <div className="card">
            <h3 className="text-sm  text-gray-600 mb-2">Overall GPA</h3>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-medium text-gray-900">
                {overallGPA.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 text-green-600 mb-1">
                <LuTrendingUp size={16} />
                <span className="text-sm font-medium">+1.2%</span>
              </div>
            </div>
          </div>

          {/* Semester GPA */}
          <div className="card">
            <h3 className="text-sm  text-gray-600 mb-2">Semester GPA</h3>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-medium text-gray-900">
                {semesterGPA.toFixed(1)}
              </p>
              <div className="flex items-center gap-1 text-green-600 mb-1">
                <LuTrendingUp size={16} />
                <span className="text-sm font-medium">+2.5%</span>
              </div>
            </div>
          </div>

          {/* Completed Credits */}
          <div className="card">
            <h3 className="text-sm  text-gray-600 mb-2">Completed Credits</h3>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-medium text-gray-900">
                {Math.round(totalCredits)}
              </p>
              <span className="text-sm text-gray-500 mb-1">128 total</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* GPA Trend Over Time */}
          <div className="card">
            <div className="mb-6">
              <div className="flex items-end gap-2 mb-2">
                <h2 className="text-2xl font-medium text-gray-900">
                  {overallGPA.toFixed(2)} GPA
                </h2>
                <span className="text-green-600 font-medium mb-0.5">+0.15</span>
              </div>
              <p className="text-sm text-gray-500">All Time</p>
            </div>
            <GPATrendChart grades={filteredGrades} />
          </div>

          {/* Grade Distribution */}
          <div className="card">
            <div className="mb-6">
              <div className="flex items-end gap-2 mb-2">
                <h2 className="text-2xl font-medium text-gray-900">
                  {gradeDistribution.totalAs} A's
                </h2>
                <span className="text-green-600 font-medium mb-0.5">+4.0%</span>
              </div>
              <p className="text-sm text-gray-500">This Semester</p>
            </div>
            <GradeDistributionChart distribution={gradeDistribution} />
          </div>
        </div>

        {/* Course Breakdown Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-800">Breakdown by Course</h2>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Courses</option>
              {coursesData.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Course Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Term
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Current Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courseBreakdown.length > 0 ? (
                  courseBreakdown.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {course.courseName}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{course.term}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{course.year}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {course.letterGrade}{" "}
                          {course.percentage > 0 && (
                            <span className="text-gray-500">
                              ({Math.round(course.percentage)}%)
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            course.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {course.status || "In Progress"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center">
                      <p className="text-sm text-gray-500">No courses found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Grades;
