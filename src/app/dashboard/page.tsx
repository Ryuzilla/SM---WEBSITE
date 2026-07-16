"use client";

import { CalendarDays, Package, Store } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { FilterBar } from "@/components/filters/filter-bar";
import { DonutChart } from "@/components/charts/donut-chart";
import { RadialGauge } from "@/components/charts/radial-gauge";
import { MonthlyLineChart } from "@/components/charts/monthly-line-chart";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";

const PALETTE = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220 70% 70%)",
  "hsl(160 60% 55%)",
  "hsl(38 80% 60%)",
  "hsl(280 70% 65%)",
  "hsl(10 80% 60%)",
];

export default function OverviewPage() {
  const { analytics } = useDashboard();
  const k = analytics.kpis;

  // Keep only actual months — computeMonthly appends future forecast points
  // (revenue 0) that would drag the line and the Lowest stat down to zero.
  const monthlyTrend = analytics.monthly
    .filter((m) => m.orders > 0)
    .map((m) => ({
      label: m.label,
      revenue: m.revenue,
    }));

  const topCompanies = analytics.companies
    .slice(0, 10)
    .map((c, i) => ({ ...c, color: PALETTE[i] }));
  const companiesTotal = topCompanies.reduce((s, c) => s + c.revenue, 0);

  const salespersons = analytics.salespersons;
  const topSales = salespersons.slice(0, 8);
  const maxSalesRevenue = Math.max(1, ...topSales.map((s) => s.totalRevenue));

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Supamit Store &middot; Sales Dashboard
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Overview</h1>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs">
          <CalendarDays className="h-3.5 w-3.5" />
          {analytics.recordCount.toLocaleString()} records
        </Badge>
      </div>

      <FilterBar />

      {/* ── KPI row ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {/* Revenue hero + target gauge */}
        <Card className="sm:col-span-2 xl:col-span-1">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Total Revenue
              </p>
              <p className="mt-1 truncate text-3xl font-bold tracking-tight tabular-nums">
                {formatCurrency(k.totalRevenue, { compact: true })}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Target {formatCurrency(k.revenueTarget, { compact: true })}
              </p>
            </div>
            <RadialGauge value={k.targetAchievement} size={88} label="of target" />
          </CardContent>
        </Card>

        <StatCard
          label="Total SKU"
          value={formatNumber(k.uniqueProducts)}
          sub="products sold"
          icon={Package}
        />
        <StatCard
          label="ร้านค้า"
          value={formatNumber(k.uniqueCustomers)}
          sub="ร้านค้าไม่ซ้ำ"
          icon={Store}
        />
      </div>

      {/* ── Earnings + top salespeople ── */}
      <div className="grid gap-3 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total Earning by Months
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <MonthlyLineChart data={monthlyTrend} height={200} />
          </CardContent>
        </Card>

        {/* Ranked salespeople with proportion bars */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Top Sales Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">
            {topSales.map((s, i) => (
              <div key={s.name}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate font-medium">{s.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatCurrency(s.totalRevenue, { compact: true })}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${(s.totalRevenue / maxSalesRevenue) * 100}%`,
                      background: PALETTE[i % PALETTE.length],
                    }}
                  />
                </div>
              </div>
            ))}
            {topSales.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Companies + salesperson detail ── */}
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {/* Top companies donut */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Top 10 Company &middot; Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 px-5 pb-5 sm:flex-row">
            <div className="shrink-0">
              <DonutChart
                segments={topCompanies.map((c) => ({
                  label: c.companyName,
                  value: c.revenue,
                  color: c.color,
                }))}
                centerValue={formatCurrency(companiesTotal, { compact: true })}
                centerLabel="Total"
                size={150}
                thickness={16}
              />
            </div>
            <div className="max-h-[190px] w-full flex-1 space-y-1 overflow-y-auto scrollbar-thin">
              {topCompanies.map((c) => (
                <div
                  key={c.companyName}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: c.color }}
                    />
                    <span className="truncate font-medium">{c.companyName}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCurrency(c.revenue, { compact: true })}
                  </span>
                </div>
              ))}
              {topCompanies.length === 0 && (
                <p className="text-xs text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales by person bar chart */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Sales by Person
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={topSales.map((s) => ({
                  name: s.name.split(" ")[0],
                  revenue: s.totalRevenue,
                }))}
                margin={{ left: 0, right: 8, top: 8, bottom: 36 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {topSales.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Per-salesperson summary: revenue, unique SKUs, unique stores */}
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader className="px-5 pt-5 pb-1">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Salesperson Summary
            </CardTitle>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 pt-2 text-[10px] uppercase tracking-wide text-muted-foreground/60">
              <span>Sales</span>
              <span className="w-16 text-right">Revenue</span>
              <span className="w-12 text-right">SKU</span>
              <span className="w-12 text-right">ร้านค้า</span>
            </div>
          </CardHeader>
          <CardContent className="max-h-[240px] overflow-y-auto px-5 pb-4 scrollbar-thin">
            {salespersons.map((s, i) => (
              <div
                key={s.name}
                className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-1.5 text-xs${
                  i > 0 ? " border-t border-border/40" : ""
                }`}
              >
                <span className="truncate font-medium">{s.name}</span>
                <span className="w-16 text-right tabular-nums">
                  {formatCurrency(s.totalRevenue, { compact: true })}
                </span>
                <span className="w-12 text-right tabular-nums text-muted-foreground">
                  {formatNumber(s.skusSold)}
                </span>
                <span className="w-12 text-right tabular-nums text-muted-foreground">
                  {formatNumber(s.customersManaged)}
                </span>
              </div>
            ))}
            {salespersons.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
