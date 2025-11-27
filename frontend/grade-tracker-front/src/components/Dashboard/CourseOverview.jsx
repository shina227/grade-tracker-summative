import React from "react";
import { LuArrowRight } from "react-icons/lu";

const CourseOverview = ({ courseGrades, navigate, getGradeColor }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg">Courses Overview</h2>

        <button onClick={() => navigate("/courses")} className="add-btn">
          View All
          <LuArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courseGrades.length > 0 ? (
          courseGrades.slice(0, 6).map((course) => (
            <div
              key={course._id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate("/courses")}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  {course.courseName}
                </h3>

                <span
                  className={`text-lg font-bold px-3 py-1 rounded border ${getGradeColor(
                    course.averageGrade
                  )}`}
                >
                  {course.letterGrade}
                </span>
              </div>

              <p className="text-xs text-gray-500">Current Grade</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p className="text-sm">No courses found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOverview;
