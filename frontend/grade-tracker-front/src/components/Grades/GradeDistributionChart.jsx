import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const GradeDistributionChart = ({ distribution }) => {
  const chartData = [
    { grade: "A", count: distribution.A || 0 },
    { grade: "A-", count: distribution.AMinus || 0 },
    { grade: "B+", count: distribution.BPlus || 0 },
    { grade: "B", count: distribution.B || 0 },
    { grade: "B-", count: distribution.BMinus || 0 },
    { grade: "C+", count: distribution.CPlus || 0 },
  ];

  const chartConfig = {
    count: {
      label: "Count",
      color: "#6366f1",
    },
  };

  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="grade"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
};

export default GradeDistributionChart;
