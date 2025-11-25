import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { prepareGradesBarChartData } from "../../utils/helper";
import CustomLineChart from "../Charts/CustomLineChart";

const GradesOverview = ({ grades, onAddGrade }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Prepare chart data for grades
    const result = prepareGradesBarChartData(grades);
    setChartData(result);
    console.log("Grades chartData:", result);
  }, [grades]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg">Grades Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Track your course grades and performance
          </p>
        </div>

        {/* Add Grade */}
        {onAddGrade && (
          <button className="add-btn" onClick={onAddGrade}>
            <LuPlus className="text-lg" /> Add Grade
          </button>
        )}
      </div>

      <div className="mt-10">
        {chartData.length > 0 ? (
          <CustomLineChart data={chartData} />
        ) : (
          <p className="text-sm text-gray-500 text-center">
            No grades available to display
          </p>
        )}
      </div>
    </div>
  );
};

export default GradesOverview;
