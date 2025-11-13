import React from "react";
import { LuArrowRight } from "react-icons/lu";
import moment from "moment";
import AssignmentsInfoCard from "../Cards/AssignmentsInfoCard";

const UpcomingAssignments = ({ assignments, onSeeMore }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-semibold">Upcoming Assignments</h5>
        <button
          className="card-btn flex items-center gap-1"
          onClick={onSeeMore}
        >
          See All <LuArrowRight className="text-base" />
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {assignments?.slice(0, 5)?.map((item) => (
          <AssignmentsInfoCard
            key={item._id}
            title={item.type === "assignment" ? item.title : item.course}
            icon={item.icon}
            date={moment(item.dueDate).format("DD MMM YYYY")}
            status={item.status}
            hiddenDeleteBtn
          />
        ))}

        {!assignments?.length && (
          <p className="text-gray-400 text-sm text-center">
            No upcoming assignments
          </p>
        )}
      </div>
    </div>
  );
};

export default UpcomingAssignments;
