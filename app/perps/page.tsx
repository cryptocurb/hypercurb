export const metadata = { title: "Perp Volume · Hypercurb" };

export default function PerpsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-white">Weekly Perp Volume</h2>
        <p className="font-mono text-xs text-white/50">
          Hyperliquid L1 vs all other perp DEXes · Source: DefiLlama
        </p>
      </div>
      <div className="card-border p-8">
        <p className="font-mono text-sm text-white/70">
          Weekly perp volume ranked + open interest snapshot + stacked
          weekly-over-time chart — coming in Milestone 3.
        </p>
      </div>
    </div>
  );
}
