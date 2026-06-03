import BoardFrame from "@/components/BoardFrame";
import BoardHeader from "@/components/BoardHeader";
import ScreenshotButton from "@/components/ScreenshotButton";
import StackedWeekly from "@/components/charts/StackedWeekly";
import { perpsView } from "@/lib/perps";

// Revalidate every 7 days so the "latest completed week" recomputes Monday
// morning. The Cowork scheduled task (run Mondays) also pings the user to
// update the data file from DefiLlama for that week.
export const revalidate = 604800;

export const metadata = { title: "Perp Volume · Hypercurb" };

// ---------- helpers ----------
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
function weekRangeLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const sM = start.toLocaleDateString("en-US", { month: "short" });
  const eM = end.toLocaleDateString("en-US", { month: "short" });
  return sM === eM
    ? `${start.getDate()}–${end.getDate()} ${eM}, ${end.getFullYear()}`
    : `${start.getDate()} ${sM} – ${end.getDate()} ${eM}, ${end.getFullYear()}`;
}
function bigBn(bn: number) {
  return `$${bn.toFixed(2)}B`;
}
function bigBnRound(bn: number) {
  return `$${Math.round(bn).toLocaleString("en-US")}B`;
}
function compactBn(bn: number) {
  if (bn >= 100) return `$${Math.round(bn)}B`;
  if (bn >= 10) return `$${bn.toFixed(1)}B`;
  return `$${bn.toFixed(2)}B`;
}
function compactOI(bn: number) {
  if (bn >= 1) return `$${bn.toFixed(2)}B`;
  return `$${Math.round(bn * 1000)}M`;
}
function pct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}
function signedPct(n: number, digits = 1) {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(digits)}%`;
}

export default function PerpsPage() {
  const v = perpsView();
  const {
    snapshotWeekStart,
    chainRows,
    hlChain,
    runnerChain,
    hlRank,
    leadXChain,
    chainShare,
    chainTotals7dBn,
    stack,
    topChains,
    wowPct,
    venues,
    hl,
    othersBn,
    total30dBn,
  } = v;

  // Top 5 chains for the ranked bar leaderboard (Hyperliquid L1 always #1)
  const maxVol = chainRows[0]?.vol7dBn || 1;

  return (
    <div className="space-y-6">
      {/* ===== Board 1: Chains ranked snapshot (latest completed week) ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-white">Perp Volume</h2>
          <p className="font-mono text-xs text-white/50">
            Weekly perp volume by chain · DefiLlama · last completed week ·
            refreshes Monday
          </p>
        </div>
        <ScreenshotButton
          targetId="perps-rank-shot"
          filename={`hype-perp-chains-${snapshotWeekStart ?? "latest"}.png`}
        />
      </div>

      <BoardFrame id="perps-rank-shot">
        <div className="hl-card">
          <BoardHeader
            a="Hyperliquid"
            b="Leads"
            c="Perp Volume"
            sub={`Weekly perp volume by chain  ·  Source: DefiLlama  ·  ${
              snapshotWeekStart
                ? `Week of ${weekRangeLabel(snapshotWeekStart)}`
                : "Latest completed week"
            }`}
          />

          <div className="chain-ranks">
            {chainRows.map((c, i) => {
              const isHL = c.slug === "hyperliquid-l1";
              return (
                <div
                  key={c.slug}
                  className={isHL ? "chain-row chain-row-hl" : "chain-row"}
                >
                  <div className="chain-rank">#{i + 1}</div>
                  <div
                    className="chain-dot"
                    style={{ background: c.color }}
                  />
                  <div className="chain-name">{c.name}</div>
                  <div className="chain-bar-wrap">
                    <div
                      className="chain-bar"
                      style={{
                        width: `${Math.max(2, (c.vol7dBn / maxVol) * 100)}%`,
                        background: c.color,
                      }}
                    />
                  </div>
                  <div className="chain-vol">{compactBn(c.vol7dBn)}</div>
                </div>
              );
            })}
          </div>

          {/* Bottom stat tiles */}
          <div className="hl-stats-row">
            <div className="hl-stat-box">
              <div className="hl-stat-label">HL Weekly Volume</div>
              <div className="hl-stat-value hl-aqua">
                {hlChain ? compactBn(hlChain.vol7dBn) : "—"}
              </div>
              <div className="hl-stat-sub">
                {signedPct(wowPct)} WoW
              </div>
            </div>
            <div className="hl-stat-box">
              <div className="hl-stat-label">Rank</div>
              <div className="hl-stat-value hl-aqua">#{hlRank}</div>
              <div className="hl-stat-sub">of all chains</div>
            </div>
            <div className="hl-stat-box">
              <div className="hl-stat-label">Lead vs #2</div>
              <div className="hl-stat-value hl-foam">
                {leadXChain > 0 ? `${leadXChain.toFixed(1)}×` : "—"}
              </div>
              <div className="hl-stat-sub">
                {runnerChain ? `vs ${runnerChain.name}` : ""}
              </div>
            </div>
            <div className="hl-stat-box">
              <div className="hl-stat-label">Market Share</div>
              <div className="hl-stat-value hl-aqua">
                {pct(chainShare)}
              </div>
              <div className="hl-stat-sub">
                of {compactBn(chainTotals7dBn)} 7d
              </div>
            </div>
          </div>

          <div className="hl-source-bar">
            <span className="hl-source-text">
              Source: DefiLlama &nbsp;·&nbsp; weekly perp volume by chain
              &nbsp;·&nbsp;{" "}
              <span>
                Hyperliquid #1 — {pct(chainShare)} of all weekly perp volume
              </span>
            </span>
            <span className="hl-unit-tag">US$</span>
          </div>
        </div>
      </BoardFrame>

      {/* ===== Board 2: Stacked weekly by chain (90 completed weeks) ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="font-serif text-2xl text-white">
            Perp volume by chain
          </h2>
          <p className="font-mono text-xs text-white/50">
            Weekly · last {stack.length} completed weeks · top 5 chains + others
          </p>
        </div>
        <ScreenshotButton
          targetId="perps-stacked-shot"
          filename={`hype-perp-stacked-${snapshotWeekStart ?? "latest"}.png`}
        />
      </div>

      <BoardFrame id="perps-stacked-shot">
        <div className="hl-card">
          <BoardHeader
            a="Perp"
            b="Volume by"
            c="Chain"
            sub={`Weekly stacked column chart  ·  ${stack.length} weeks  ·  Source: DefiLlama`}
          />
          <div style={{ marginTop: 8 }}>
            <StackedWeekly stack={stack} topChains={topChains} />
          </div>
          <div className="hl-source-bar">
            <span className="hl-source-text">
              Source: DefiLlama &nbsp;·&nbsp; {stack.length} weeks
              &nbsp;·&nbsp;{" "}
              <span>
                Hyperliquid L1 share grew to{" "}
                {stack.length > 0
                  ? pct(
                      (stack[stack.length - 1].segments[0].vol /
                        stack[stack.length - 1].total) *
                        100
                    )
                  : "—"}{" "}
                in the latest week
              </span>
            </span>
            <span className="hl-unit-tag">US$</span>
          </div>
        </div>
      </BoardFrame>

      {/* ===== Board 3: Top Perp DEXs (per-protocol leaderboard) ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="font-serif text-2xl text-white">Top Perp DEXs</h2>
          <p className="font-mono text-xs text-white/50">
            Top 8 perp DEX protocols ranked by 7-day volume · DefiLlama
          </p>
        </div>
        <ScreenshotButton
          targetId="perps-dexs-shot"
          filename={`hype-top-perp-dexs-${v.leaderboardMeta.snapshotDate}.png`}
        />
      </div>

      <BoardFrame id="perps-dexs-shot">
        <div className="hl-card">
          <BoardHeader
            a="Top"
            b="Perp"
            c="DEXs"
            sub={`Top perp DEX protocols by 7-day volume  ·  US$B  ·  ${longDate(v.leaderboardMeta.snapshotDate)}`}
          />

          <div className="hl-table-wrap">
            <table className="hl-table perp-leaderboard">
              <thead>
                <tr className="hl-col-header">
                  <th className="perp-rank-col">#</th>
                  <th className="perp-venue-col">PROTOCOL</th>
                  <th className="perp-chain-col">CHAIN</th>
                  <th>7D VOLUME</th>
                  <th>30D VOLUME</th>
                  <th>OPEN INTEREST</th>
                  <th>SHARE</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => (
                  <tr
                    key={venue.name}
                    className={
                      venue.isHyperliquid ? "hl-data-row hl-latest-row" : "hl-data-row"
                    }
                  >
                    <td className="perp-rank">{venue.rank}</td>
                    <td className="perp-venue">
                      <span
                        className={
                          venue.isHyperliquid
                            ? "perp-venue-name hl-aqua"
                            : "perp-venue-name"
                        }
                      >
                        {venue.name}
                      </span>
                      {venue.isHyperliquid ? (
                        <span className="hl-latest-badge">LEADER</span>
                      ) : null}
                    </td>
                    <td className="perp-chain">{venue.chain}</td>
                    <td className={venue.isHyperliquid ? "hl-aqua hl-total" : ""}>
                      ${venue.vol7dBn.toFixed(2)}B
                    </td>
                    <td>${venue.vol30dBn.toFixed(2)}B</td>
                    <td>${venue.oiBn.toFixed(2)}B</td>
                    <td className={venue.isHyperliquid ? "hl-aqua hl-total" : ""}>
                      {pct(venue.share30d)}
                    </td>
                  </tr>
                ))}
                <tr className="hl-data-row perp-others-row">
                  <td>—</td>
                  <td className="perp-venue">
                    <span className="perp-venue-name perp-others-label">
                      All others
                    </span>
                  </td>
                  <td className="perp-chain">tracked + long tail</td>
                  <td>—</td>
                  <td>${othersBn.toFixed(2)}B</td>
                  <td>—</td>
                  <td>{pct((othersBn / total30dBn) * 100)}</td>
                </tr>
                <tr className="hl-total-row">
                  <td colSpan={4}>Total tracked perp DEX activity</td>
                  <td className="hl-aum-cell">${total30dBn.toFixed(2)}B</td>
                  <td>30-day</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="hl-stats-row">
            <div className="hl-stat-box">
              <div className="hl-stat-label">HL 7-Day Volume</div>
              <div className="hl-stat-value hl-aqua">
                {hl ? bigBn(hl.vol7dBn) : "—"}
              </div>
              <div className="hl-stat-sub">{signedPct(wowPct)} WoW</div>
            </div>
            <div className="hl-stat-box">
              <div className="hl-stat-label">HL 30-Day Volume</div>
              <div className="hl-stat-value hl-foam">
                {hl ? bigBnRound(hl.vol30dBn) : "—"}
              </div>
              <div className="hl-stat-sub">
                {hl ? pct(hl.share30d) : "—"} protocol share
              </div>
            </div>
            <div className="hl-stat-box">
              <div className="hl-stat-label">HL Open Interest</div>
              <div className="hl-stat-value hl-aqua">
                {hl ? compactOI(hl.oiBn) : "—"}
              </div>
              <div className="hl-stat-sub">current snapshot</div>
            </div>
            <div className="hl-stat-box">
              <div className="hl-stat-label">Lead Over #2</div>
              <div className="hl-stat-value hl-foam">
                {hl && venues[1]
                  ? `${(hl.vol7dBn / venues[1].vol7dBn).toFixed(1)}×`
                  : "—"}
              </div>
              <div className="hl-stat-sub">
                vs {venues[1]?.name ?? "—"} 7d
              </div>
            </div>
          </div>

          <div className="hl-source-bar">
            <span className="hl-source-text">
              Source: {v.leaderboardMeta.source} &nbsp;·&nbsp;{" "}
              {longDate(v.leaderboardMeta.snapshotDate)} &nbsp;·&nbsp;{" "}
              <span>
                Hyperliquid clears {hl ? pct(hl.share30d) : "—"} of all
                decentralized perp volume
              </span>
            </span>
            <span className="hl-unit-tag">US$B</span>
          </div>
        </div>
      </BoardFrame>

      <p className="font-mono text-[11px] text-white/40 text-center pt-2">
        {v.stackedMeta.note}
      </p>
    </div>
  );
}
