import React from "react";
import { LuBookOpen, LuArrowRight } from "react-icons/lu";

const UpcomingAssignments = ({ upcomingAssignments, navigate, formatDate }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg">Upcoming Assignments</h2>

        <button onClick={() => navigate("/assignments")} className="add-btn">
          View All
          <LuArrowRight size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {upcomingAssignments.length > 0 ? (
          upcomingAssignments.map((assignment) => (
            <div
              key={assignment._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate("/assignments")}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded border border-gray-200">
                  <LuBookOpen className="text-gray-600" size={20} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {assignment.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {assignment.courseId?.courseName}
                  </p>
                </div>
              </div>

              <p className="text-xs text-orange-600 font-medium">
                Due: {formatDate(assignment.dueDate)}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">🎉 No upcoming assignments!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAssignments;
