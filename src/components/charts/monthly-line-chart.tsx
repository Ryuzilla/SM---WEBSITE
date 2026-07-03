"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { formatCurrency } from "@/lib/utils";

export function MonthlyLineChart({
  data,
  height = 160,
}: {
  data: { label: string; revenue: number }[];
  height?: number;
}) {
  if (!data.length)
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-xs text-muted-foreground"
      >
        No data
      </div>
    );

  const revenues = data.map((d) => d.revenue);
  const highest = Math.max(...revenues);
  const lowest = Math.min(...revenues);
  const average = revenues.reduce((a, b) => a + b, 0) / revenues.length;

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="monthlyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <Tooltip content={<ChartTooltip />} />
          {/* Dots always on so a single-month dataset is still visible. */}
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill="url(#monthlyFill)"
            dot={{ r: 3.5, strokeWidth: 0, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 border-t pt-3 text-xs">
        <div>
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="text-emerald-400">&#8593;</span> Highest
          </p>
          <p className="font-semibold tabular-nums">
            {formatCurrency(highest, { compact: true })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Average</p>
          <p className="font-semibold tabular-nums">
            {formatCurrency(average, { compact: true })}
          </p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            Lowest <span className="text-red-400">&#8595;</span>
          </p>
          <p className="font-semibold tabular-nums">
            {formatCurrency(lowest, { compact: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
