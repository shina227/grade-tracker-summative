import React from "react";
import { getLetterGrade } from "../../utils/helper";

const RecentGrades = ({ recentGrades, navigate, getGradeColor }) => {
  return (
    <div className="card">
      <h2 className="text-lg">Recent Grades</h2>

      <div className="space-y-3">
        {recentGrades.length > 0 ? (
          recentGrades.map((grade) => (
            <div
              key={grade._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate("/grades")}
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {grade.assignmentId?.title}
                </p>
                <p className="text-xs text-gray-500">
                  {grade.courseId?.courseName}
                </p>
              </div>

              <span
                className={`text-sm font-bold px-3 py-1 rounded border ${getGradeColor(
                  grade.score
                )}`}
              >
                {getLetterGrade(grade.score)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No grades yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentGrades;
