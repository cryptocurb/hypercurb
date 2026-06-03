"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type StackedSeries = {
  key: string;
  name: string;
  color: string;
};

type Point = Record<string, string | number>;

/**
 * Stacked area chart for the ETF Cumulative Flows by Issuer board. Each
 * series shares a single `stackId` so the bands cumulate vertically into the
 * familiar Farside-style ETF cumulative shape, with Hyperliquid-palette
 * colors.
 */
export default function CumulativeStackedArea({
  data,
  series,
  height = 380,
}: {
  data: Point[];
  series: StackedSeries[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 16, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`area-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.55} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(151,252,228,0.07)" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(245,254,253,0.55)", fontSize: 11 }}
            tickFormatter={(d: string) =>
              new Date(d).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
            minTickGap={28}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(245,254,253,0.55)", fontSize: 11 }}
            tickFormatter={(v: number) => `$${v.toFixed(0)}M`}
            width={64}
            domain={["auto", "auto"]}
            allowDataOverflow={false}
          />
          <Tooltip
            cursor={{ stroke: "rgba(151,252,228,0.18)" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={(props: any) => {
              const { active, payload, label } = props;
              if (!active || !payload || !payload.length) return null;
              const dateLabel = label
                ? new Date(label).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "";
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const total = payload.reduce(
                (s: number, p: any) => s + (Number(p.value) || 0),
                0
              );
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
                    {dateLabel}
                  </div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {payload.map((p: any) => (
                    <div
                      key={p.dataKey ?? p.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        color: p.color,
                      }}
                    >
                      <span>{p.name}</span>
                      <span style={{ fontWeight: 700 }}>
                        {Number(p.value) < 0 ? "−" : ""}$
                        {Math.abs(Number(p.value)).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginTop: 6,
                      paddingTop: 6,
                      borderTop: "1px solid rgba(151,252,228,0.16)",
                      color: "#f5fefd",
                      fontWeight: 700,
                    }}
                  >
                    <span>Total</span>
                    <span>
                      {total < 0 ? "−" : ""}$
                      {Math.abs(total).toFixed(1)}M
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: "Space Mono, monospace",
              fontSize: 11,
              color: "rgba(245,254,253,0.7)",
              paddingTop: 10,
              letterSpacing: "0.05em",
            }}
            iconType="circle"
            iconSize={8}
            verticalAlign="bottom"
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stackId="1"
              stroke={s.color}
              strokeWidth={1.2}
              fill={`url(#area-${s.key})`}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
