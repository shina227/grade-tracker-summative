import React from "react";
import CoursesInfoCard from "../Cards/CoursesInfoCard";

const CoursesList = ({ courses, onDelete }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg">All Courses</h5>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses?.map((course) => (
          <CoursesInfoCard
            key={course._id}
            name={course.courseName}
            term={course.term}
            year={course.year}
            status={course.status}
            onDelete={() => onDelete(course._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CoursesList;
