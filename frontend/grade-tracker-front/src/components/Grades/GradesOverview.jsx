import React, { useEffect, useState } from "react";
import { LuPlus, LuTrendingUp, LuAward, LuTarget } from "react-icons/lu";
import {
  prepareGradesBarChartData,
  calculateWeightedGPA,
} from "../../utils/helper";
import CustomLineChart from "../Charts/CustomLineChart";

const GradesOverview = ({ grades, onAddGrade }) => {
  const [chartData, setChartData] = useState([]);
  const [gpaStats, setGpaStats] = useState({
    weightedAverage: 0,
    totalGrades: 0,
    averageScore: 0,
  });

  useEffect(() => {
    // Prepare chart data for grades
    const result = prepareGradesBarChartData(grades);
    setChartData(result);

    // Calculate statistics
    const stats = calculateWeightedGPA(grades);
    setGpaStats(stats);
  }, [grades]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="text-lg">Grades Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Track your assignment grades and performance
          </p>
        </div>

        {/* Add Grade */}
        {onAddGrade && (
          <button className="add-btn" onClick={onAddGrade}>
            <LuPlus className="text-lg" /> Add Grade
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Weighted Average */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg">
              <LuAward size={20} />
            </div>
            <div>
              <p className="text-xs text-blue-700 font-medium">
                Weighted Average
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {gpaStats.weightedAverage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-lg">
              <LuTrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">
                Average Score
              </p>
              <p className="text-2xl font-bold text-green-900">
                {gpaStats.averageScore.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Total Grades */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-purple-500 text-white rounded-lg">
              <LuTarget size={20} />
            </div>
            <div>
              <p className="text-xs text-purple-700 font-medium">
                Total Grades
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {gpaStats.totalGrades}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Chart */}
      <div className="mt-6">
        <h6 className="text-sm font-medium text-gray-700 mb-4">
          Average Scores by Course
        </h6>
        {chartData.length > 0 ? (
          <CustomLineChart data={chartData} />
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            No grades available to display
          </p>
        )}
      </div>
    </div>
  );
};

export default GradesOverview;
