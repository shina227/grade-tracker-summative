import React, { useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";

const AssignmentsTable = ({ assignments, onEdit, onDelete }) => {
  const [selectedIds] = useState([]);

  // Get status badge styling
  const getStatusBadge = (status, dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (status === "Completed") {
      return {
        text: "Completed",
        className: "bg-green-100 text-green-700 border-green-200",
      };
    }

    if (due < today) {
      return {
        text: "Overdue",
        className: "bg-red-100 text-red-700 border-red-200",
      };
    }

    return {
      text: "Upcoming",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Assignment Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Course
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignments.length > 0 ? (
              assignments.map((assignment) => {
                const statusBadge = getStatusBadge(
                  assignment.status,
                  assignment.dueDate
                );
                return (
                  <tr
                    key={assignment._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {assignment.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">
                        {assignment.courseId?.courseName || "Unknown Course"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">
                        {formatDate(assignment.dueDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.className}`}
                      >
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(assignment)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <LuPencil size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(assignment._id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <LuTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center">
                  <p className="text-gray-500 text-sm">
                    No assignments found. Click "Add Assignment" to create one.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentsTable;
