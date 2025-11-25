import React from "react";
import {
  LuTrash2,
  LuClipboardCheck,
  LuPercent,
  LuPencil,
} from "react-icons/lu";

const GradesInfoCard = ({
  assignmentName,
  courseName,
  score,
  weight,
  onDelete,
  onEdit,
}) => {
  const contribution = ((score * weight) / 100).toFixed(1);

  return (
    <div className="group flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Left icon */}
      <div className="w-10 h-10 flex items-center justify-center text-lg text-gray-700 bg-gray-50 rounded-full">
        <LuClipboardCheck />
      </div>

      {/* Middle info */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{assignmentName}</p>
        <p className="text-xs text-gray-500">{courseName}</p>

        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-gray-700 flex items-center gap-1">
            <LuPercent size={14} />
            Score: <strong>{score}%</strong>
          </span>
          <span className="text-xs text-gray-700">
            Weight: <strong>{weight}%</strong>
          </span>
          <span className="text-xs text-gray-600">
            Contribution: <strong>{contribution}%</strong>
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <LuPencil size={16} />
            Edit
          </button>
        )}

        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <LuTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default GradesInfoCard;
