"use client";

import { ArrowDownRight, ArrowUpRight, CalendarDays, Package, Store } from "lucide-react";
import {
  Bar,
  BarChart,
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
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

// Cohesive cool→warm categorical ramp for the one true categorical use
// (the company donut). Ordered so adjacent slices stay distinguishable.
const CATEGORICAL = [
  "hsl(220 85% 62%)", // navy (primary)
  "hsl(199 89% 55%)", // sky
  "hsl(172 66% 48%)", // teal
  "hsl(158 70% 45%)", // emerald
  "hsl(250 72% 66%)", // indigo
  "hsl(280 65% 66%)", // violet
  "hsl(322 62% 62%)", // magenta
  "hsl(38 92% 58%)", // amber
  "hsl(16 85% 62%)", // coral
  "hsl(220 12% 55%)", // slate
];

export default function OverviewPage() {
  const { analytics } = useDashboard();
  const k = analytics.kpis;

  // Keep only actual months — computeMonthly appends future forecast points
  // (revenue 0) that would drag the line and the Lowest stat down to zero.
  const monthlyTrend = analytics.monthly
    .filter((m) => m.orders > 0)
    .map((m) => ({ label: m.label, revenue: m.revenue }));

  const topCompanies = analytics.companies
    .slice(0, 10)
    .map((c, i) => ({ ...c, color: CATEGORICAL[i] }));
  const companiesTotal = topCompanies.reduce((s, c) => s + c.revenue, 0);

  const salespersons = analytics.salespersons;
  const topSales = salespersons.slice(0, 8);
  const maxSalesRevenue = Math.max(1, ...topSales.map((s) => s.totalRevenue));
  const growth = k.monthlyGrowthRate;

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Supamit Store</p>
          <h1 className="mt-0.5 font-display text-3xl font-bold tracking-tight">
            Sales overview
          </h1>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs">
          <CalendarDays className="h-3.5 w-3.5" />
          {analytics.recordCount.toLocaleString()} records
        </Badge>
      </div>

      <FilterBar />

      {/* ── KPI row ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Revenue hero + target gauge */}
        <Card className="surface relative overflow-hidden sm:col-span-2 xl:col-span-1">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-transparent" />
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Total revenue</p>
              <p className="mt-2 truncate font-display text-[2.6rem] font-bold leading-none tracking-tight tabular-nums">
                {formatCurrency(k.totalRevenue, { compact: true })}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px]">
                {growth !== 0 && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${
                      growth > 0
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {growth > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {formatPercent(growth)}
                  </span>
                )}
                <span className="text-muted-foreground">
                  Target {formatCurrency(k.revenueTarget, { compact: true })}
                </span>
              </div>
            </div>
            <RadialGauge value={k.targetAchievement} size={92} label="of target" />
          </CardContent>
        </Card>

        <StatCard
          label="Total SKU"
          value={formatNumber(k.uniqueProducts)}
          sub="สินค้าไม่ซ้ำที่ขายได้"
          icon={Package}
        />
        <StatCard
          label="ร้านค้า"
          value={formatNumber(k.uniqueCustomers)}
          sub="ร้านค้าที่ซื้อไม่ซ้ำ"
          icon={Store}
        />
      </div>

      {/* ── Earnings + top salespeople ── */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Section title="Monthly earnings" className="xl:col-span-2">
          <MonthlyLineChart data={monthlyTrend} height={210} />
        </Section>

        {/* Ranked salespeople with proportion bars — single hue (magnitude) */}
        <Section title="Top sales revenue">
          <div className="space-y-3.5">
            {topSales.map((s, i) => (
              <div key={s.name}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground/50">
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
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{ width: `${(s.totalRevenue / maxSalesRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topSales.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">No data</p>
            )}
          </div>
        </Section>
      </div>

      {/* ── Companies + salesperson detail ── */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Top companies donut — the one categorical chart */}
        <Section title="Top 10 companies">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="shrink-0">
              <DonutChart
                segments={topCompanies.map((c) => ({
                  label: c.companyName,
                  value: c.revenue,
                  color: c.color,
                }))}
                centerValue={formatCurrency(companiesTotal, { compact: true })}
                centerLabel="Total"
                size={156}
                thickness={17}
              />
            </div>
            <div className="max-h-[196px] w-full flex-1 space-y-1.5 overflow-y-auto scrollbar-thin">
              {topCompanies.map((c) => (
                <div
                  key={c.companyName}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ background: c.color }}
                    />
                    <span className="truncate font-medium">{c.companyName}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {companiesTotal
                      ? `${Math.round((c.revenue / companiesTotal) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              ))}
              {topCompanies.length === 0 && (
                <p className="text-xs text-muted-foreground">No data</p>
              )}
            </div>
          </div>
        </Section>

        {/* Sales by person — single hue (magnitude comparison) */}
        <Section title="Sales by person">
          <ResponsiveContainer width="100%" height={228}>
            <BarChart
              data={topSales.map((s) => ({
                name: s.name.split(" ")[0],
                revenue: s.totalRevenue,
              }))}
              margin={{ left: 0, right: 8, top: 8, bottom: 34 }}
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
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={34}
              />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* Per-salesperson summary: revenue, unique SKUs, unique stores */}
        <Card className="surface lg:col-span-2 xl:col-span-1">
          <CardHeader className="px-5 pt-5 pb-1">
            <CardTitle className="text-[13px] font-semibold tracking-tight">
              Salesperson summary
            </CardTitle>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 pt-2 text-[11px] text-muted-foreground/70">
              <span>Sales</span>
              <span className="w-16 text-right">Revenue</span>
              <span className="w-12 text-right">SKU</span>
              <span className="w-12 text-right">ร้านค้า</span>
            </div>
          </CardHeader>
          <CardContent className="max-h-[248px] overflow-y-auto px-5 pb-4 scrollbar-thin">
            {salespersons.map((s, i) => (
              <div
                key={s.name}
                className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-2 text-xs${
                  i > 0 ? " border-t border-border/40" : ""
                }`}
              >
                <span className="truncate font-medium">{s.name}</span>
                <span className="w-16 text-right font-semibold tabular-nums">
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

/** Card wrapper with a consistent titled header (sentence-case, quiet). */
function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`surface ${className ?? ""}`}>
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="text-[13px] font-semibold tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">{children}</CardContent>
    </Card>
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
    <Card className="surface">
      <CardContent className="flex items-center justify-between gap-3 p-6">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 truncate font-display text-[2.6rem] font-bold leading-none tracking-tight tabular-nums">
            {value}
          </p>
          <p className="mt-3 text-[11px] text-muted-foreground">{sub}</p>
        </div>
        <div className="glow-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
