import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { prepareAssignmentsLineChartData } from "../../utils/helper";
import CustomLineChart from "../Charts/CustomLineChart";

const AssignmentsOverview = ({ assignments, onAddAssignment }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareAssignmentsLineChartData(assignments);
    setChartData(result);
    console.log("Assignments chartData:", result);
  }, [assignments]);
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="">
          <h5 className="text-lg">Assignments Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Keep track of all your assignments
          </p>
        </div>

        <button className="add-btn" onClick={onAddAssignment}>
          <LuPlus className="text-lg" /> Add Assignment
        </button>
      </div>

      <div className="mt-10">
        <CustomLineChart data={chartData} />
      </div>
    </div>
  );
};

export default AssignmentsOverview;
