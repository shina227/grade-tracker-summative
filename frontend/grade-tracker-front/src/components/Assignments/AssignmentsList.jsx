import React, { useState, useMemo } from "react";
import { LuPlus } from "react-icons/lu";
import AssignmentsInfoCard from "../Cards/AssignmentsInfoCard";

const AssignmentsList = ({
  assignments,
  onAddAssignment,
  onDelete,
  onEdit,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  // Get unique courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    const courses = assignments?.map(
      (a) => a.courseId?.courseName || "Unknown Course"
    );
    return [...new Set(courses)].sort();
  }, [assignments]);

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];

    return assignments.filter((assignment) => {
      const matchesSearch = assignment.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter
        ? assignment.status === statusFilter
        : true;
      const matchesCourse = courseFilter
        ? (assignment.courseId?.courseName || "Unknown Course") === courseFilter
        : true;

      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [assignments, search, statusFilter, courseFilter]);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="">
          <h5 className="text-lg">Assignments Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Keep track of all your assignments
          </p>
        </div>

        <button className="add-btn" onClick={onAddAssignment}>
          <LuPlus className="text-lg" /> Add Assignment
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search Input */}
        <div>
          <label className="text-[13px] text-slate-800 block mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none text-sm"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-[13px] text-slate-800 block mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Course Filter */}
        <div>
          <label className="text-[13px] text-slate-800 block mb-2">
            Filter by Course
          </label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full bg-transparent border border-gray-300 rounded px-3 py-2 outline-none text-sm"
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section Title & Results Count */}
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg">All Assignments</h5>
        <p className="text-xs text-gray-500">
          Showing {filteredAssignments.length} of {assignments?.length || 0}
        </p>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <AssignmentsInfoCard
              key={assignment._id}
              title={assignment.title}
              courseName={assignment.courseId?.courseName || "Unknown Course"}
              dueDate={assignment.dueDate}
              weight={assignment.weight}
              grade={assignment.grade}
              status={assignment.status}
              onEdit={() => onEdit(assignment._id)}
              onDelete={() => onDelete(assignment._id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p className="text-sm">
              No assignments found matching your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsList;
