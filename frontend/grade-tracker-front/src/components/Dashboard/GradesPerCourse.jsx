import React from "react";
import { LuArrowRight } from "react-icons/lu";
import moment from "moment";

const GradesPerCourse = ({ grades, onSeeMore }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Grades</h5>

        <button className="card-btn" onClick={onSeeMore}>
          See All <LuArrowRight className="text-base" />
        </button>
      </div>

      <div className="mt-6">
        {grades?.slice(0, 5)?.map((item) => (
          <GradesInfoCard
            key={item._id}
            title={item.source}
            icon={item.icon}
            data={moment(item.date).format("Dd MM YYYY")}
            amount={item.amount}
            type="grades"
            hiddenDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default GradesPerCourse;
