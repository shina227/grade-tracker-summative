import React from "react";

const CustomTooltip = ({ active, payload, totalAssignments }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const percentage =
      totalAssignments > 0 ? ((value / totalAssignments) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
        <p className="text-xs font-semibold text-indigo-800 mb-1">{name}</p>
        <p className="text-sm text-gray-600">
          Assignments:{" "}
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </p>
        <p className="text-gray-500 text-sm">{percentage}% of total</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
