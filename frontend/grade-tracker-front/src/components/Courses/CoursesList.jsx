import React, { useState, useMemo } from "react";
import CoursesInfoCard from "../Cards/CoursesInfoCard";

const CoursesList = ({ courses, onEdit, onDelete }) => {
  const [search, setSearch] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Get unique terms and years
  const { uniqueTerms, uniqueYears } = useMemo(() => {
    const terms = new Set();
    const years = new Set();

    courses?.forEach((course) => {
      if (course.term) terms.add(course.term);
      if (course.year) years.add(course.year);
    });

    return {
      uniqueTerms: Array.from(terms).sort(),
      uniqueYears: Array.from(years).sort((a, b) => b - a),
    };
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.courseName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesTerm = termFilter ? course.term === termFilter : true;
      const matchesYear = yearFilter
        ? course.year === parseInt(yearFilter)
        : true;

      return matchesSearch && matchesTerm && matchesYear;
    });
  }, [courses, search, termFilter, yearFilter]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg">All Courses</h5>
        <p className="text-xxs text-gray-500">
          Showing {filteredCourses.length} of {courses?.length || 0}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div>
          <label className="text-[13px] text-slate-800 block mb-2">
            Search Course
          </label>
          <input
            type="text"
            placeholder="Search by course name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none text-sm"
          />
        </div>

        {/* Term filter */}
        <div>
          <label className="text-[13px] text-slate-800 block mb-2">
            Filter by Term
          </label>
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none text-sm"
          >
            <option value="">All Terms</option>
            {uniqueTerms.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="text-[13px] text-slate-800 block mb-2">
            Filter by Year
          </label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none text-sm"
          >
            <option value="">All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CoursesInfoCard
              key={course._id}
              name={course.courseName}
              term={course.term}
              year={course.year}
              status={course.status}
              onEdit={() => onEdit(course)}
              onDelete={() => onDelete(course._id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p className="text-sm">No courses found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesList;
