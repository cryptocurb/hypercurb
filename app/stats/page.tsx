export const metadata = { title: "Stats · Hypercurb" };

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-white">Hyperliquid Stats</h2>
        <p className="font-mono text-xs text-white/50">
          HYPE token economics, HLP vault, staking, buybacks · placeholder
        </p>
      </div>
      <div className="card-border p-8">
        <p className="font-mono text-sm text-white/70">
          Candidates for this tab: HYPE buyback chart, HLP vault returns, top
          traders leaderboard, funding-rate trends, HYPE staking APR. Picking
          after Milestone 3 (Perp Volume) is done.
        </p>
      </div>
    </div>
  );
}
