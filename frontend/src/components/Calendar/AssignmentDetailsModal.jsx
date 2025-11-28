import React from "react";
import {
  LuCalendar,
  LuBookOpen,
  LuPercent,
  LuClipboardCheck,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";

const AssignmentDetailsModal = ({ assignment, onEdit, onDelete }) => {
  // Status styles
  const getStatusStyles = () => {
    switch (assignment.status) {
      case "Pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
        };
      case "Completed":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-200",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          border: "border-gray-200",
        };
    }
  };

  const statusStyles = getStatusStyles();

  // Format date
  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if overdue
  const isOverdue = () => {
    if (!assignment.dueDate || assignment.status === "Completed") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(assignment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div className="space-y-4">
      {/* Assignment Title */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {assignment.title}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text} border ${statusStyles.border}`}
          >
            {assignment.status}
          </span>
          {isOverdue() && (
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Course */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
            <LuBookOpen size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Course</p>
            <p className="text-sm font-medium text-gray-800">
              {assignment.courseId?.courseName || "Unknown Course"}
            </p>
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded">
            <LuCalendar size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Due Date</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(assignment.dueDate)}
            </p>
          </div>
        </div>

        {/* Weight */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 rounded">
            <LuPercent size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Weight</p>
            <p className="text-sm font-medium text-gray-800">
              {assignment.weight}%
            </p>
          </div>
        </div>

        {/* Grade */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded">
            <LuClipboardCheck size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Grade</p>
            <p className="text-sm font-medium text-gray-800">
              {assignment.grade}%
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <LuPencil size={16} />
          Edit Assignment
        </button>
        <button
          onClick={() => onDelete(assignment._id)}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LuTrash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default AssignmentDetailsModal;
