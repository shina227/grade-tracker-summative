import React from "react";

const OverallGPA = ({ overallGPA }) => {
  return (
    <div className="card">
      <h2 className="text-lg">Overall GPA</h2>

      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="#e5e7eb"
              strokeWidth="16"
              fill="none"
            />

            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="url(#gradient)"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(overallGPA / 4) * 502.4} 502.4`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />

            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-800">
                {overallGPA.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">out of 4.0</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">Cumulative GPA</p>
      </div>
    </div>
  );
};

export default OverallGPA;
