import React from "react";
import {
  LuTrash2,
  LuPencil,
  LuBookOpen,
  LuCircleCheck,
  LuClock,
  LuCalendar,
} from "react-icons/lu";

const AssignmentsInfoCard = ({
  title,
  courseName,
  dueDate,
  weight,
  grade,
  status,
  hiddenDeleteBtn,
  hiddenEditBtn,
  onEdit,
  onDelete,
}) => {
  // Status styles & icons
  const getStatusStyles = () => {
    switch (status) {
      case "Pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          icon: <LuClock size={14} className="mr-1" />,
        };
      case "Completed":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: <LuCircleCheck size={14} className="mr-1" />,
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          icon: null,
        };
    }
  };

  // Check if due date is approaching or overdue
  const getDueDateStatus = () => {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 && status === "Pending") {
      return { text: "Overdue", color: "text-red-600", bg: "bg-red-50" };
    } else if (diffDays === 0 && status === "Pending") {
      return {
        text: "Due Today",
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    } else if (diffDays > 0 && diffDays <= 3 && status === "Pending") {
      return {
        text: `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    }
    return null;
  };

  const statusStyles = getStatusStyles();
  const dueDateStatus = getDueDateStatus();

  return (
    <div className="group flex items-start justify-between gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
      {/* Left side*/}
      <div className="w-10 h-10 shrink-0 flex items-center justify-center text-lg text-gray-700 bg-gray-50 rounded-full">
        <LuBookOpen />
      </div>

      {/* Middle*/}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 mb-1">{title}</p>
        <p className="text-xs text-gray-500 mb-2">{courseName}</p>

        {/* Due Date*/}
        {dueDate && (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md mb-2 ${
              dueDateStatus ? dueDateStatus.bg : "bg-blue-50"
            }`}
          >
            <LuCalendar
              size={14}
              className={dueDateStatus ? dueDateStatus.color : "text-blue-600"}
            />
            <span
              className={`text-xs font-medium ${
                dueDateStatus ? dueDateStatus.color : "text-blue-600"
              }`}
            >
              {dueDateStatus
                ? dueDateStatus.text
                : new Date(dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Weight: {weight}%</span>
          <span>•</span>
          <span>Grade: {grade}%</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-2">
        <span
          className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyles.bg} ${statusStyles.text}`}
        >
          {statusStyles.icon}
          {status}
        </span>

        <div className="flex items-center gap-2">
          {!hiddenEditBtn && (
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <LuPencil size={16} />
            </button>
          )}

          {!hiddenDeleteBtn && (
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <LuTrash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsInfoCard;
