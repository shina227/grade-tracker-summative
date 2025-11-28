import React, { useState, useMemo } from "react";
import AssignmentsInfoCard from "../Cards/AssignmentsInfoCard";

const TABS = ["List", "Calendar"];

const AssignmentsList = ({ assignments, onDelete, onEdit }) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("List");

  // Search assignments
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];

    return assignments.filter((assignment) => {
      assignment.title.toLowerCase().includes(search.toLowerCase());
    });
  }, [assignments, search]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
      {/* Search */}
      <div className="w-full md:w-3/4">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm">
          <input
            type="text"
            placeholder="Find assignments by name or course"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full md:w-1/4 flex justify-end">
        <div className="flex bg-gray-100 rounded-lg p-1 border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition ${
                activeTab === tab
                  ? "bg-white text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
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
