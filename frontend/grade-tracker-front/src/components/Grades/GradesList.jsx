import React, { useState, useMemo } from "react";
import { LuPlus } from "react-icons/lu";
import GradesInfoCard from "../Cards/GradesInfoCard";

const GradesList = ({ grades, onAddGrade, onDelete, onEdit }) => {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");

  // Extract unique courses
  const uniqueCourses = useMemo(() => {
    if (!grades) return [];
    const courseNames = grades.map(
      (g) => g.courseId?.courseName || "Unknown Course"
    );
    return [...new Set(courseNames)].sort();
  }, [grades]);

  // Filtered Grades
  const filteredGrades = useMemo(() => {
    if (!grades) return [];
    return grades.filter((grade) => {
      const assignmentName = grade.assignmentId?.title?.toLowerCase() || "";

      const matchesSearch = assignmentName.includes(search.toLowerCase());

      const matchesCourse = courseFilter
        ? grade.courseId?.courseName === courseFilter
        : true;

      const matchesScore = scoreFilter
        ? parseInt(grade.score) >= parseInt(scoreFilter)
        : true;

      return matchesSearch && matchesCourse && matchesScore;
    });
  }, [grades, search, courseFilter, scoreFilter]);

  return (
    <div className="card">
      {/* Search + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div>
          <label className="text-sm text-slate-800 block mb-2">
            Search Assignment
          </label>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Course Filter */}
        <div>
          <label className="text-sm text-slate-800 block mb-2">
            Filter by Course
          </label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        {/* Score Filter */}
        <div>
          <label className="text-sm text-slate-800 block mb-2">
            Minimum Score
          </label>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            <option value="50">≥ 50%</option>
            <option value="60">≥ 60%</option>
            <option value="70">≥ 70%</option>
            <option value="80">≥ 80%</option>
            <option value="90">≥ 90%</option>
          </select>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg">All Grades</h5>
        <p className="text-xs text-gray-500">
          Showing {filteredGrades.length} of {grades?.length || 0}
        </p>
      </div>

      {/* Grades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGrades.length > 0 ? (
          filteredGrades.map((grade) => (
            <GradesInfoCard
              key={grade._id}
              assignmentName={grade.assignmentId?.title}
              courseName={grade.courseId?.courseName}
              score={grade.score}
              weight={grade.weight}
              onDelete={() => onDelete(grade._id)}
              onEdit={() => onEdit(grade._id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p className="text-sm">No grades found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesList;
