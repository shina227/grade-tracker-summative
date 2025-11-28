import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import CustomBarChart from "../Charts/CustomBarChart";
import { prepareCoursesBarChartData } from "../../utils/helper";

const CoursesOverview = ({ courses, onAddCourse }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareCoursesBarChartData(courses, "term");
    setChartData(result);

    return () => {};
  }, [courses]);
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h5 className="text-lg">Course Overview</h5>
        <p className="text-xs text-gray-600">
          Keep track of your enrolled courses
        </p>
      </div>

      <button className="add-btn" onClick={onAddCourse}>
        <LuPlus className="text-lg" /> Add Course
      </button>
    </div>
  );
};

export default CoursesOverview;
