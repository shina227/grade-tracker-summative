import React from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const GPATrendChart = ({ grades }) => {
  // Mock data for now
  const chartData = [
    { semester: "September 2024", gpa: 3.65 },
    { semester: "January 2025", gpa: 3.72 },
    { semester: "May 2025", gpa: 3.58 },
    { semester: "September 2025", gpa: 3.85 },
  ];

  const chartConfig = {
    gpa: {
      label: "GPA",
      color: "#6366f1",
    },
  };

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
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
          dataKey="semester"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey="gpa"
          type="natural"
          fill="var(--color-gpa)"
          fillOpacity={0.2}
          stroke="var(--color-gpa)"
          strokeWidth={2.5}
        />
      </AreaChart>
    </ChartContainer>
  );
};

export default GPATrendChart;
