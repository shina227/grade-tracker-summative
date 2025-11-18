import React, { useEffect, useState } from "react";
import CustomPieChart from "../Charts/CustomPieChart";

const COLORS = ["#875CF5", "#FA2C37", "#FF6900", "#4F39F6"];

const GradesDistribution = ({ data = [], totalGrades = 0 }) => {
  const [chartData, setChartData] = useState([]);

  // Prepare Pie Chart Data
  const prepareChartData = () => {
    const dataArr = (data || []).map((item) => ({
      name: item?.category, // e.g. A, B, C
      value: item?.count, // number of assignments
    }));

    setChartData(dataArr);
  };

  useEffect(() => {
    prepareChartData();
  }, [data]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-lg">Grades Distribution</h5>
      </div>

      <CustomPieChart
        data={chartData}
        label="Total Grades"
        totalGrades={totalGrades}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  );
};

export default GradesDistribution;
