import CumulativeStackedArea from "@/components/charts/CumulativeStackedArea";
import WeeklyEtfBars from "@/components/charts/WeeklyEtfBars";
import {
  etfView,
  weeklyFlows,
  cumulativeByIssuer,
  ISSUER_ORDER,
  type IssuerKey,
} from "@/lib/etf";

export const metadata = { title: "ETF Flows · Hypercurb" };

// ----- date helpers -----
function parseLocal(d: string) {
  const [y, m, dd] = d.split("-").map(Number);
  return new Date(y, m - 1, dd);
}
function longDate(d: string) {
  return parseLocal(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function rowDate(d: string) {
  return parseLocal(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function flowCell(mm: number) {
  if (Math.abs(mm) < 0.05) return "0.0";
  if (mm < 0) return `(${Math.abs(mm).toFixed(1)})`;
  return mm.toFixed(1);
}
function flowClass(mm: number) {
  if (Math.abs(mm) < 0.05) return "etf-zero";
  return mm < 0 ? "etf-neg" : "etf-pos";
}
function bigMm(mm: number) {
  const abs = Math.abs(mm);
  const sign = mm < 0 ? "−" : "";
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}M`;
}
function signed1(mm: number) {
  const s = mm < 0 ? "−" : "+";
  return `${s}$${Math.abs(mm).toFixed(1)}M`;
}

export default function EtfPage() {
  const v = etfView();
  const rows = v.last10;
  const weeks = weeklyFlows();

  // ----- Cumulative-by-issuer chart series + stats -----
  // Hyperliquid palette: aqua for BHYP (biggest), purple for THYP (contrast).
  const ISSUER_COLORS: Record<IssuerKey, string> = {
    bhyp: "#97FCE4", // Hyperliquid aquamarine — primary
    thyp: "#B695FF", // soft purple — distinguishable from aqua
  };

  const cumData = cumulativeByIssuer();

  // Order series largest-to-smallest by final cumulative so the dominant
  // issuer anchors the bottom of the stack.
  const cumSeries = [...ISSUER_ORDER]
    .sort(
      (a, b) => Math.abs(v.issuerCumulative[b]) - Math.abs(v.issuerCumulative[a])
    )
    .map((k) => {
      const iss = v.issuers.find((i) => i.key === k);
      return {
        key: k,
        name: iss?.ticker ?? k.toUpperCase(),
        color: ISSUER_COLORS[k],
      };
    });

  const issuerStats = ISSUER_ORDER.map((k) => {
    const iss = v.issuers.find((i) => i.key === k);
    return {
      key: k,
      ticker: iss?.ticker ?? k.toUpperCase(),
      name: iss?.name ?? k,
      fee: iss?.fee ?? 0,
      value: v.issuerCumulative[k],
      color: ISSUER_COLORS[k],
    };
  }).sort((a, b) => b.value - a.value);

  // Net cumulative AUM banner
  const cumTotalMm = issuerStats.reduce((s, i) => s + i.value, 0);

  const contributors =
    v.latestContributors.length > 0
      ? v.latestContributors.join(" + ")
      : "no net inflows";

  // ----- Last-week highlight (most recent completed week) -----
  const lastWeek = weeks[weeks.length - 1] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-white">HYPE ETF Flows</h2>
        <p className="font-mono text-xs text-white/50">
          Daily net flows by issuer · BHYP (Bitwise) + THYP (21Shares) ·
          Source: Farside Investors · Updated {longDate(v.meta.updatedAt)}
        </p>
      </div>

      {/* ---- Cumulative AUM banner ---- */}
      <div className="etf-aum-banner">
        <div className="etf-aum-label">Cumulative net flow · since launch</div>
        <div className="etf-aum-value">{bigMm(cumTotalMm)}</div>
        <div className="etf-aum-sub">
          {v.daysSinceLaunch} days since May 12, 2026 · {weeks.length} trading
          weeks · {v.rows.length} sessions
        </div>
      </div>

      {/* ---- Per-issuer stats ---- */}
      <div className="etf-issuer-grid">
        {issuerStats.map((iss) => {
          const share =
            cumTotalMm > 0
              ? Math.round((iss.value / cumTotalMm) * 100)
              : 0;
          return (
            <div
              key={iss.key}
              className="etf-issuer-card"
              style={{ borderColor: `${iss.color}55` }}
            >
              <div
                className="etf-issuer-bar"
                style={{ background: iss.color }}
              />
              <div className="etf-issuer-head">
                <span
                  className="etf-issuer-ticker"
                  style={{ color: iss.color }}
                >
                  {iss.ticker}
                </span>
                <span className="etf-issuer-name">{iss.name}</span>
              </div>
              <div className="etf-issuer-value">{bigMm(iss.value)}</div>
              <div className="etf-issuer-sub">
                {share}% of total · {iss.fee.toFixed(2)}% mgmt fee
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Last-week highlight ---- */}
      {lastWeek ? (
        <div className="etf-week-highlight">
          <div>
            <div className="etf-week-label">Most recent week</div>
            <div className="etf-week-value">{signed1(lastWeek.flowMm)}</div>
          </div>
          <div className="etf-week-split">
            <div>
              <span style={{ color: "#97FCE4" }}>BHYP</span>{" "}
              ${lastWeek.bhyp.toFixed(1)}M
            </div>
            <div>
              <span style={{ color: "#B695FF" }}>THYP</span>{" "}
              ${lastWeek.thyp.toFixed(1)}M
            </div>
          </div>
        </div>
      ) : null}

      {/* ---- Daily flow table ---- */}
      <div className="card-border p-5 md:p-7">
        <div className="etf-board-head">
          <div>
            <h3 className="font-mono text-sm uppercase tracking-widest text-white/80">
              Daily flows · last {rows.length} sessions
            </h3>
            <p className="font-mono text-xs text-white/45 mt-1">
              {contributors === "no net inflows"
                ? "Latest session: no net inflows"
                : `Latest session: net inflows from ${contributors}`}
            </p>
          </div>
        </div>
        <div className="etf-table-wrap">
          <table className="etf-table">
            <thead>
              <tr>
                <th>DATE</th>
                {v.issuers.map((iss) => (
                  <th key={iss.key}>
                    <div
                      className="etf-ticker-chip"
                      style={{
                        color: ISSUER_COLORS[iss.key],
                        borderColor: `${ISSUER_COLORS[iss.key]}55`,
                      }}
                    >
                      {iss.ticker}
                    </div>
                    <div className="etf-issuer-tag">{iss.name}</div>
                  </th>
                ))}
                <th>TOTAL</th>
              </tr>
              <tr className="etf-meta-row">
                <td>FEE</td>
                {v.issuers.map((iss) => (
                  <td key={iss.key}>{iss.fee.toFixed(2)}%</td>
                ))}
                <td />
              </tr>
              <tr className="etf-meta-row">
                <td>STAKING</td>
                {v.issuers.map((iss) => (
                  <td key={iss.key}>{iss.staking ? "YES" : "NO"}</td>
                ))}
                <td />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date}>
                  <td className="etf-date">{rowDate(r.date)}</td>
                  {v.issuers.map((iss) => (
                    <td key={iss.key} className={flowClass(r[iss.key])}>
                      {flowCell(r[iss.key])}
                    </td>
                  ))}
                  <td className={`etf-total ${flowClass(r.total)}`}>
                    {flowCell(r.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Weekly chart ---- */}
      <div className="card-border p-5 md:p-7">
        <h3 className="font-mono text-sm uppercase tracking-widest text-white/80">
          Weekly net flow · since launch
        </h3>
        <p className="font-mono text-xs text-white/45 mt-1 mb-4">
          Bars sum BHYP + THYP for each Mon–Fri trading week
        </p>
        <WeeklyEtfBars weeks={weeks} />
      </div>

      {/* ---- Cumulative chart ---- */}
      <div className="card-border p-5 md:p-7">
        <h3 className="font-mono text-sm uppercase tracking-widest text-white/80">
          Cumulative flows by issuer
        </h3>
        <p className="font-mono text-xs text-white/45 mt-1 mb-4">
          Running total per issuer since May 12, 2026 — stack height = total AUM
        </p>
        <CumulativeStackedArea
          data={cumData}
          series={cumSeries}
          height={400}
        />
      </div>

      <p className="font-mono text-[11px] text-white/40 text-center pt-2">
        {v.meta.note}
      </p>
    </div>
  );
}
