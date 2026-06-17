/**
 * lib/perpsLive.ts
 *
 * Live Hyperliquid perps data from DefiLlama's derivatives API.
 *
 * NOTE: The DefiLlama derivatives API currently requires a paid plan
 * (https://defillama.com/subscription). Until a key is provisioned the
 * functions below return null and the page falls back to static JSON via
 * lib/perps.ts.
 *
 * TODO: Once a paid API key is available, pass it as the
 *       `Authorization` header and wire the functions into app/perps/page.tsx.
 */

import { mondayOf } from "@/lib/dates";

const DERIVATIVES_URL =
  "https://api.llama.fi/overview/derivatives?excludeTotalDataChart=false&excludeTotalDataChartBreakdown=false&dataType=dailyVolume";

// ---------------------------------------------------------------------------
// Types that mirror the DefiLlama derivatives API response shape.
// Adjust if the paid API returns a different schema.
// ---------------------------------------------------------------------------

type DLProtocol = {
  name: string;
  displayName?: string;
  chains?: string[];
  total7d?: number;
  total30d?: number;
  totalAllTime?: number;
  // open interest is not always present
  openInterest?: number;
};

type DLDerivativesResponse = {
  protocols?: DLProtocol[];
  // daily totals keyed by timestamp (unix seconds)
  totalDataChart?: [number, number][];
  // chain breakdown: { [chainName]: [timestamp, volume][] }
  totalDataChartBreakdown?: Record<string, [number, number][]>;
};

// ---------------------------------------------------------------------------
// Public types returned by the live functions
// ---------------------------------------------------------------------------

export type LiveVenue = {
  rank: number;
  name: string;
  chain: string;
  vol7dBn: number;
  vol30dBn: number;
  oiBn: number;
  isHyperliquid: boolean;
};

export type LiveChainWeek = {
  weekStart: string; // "YYYY-MM-DD" (Monday)
  hyperliquidL1: number; // $B
  solana: number;
  ethereum: number;
  arbitrum: number;
  others: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toB(usd: number | undefined): number {
  if (!usd) return 0;
  return usd / 1e9;
}

/** Chain name normalisation (DefiLlama uses slightly different names). */
function normaliseChain(raw: string): string {
  const map: Record<string, string> = {
    "Hyperliquid": "hyperliquid-l1",
    "Solana": "solana",
    "Ethereum": "ethereum",
    "Arbitrum": "arbitrum",
  };
  return map[raw] ?? "others";
}

// ---------------------------------------------------------------------------
// getPerpsLeaderboard
// ---------------------------------------------------------------------------

/**
 * Fetches the DefiLlama derivatives overview and returns the top protocols
 * sorted by 30-day volume, with Hyperliquid flagged.
 *
 * Returns null if the API is unavailable (e.g. requires paid plan).
 */
export async function getPerpsLeaderboard(): Promise<LiveVenue[] | null> {
  try {
    const res = await fetch(DERIVATIVES_URL, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      console.error(
        `[perpsLive] getPerpsLeaderboard: API returned ${res.status} — falling back to static data`
      );
      return null;
    }
    const data = (await res.json()) as DLDerivativesResponse;
    const protocols = data.protocols ?? [];

    const venues: LiveVenue[] = protocols
      .map((p, i) => {
        const name = p.displayName ?? p.name;
        const chain = p.chains?.[0] ?? "Unknown";
        return {
          rank: i + 1,
          name,
          chain,
          vol7dBn: toB(p.total7d),
          vol30dBn: toB(p.total30d),
          oiBn: toB(p.openInterest),
          isHyperliquid:
            name.toLowerCase().includes("hyperliquid") ||
            p.name.toLowerCase() === "hyperliquid",
        };
      })
      .sort((a, b) => b.vol30dBn - a.vol30dBn)
      .map((v, i) => ({ ...v, rank: i + 1 }));

    return venues;
  } catch (err) {
    console.error("[perpsLive] getPerpsLeaderboard error:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// getPerpsChainVolumes
// ---------------------------------------------------------------------------

/**
 * Fetches the DefiLlama derivatives breakdown by chain and aggregates daily
 * data into Monday-anchored weekly buckets (in $B).
 *
 * Returns null if the API is unavailable.
 *
 * TODO: The paid API may return chain breakdown under a different key.
 *       Verify the response shape once a key is available and adjust
 *       `totalDataChartBreakdown` access accordingly.
 */
export async function getPerpsChainVolumes(): Promise<LiveChainWeek[] | null> {
  try {
    const res = await fetch(DERIVATIVES_URL, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      console.error(
        `[perpsLive] getPerpsChainVolumes: API returned ${res.status} — falling back to static data`
      );
      return null;
    }
    const data = (await res.json()) as DLDerivativesResponse;
    const breakdown = data.totalDataChartBreakdown;
    if (!breakdown) {
      console.warn(
        "[perpsLive] getPerpsChainVolumes: no totalDataChartBreakdown in response"
      );
      return null;
    }

    // Aggregate into weekly buckets keyed by Monday ISO string
    const weeks: Map<
      string,
      { hyperliquidL1: number; solana: number; ethereum: number; arbitrum: number; others: number }
    > = new Map();

    for (const [chainRaw, series] of Object.entries(breakdown)) {
      const chainSlug = normaliseChain(chainRaw);
      for (const [ts, volUsd] of series) {
        const day = new Date(ts * 1000);
        const monday = mondayOf(day);
        if (!weeks.has(monday)) {
          weeks.set(monday, { hyperliquidL1: 0, solana: 0, ethereum: 0, arbitrum: 0, others: 0 });
        }
        const w = weeks.get(monday)!;
        const volBn = volUsd / 1e9;
        if (chainSlug === "hyperliquid-l1") w.hyperliquidL1 += volBn;
        else if (chainSlug === "solana") w.solana += volBn;
        else if (chainSlug === "ethereum") w.ethereum += volBn;
        else if (chainSlug === "arbitrum") w.arbitrum += volBn;
        else w.others += volBn;
      }
    }

    const result: LiveChainWeek[] = Array.from(weeks.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, vol]) => ({ weekStart, ...vol }));

    return result;
  } catch (err) {
    console.error("[perpsLive] getPerpsChainVolumes error:", err);
    return null;
  }
}
