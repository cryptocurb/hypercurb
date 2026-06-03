"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeekPoint } from "@/lib/etf";

function weekRangeLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 4); // Mon..Fri trading week
  const sM = start.toLocaleDateString("en-US", { month: "short" });
  const eM = end.toLocaleDateString("en-US", { month: "short" });
  return sM === eM
    ? `${start.getDate()}–${end.getDate()} ${eM} ${end.getFullYear()}`
    : `${start.getDate()} ${sM} – ${end.getDate()} ${eM} ${end.getFullYear()}`;
}

function shortWeekTick(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  return start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Weekly net-flow bar chart — one bar per ISO week (Mon-anchored) since
 * launch. Bars are aquamarine for net inflow, dim coral for net outflow.
 * Hover for the exact week range and net flow amount.
 */
export default function WeeklyEtfBars({
  weeks,
  height = 300,
}: {
  weeks: WeekPoint[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={weeks}
          margin={{ top: 16, right: 20, left: 0, bottom: 4 }}
        >
          <CartesianGrid stroke="rgba(151,252,228,0.07)" vertical={false} />
          <XAxis
            dataKey="weekStart"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(245,254,253,0.55)", fontSize: 11 }}
            tickFormatter={shortWeekTick}
            minTickGap={20}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(245,254,253,0.55)", fontSize: 11 }}
            tickFormatter={(v: number) => (v === 0 ? "$0" : `$${v}M`)}
            width={56}
          />
          <Tooltip
            cursor={{ fill: "rgba(151,252,228,0.06)" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={(props: any) => {
              const { active, payload } = props;
              if (!active || !payload || !payload.length) return null;
              const w = payload[0].payload as WeekPoint;
              return (
                <div
                  style={{
                    background: "#04060c",
                    border: "1px solid rgba(151,252,228,0.35)",
                    borderRadius: 8,
                    fontFamily: "Space Mono, monospace",
                    fontSize: 12,
                    color: "#f5fefd",
                    padding: "8px 10px",
                    minWidth: 170,
                  }}
                >
                  <div
                    style={{
                      color: "rgba(245,254,253,0.55)",
                      marginBottom: 6,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {weekRangeLabel(w.weekStart)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      color: "#97FCE4",
                    }}
                  >
                    <span>BHYP</span>
                    <span style={{ fontWeight: 700 }}>${w.bhyp.toFixed(1)}M</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      color: "#B695FF",
                    }}
                  >
                    <span>THYP</span>
                    <span style={{ fontWeight: 700 }}>${w.thyp.toFixed(1)}M</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginTop: 6,
                      paddingTop: 6,
                      borderTop: "1px solid rgba(151,252,228,0.16)",
                      color: w.flowMm < 0 ? "#ff6b7a" : "#97FCE4",
                      fontWeight: 700,
                    }}
                  >
                    <span>Net flow</span>
                    <span>
                      {w.flowMm < 0 ? "−" : "+"}$
                      {Math.abs(w.flowMm).toFixed(1)}M
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Bar
            dataKey="flowMm"
            name="Net flow"
            radius={[6, 6, 0, 0]}
            isAnimationActive={false}
          >
            {weeks.map((w) => (
              <Cell
                key={w.weekStart}
                fill={w.flowMm < 0 ? "#ff6b7a" : "#97FCE4"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
