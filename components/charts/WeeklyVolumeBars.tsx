"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeekVolPoint } from "@/lib/perps";

function weekRangeLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const sM = start.toLocaleDateString("en-US", { month: "short" });
  const eM = end.toLocaleDateString("en-US", { month: "short" });
  return sM === eM
    ? `${start.getDate()}–${end.getDate()} ${eM} ${end.getFullYear()}`
    : `${start.getDate()} ${sM} – ${end.getDate()} ${eM} ${end.getFullYear()}`;
}
function shortWeekTick(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Weekly Hyperliquid perp volume bar chart — one bar per ISO week.
 * Aqua bars on the brand-aligned dark background. Tooltip shows the full
 * week range and exact volume in $B.
 */
export default function WeeklyVolumeBars({
  weeks,
  height = 320,
}: {
  weeks: WeekVolPoint[];
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
            tickFormatter={(v: number) => `$${v.toFixed(0)}B`}
            width={56}
          />
          <Tooltip
            cursor={{ fill: "rgba(151,252,228,0.06)" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={(props: any) => {
              const { active, payload } = props;
              if (!active || !payload || !payload.length) return null;
              const w = payload[0].payload as WeekVolPoint;
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
                    minWidth: 180,
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
                      fontWeight: 700,
                    }}
                  >
                    <span>Perp volume</span>
                    <span>${w.volBn.toFixed(2)}B</span>
                  </div>
                </div>
              );
            }}
          />
          <Bar
            dataKey="volBn"
            name="Perp volume"
            radius={[6, 6, 0, 0]}
            fill="#97FCE4"
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
