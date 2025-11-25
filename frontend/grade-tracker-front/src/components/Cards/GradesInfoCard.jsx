import React from "react";
import {
  LuTrash2,
  LuPencil,
  LuClipboardCheck,
  LuTrendingUp,
  LuTrendingDown,
} from "react-icons/lu";

const GradesInfoCard = ({
  assignmentName,
  courseName,
  score,
  weight,
  hiddenDeleteBtn,
  hiddenEditBtn,
  onEdit,
  onDelete,
}) => {
  // Calculate letter grade
  const getLetterGrade = (scoreValue) => {
    if (scoreValue >= 90) return "A";
    if (scoreValue >= 80) return "B";
    if (scoreValue >= 70) return "C";
    if (scoreValue >= 60) return "D";
    return "F";
  };

  // Get grade color and icon
  const getGradeStyles = (scoreValue) => {
    if (scoreValue >= 90) {
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: <LuTrendingUp size={16} className="mr-1" />,
        border: "border-green-200",
      };
    } else if (scoreValue >= 80) {
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: <LuTrendingUp size={16} className="mr-1" />,
        border: "border-blue-200",
      };
    } else if (scoreValue >= 70) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: null,
        border: "border-yellow-200",
      };
    } else if (scoreValue >= 60) {
      return {
        bg: "bg-orange-100",
        text: "text-orange-700",
        icon: <LuTrendingDown size={16} className="mr-1" />,
        border: "border-orange-200",
      };
    } else {
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: <LuTrendingDown size={16} className="mr-1" />,
        border: "border-red-200",
      };
    }
  };

  // Calculate weighted contribution
  const contribution = ((score * weight) / 100).toFixed(1);

  const letterGrade = getLetterGrade(score);
  const gradeStyles = getGradeStyles(score);

  return (
    <div
      className={`group flex items-start justify-between gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border ${gradeStyles.border}`}
    >
      {/* Left side: Icon */}
      <div className="w-10 h-10 shrink-0 flex items-center justify-center text-lg text-gray-700 bg-gray-100 rounded-full">
        <LuClipboardCheck />
      </div>

      {/* Middle: Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 mb-1">
          {assignmentName}
        </p>
        <p className="text-xs text-gray-500 mb-2">{courseName}</p>

        {/* Grade Display - Prominent */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg mb-2 ${gradeStyles.bg} border ${gradeStyles.border}`}
        >
          <div className="flex items-center gap-1">
            {gradeStyles.icon}
            <span className={`text-lg font-bold ${gradeStyles.text}`}>
              {score}%
            </span>
          </div>
          <span className={`text-sm font-semibold ${gradeStyles.text}`}>
            ({letterGrade})
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span>
            <span className="font-medium">Weight:</span> {weight}%
          </span>
          <span>•</span>
          <span>
            <span className="font-medium">Contribution:</span> {contribution}%
          </span>
        </div>
      </div>

      {/* Right: Actions */}
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
  );
};

export default GradesInfoCard;
