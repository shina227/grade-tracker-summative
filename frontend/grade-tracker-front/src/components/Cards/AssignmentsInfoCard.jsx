import React from "react";
import { LuTrash2, LuBookOpen } from "react-icons/lu";

const AssignmentsInfoCard = ({
  title,
  icon,
  date,
  status,
  hiddenDeleteBtn,
  onDelete,
}) => {
  // Color mapping for assignment status
  const getStatusStyles = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "submitted":
        return "bg-blue-100 text-blue-700";
      case "graded":
        return "bg-green-100 text-green-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="group flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Left side: Icon */}
      <div className="w-10 h-10 flex items-center justify-center text-lg text-gray-700 bg-gray-50 rounded-full">
        {icon ? (
          <img src={icon} alt={title} className="w-5 h-5 object-contain" />
        ) : (
          <LuBookOpen />
        )}
      </div>

      {/* Middle: Info */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>

      {/* Right: Status + Delete */}
      <div className="flex items-center gap-3">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyles()}`}
        >
          {status}
        </span>

        {!hiddenDeleteBtn && (
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <LuTrash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignmentsInfoCard;
