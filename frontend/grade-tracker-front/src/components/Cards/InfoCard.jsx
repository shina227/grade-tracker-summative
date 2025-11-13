import React from "react";

export const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex gap-6 bg-white p-6 rounded-2xl border-2 border-gray-200">
      <div
        className={`w-14 h-14 flex items-center justify-center text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-sm text-gray-500 mb-1">{label}</h6>
        <span className="text-[22px]">{value}</span>
      </div>
    </div>
  );
};
