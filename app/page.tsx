import Link from "next/link";
import HypePriceHero from "@/components/HypePriceHero";
import { etfView } from "@/lib/etf";
import { perpsView } from "@/lib/perps";

export const metadata = { title: "Hypercurb · Main" };

function bigMm(mm: number) {
  const abs = Math.abs(mm);
  const sign = mm < 0 ? "−" : "+";
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}M`;
}

export default function Home() {
  const etf = etfView();
  const etfTotalMm = Object.values(etf.issuerCumulative).reduce(
    (s, v) => s + v,
    0
  );
  const perps = perpsView();
  const perpHl = perps.hl;

  return (
    <div className="space-y-7">
      {/* Live HYPE price + daily candle chart */}
      <HypePriceHero />

      {/* Header strip */}
      <section className="hub-header">
        <div>
          <h1>
            Hyper<span className="accent">liquid</span> This Week
          </h1>
          <p className="hub-blurb">
            A weekly snapshot of where Hyperliquid stands across HYPE ETF
            flows, perpetual volume, open interest, and onchain activity. Pick
            a tile to dive in — each tab is screenshot-ready and posted weekly
            to{" "}
            <a
              href="https://x.com/cryptocurb"
              className="text-[var(--hl-aqua)] hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              x.com/cryptocurb
            </a>
            .
          </p>
        </div>
      </section>

      {/* Hub tiles — 3 across (4th tab is "Stats" placeholder) */}
      <div className="hub-grid">
        <Link href="/etf" className="hub-tile">
          <span className="hub-eyebrow">ETF Net Flow · since May 12</span>
          <span className="hub-value">{bigMm(etfTotalMm)}</span>
          <span className="hub-sub">
            BHYP (Bitwise) + THYP (21Shares) cumulative net flow since launch
            on May 12, 2026.
          </span>
          <span className="hub-cta">Open ETF board</span>
        </Link>

        <Link href="/perps" className="hub-tile">
          <span className="hub-eyebrow">Perp Volume · 7d</span>
          <span className="hub-value">
            {perpHl ? `$${perpHl.vol7dBn.toFixed(1)}B` : "—"}
          </span>
          <span className="hub-sub">
            Hyperliquid L1 leads all chains —{" "}
            {perpHl ? `$${Math.round(perpHl.vol30dBn)}B 30-day` : "—"},{" "}
            {perpHl ? `$${perpHl.oiBn.toFixed(1)}B open interest` : "—"},{" "}
            {perpHl ? `${perpHl.share30d.toFixed(0)}% market share` : "—"}.
          </span>
          <span className="hub-cta">Open Perp board</span>
        </Link>

        <Link href="/stats" className="hub-tile">
          <span className="hub-eyebrow">Coming soon</span>
          <span className="hub-value">Stats</span>
          <span className="hub-sub">
            HYPE staking, HLP vault performance, buybacks, top trader leaderboard
            — TBD.
          </span>
          <span className="hub-cta">Preview</span>
        </Link>
      </div>
    </div>
  );
}
