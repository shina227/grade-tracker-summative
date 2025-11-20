import React from "react";
import { LuTrash2, LuBookOpen, LuCircleCheck, LuClock } from "react-icons/lu";

const CoursesInfoCard = ({
  name,
  term,
  year,
  status,
  hiddenDeleteBtn,
  onDelete,
}) => {
  // Status styles & icons
  const getStatusStyles = () => {
    switch (status) {
      case "In Progress":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
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

  const statusStyles = getStatusStyles();

  return (
    <div className="group flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Left side: Icon */}
      <div className="w-10 h-10 flex items-center justify-center text-lg text-gray-700 bg-gray-50 rounded-full">
        <LuBookOpen />
      </div>

      {/* Middle: Info */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{name}</p>
        <p className="text-xs text-gray-500">{term}</p>
        <p className="text-xs text-gray-500">{year}</p>
      </div>

      {/* Right: Status + Delete */}
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text}`}
        >
          {statusStyles.icon}
          {status}
        </span>

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
  );
};

export default CoursesInfoCard;
