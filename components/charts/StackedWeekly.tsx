"use client";

import { useState } from "react";
import type { StackWeek, ChainDef } from "@/lib/perps";

function weekRange(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const sM = start.toLocaleDateString("en-US", { month: "short" });
  const eM = end.toLocaleDateString("en-US", { month: "short" });
  return sM === eM
    ? `${start.getDate()} – ${end.getDate()} ${eM} ${end.getFullYear()}`
    : `${start.getDate()} ${sM} – ${end.getDate()} ${eM} ${end.getFullYear()}`;
}

const OTHERS: ChainDef = { slug: "others", name: "Others", color: "#5a5a72" };

/** A "nice" gridline step (1/2/2.5/5 × 10^n) sized to the data magnitude. */
function niceStep(maxValue: number, targetTicks = 4): number {
  const rough = Math.max(maxValue, 1) / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const nice =
    norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

function fmtBn(bn: number): string {
  if (bn >= 1000) return `$${(bn / 1000).toFixed(2)}T`;
  if (bn >= 100) return `$${Math.round(bn)}B`;
  if (bn >= 10) return `$${bn.toFixed(1)}B`;
  return `$${bn.toFixed(2)}B`;
}

/**
 * Stacked column chart of weekly perp volume by chain.
 * Pure CSS columns + hover tooltip — rasterizes cleanly in html2canvas.
 */
export default function StackedWeekly({
  stack,
  topChains,
}: {
  stack: StackWeek[];
  topChains: ChainDef[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const H = 320;

  if (!stack.length) {
    return (
      <div className="font-mono text-sm text-white/50">
        Weekly chain data unavailable — refreshes on next pull.
      </div>
    );
  }

  const maxTotal = Math.max(1, ...stack.map((w) => w.total));
  const step = niceStep(maxTotal, 4);
  const axisMax = Math.max(step, Math.ceil(maxTotal / step) * step);
  const lines: number[] = [];
  for (let v = 0; v <= axisMax + 1; v += step) lines.push(v);

  const legend = [...topChains, OTHERS];
  const hovered = hover != null ? stack[hover] : null;
  const pct = hover != null ? ((hover + 0.5) / stack.length) * 100 : 0;
  const tipShift = pct < 26 ? "0%" : pct > 74 ? "-100%" : "-50%";

  return (
    <div className="wkx">
      <div className="wkx-legend">
        {legend.map((c) => (
          <span key={c.slug} className="wkx-leg">
            <span className="wkx-dot" style={{ background: c.color }} />
            {c.name}
          </span>
        ))}
      </div>
      <div className="wkx-body">
        <div className="wkx-yaxis" style={{ height: H }}>
          {lines.map((v) => (
            <div
              key={v}
              className="wkx-ytick"
              style={{ top: ((axisMax - v) / axisMax) * H - 7 }}
            >
              {fmtBn(v)}
            </div>
          ))}
        </div>
        <div
          className="wkx-plot"
          style={{ height: H }}
          onMouseLeave={() => setHover(null)}
        >
          {lines.map((v) => (
            <div
              key={v}
              className="wkx-line"
              style={{ top: ((axisMax - v) / axisMax) * H }}
            />
          ))}
          <div className="wkx-cols">
            {stack.map((w, idx) => (
              <div
                key={w.weekStart}
                className={hover === idx ? "wkx-col wkx-col-on" : "wkx-col"}
                onMouseEnter={() => setHover(idx)}
              >
                {[...w.segments].reverse().map((s, i) => (
                  <div
                    key={i}
                    className="wkx-seg"
                    style={{
                      height: (s.vol / axisMax) * H,
                      background: s.color,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          {hovered ? (
            <div
              className="wkx-tip"
              style={{ left: `${pct}%`, transform: `translateX(${tipShift})` }}
            >
              <div className="wkx-tip-date">{weekRange(hovered.weekStart)}</div>
              <div className="wkx-tip-total">
                <span>Total</span>
                <span>{fmtBn(hovered.total)}</span>
              </div>
              {[...hovered.segments]
                .sort((a, b) => b.vol - a.vol)
                .map((s) => (
                  <div key={s.name} className="wkx-tip-row">
                    <span
                      className="wkx-tip-dot"
                      style={{ background: s.color }}
                    />
                    <span className="wkx-tip-name">{s.name}</span>
                    <span className="wkx-tip-val">{fmtBn(s.vol)}</span>
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
