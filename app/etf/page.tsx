export const metadata = { title: "ETF Flows · Hypercurb" };

export default function EtfPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-white">HYPE ETF Flows</h2>
        <p className="font-mono text-xs text-white/50">
          Daily net flows by issuer · BHYP (Bitwise) + THYP (21Shares) · Source:
          Farside Investors
        </p>
      </div>
      <div className="card-border p-8">
        <p className="font-mono text-sm text-white/70">
          Daily flow table, weekly chart, and cumulative chart — coming in
          Milestone 2. Data backfill goes back to ETF launch on May 12, 2026.
        </p>
      </div>
    </div>
  );
}
