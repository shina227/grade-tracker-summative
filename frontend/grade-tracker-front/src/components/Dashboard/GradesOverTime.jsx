import React, { useState, useEffect } from "react";
import { prepareGradesBarChartData } from "../../utils/helper";
import CustomBarChart from "../Charts/CustomBarChart";

const GradesOverTime = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareGradesBarChartData(data);
    setChartData(result);

    return () => {};
  }, [data]);

  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Grades Over Time</h5>
      </div>
      <CustomBarChart data={chartData} dataKey="grade" xKey="date" />
    </div>
  );
};

export default GradesOverTime;
