import Link from "next/link";
import HypePriceHero from "@/components/HypePriceHero";

export const metadata = { title: "Hypercurb · Main" };

export default function Home() {
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
          <span className="hub-value">+$136M</span>
          <span className="hub-sub">
            BHYP (Bitwise) + THYP (21Shares) cumulative net flow since launch.
          </span>
          <span className="hub-cta">Open ETF board</span>
        </Link>

        <Link href="/perps" className="hub-tile">
          <span className="hub-eyebrow">Perp Volume · 7d</span>
          <span className="hub-value">$45.9B</span>
          <span className="hub-sub">
            Hyperliquid L1 leads all chains by perp volume — $190B 30-day, $10B
            open interest.
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
