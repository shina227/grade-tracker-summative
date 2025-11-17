import React from "react";
import { LuArrowRight } from "react-icons/lu";
import AssignmentsInfoCard from "../Cards/AssignmentsInfoCard";

const AssignmentDetails = ({ assignments, onSeeMore }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Assignments</h5>

        <button className="card-btn" onClick={onSeeMore}>
          See All <LuArrowRight className="text-base" />
        </button>
      </div>

      <div className="mt-6">
        {assignments?.slice(0, 5)?.map((assignments) => (
          <AssignmentsInfoCard
            key={item._id}
            title={item.type === "assignment" ? item.title : item.course}
            icon={item.icon}
            date={moment(item.dueDate).format("DD MMM YYYY")}
            status={item.status}
            hiddenDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default AssignmentDetails;
