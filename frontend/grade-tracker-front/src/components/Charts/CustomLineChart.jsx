import React from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import moment from "moment";

const CustomLineChart = ({ data }) => {
  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;

      return (
        <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
          <p className="text-xs font-semibold text-indigo-800 mb-1">
            {item.title}
          </p>

          <p className="text-sm text-gray-600">
            Grade:{" "}
            <span className="text-sm font-medium text-gray-900">
              {item.value}%
            </span>
          </p>

          <p className="text-xs text-gray-500">
            Due: {moment(item.label).format("MMM DD, YYYY")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="assignmentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="none" />

          <XAxis
            dataKey="label"
            tickFormatter={(date) => moment(date).format("MMM")}
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
            domain={[0, 100]}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            fill="url(#assignmentGradient)"
            strokeWidth={3}
            dot={{ r: 3, fill: "#ab8df8" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
