import React from "react";
import CustomPieChart from "../Charts/CustomPieChart";

const COLORS = ["#6366F1", "#38BDF8", "#F43F5E"];

const AssignmentsOverview = ({
  completedAssignments,
  pendingAssignments,
  overdueAssignments,
}) => {
  const chartData = [
    { name: "Completed", value: completedAssignments },
    { name: "Pending", value: pendingAssignments },
    { name: "Overdue", value: overdueAssignments },
  ];

  const totalAssignments =
    (completedAssignments || 0) +
    (pendingAssignments || 0) +
    (overdueAssignments || 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Assignment Overview</h5>
      </div>

      <CustomPieChart
        data={chartData}
        label="Assignments Overview"
        totalAssignments={`${totalAssignments}`}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  );
};

export default AssignmentsOverview;
