// TODO: perps-weekly.json and perps-leaderboard.json are candidates for
// deletion once lib/perpsLive.ts is wired in and the live API is available.
// perps-chains-weekly.json powers the stacked chart and chain snapshot until
// getPerpsChainVolumes() can replace it.
import weeklyJson from "@/data/perps-weekly.json";
import leaderboardJson from "@/data/perps-leaderboard.json";
import chainsWeeklyJson from "@/data/perps-chains-weekly.json";

// =========================================================================
// Weekly Hyperliquid L1 perp volume (single-series bar chart — legacy)
// =========================================================================

export type WeekVolPoint = {
  weekStart: string;
  volBn: number;
};

export type WeeklyFile = {
  _meta: {
    unit: string;
    source: string;
    updatedAt: string;
    note: string;
    howToUpdate: string;
  };
  weeks: WeekVolPoint[];
};

export function getWeeklyFile(): WeeklyFile {
  return weeklyJson as WeeklyFile;
}

export function weeklyVolume(): WeekVolPoint[] {
  return getWeeklyFile().weeks;
}

// =========================================================================
// Per-protocol leaderboard (bottom board — top perp DEX protocols)
// =========================================================================

export type Venue = {
  rank: number;
  name: string;
  chain: string;
  vol7dBn: number;
  vol30dBn: number;
  oiBn: number;
  isHyperliquid?: boolean;
};

export type LeaderboardFile = {
  _meta: {
    unit: string;
    source: string;
    snapshotDate: string;
    totalMarket30dBn: number;
    note: string;
  };
  venues: Venue[];
};

export function getLeaderboardFile(): LeaderboardFile {
  return leaderboardJson as LeaderboardFile;
}

export type ComputedVenue = Venue & { share30d: number };

// =========================================================================
// Stacked weekly perp volume by chain (the source of truth for both the top
// snapshot board AND the middle stacked chart). Each row is a Mon-Sun week.
// =========================================================================

export type StackWeekRaw = {
  weekStart: string;
  hyperliquidL1: number;
  solana: number;
  ethereum: number;
  edgexL1: number;
  arbitrum: number;
  others: number;
};

export type StackSegment = {
  slug: string;
  name: string;
  color: string;
  vol: number;
};

export type StackWeek = {
  weekStart: string;
  total: number;
  segments: StackSegment[];
};

export type ChainDef = {
  slug: string;
  name: string;
  color: string;
};

export type ChainsWeeklyFile = {
  _meta: {
    unit: string;
    source: string;
    snapshotDate: string;
    topChains: string[];
    note: string;
    currentInProgressWeek?: string;
  };
  weeks: StackWeekRaw[];
};

export function getChainsWeeklyFile(): ChainsWeeklyFile {
  return chainsWeeklyJson as ChainsWeeklyFile;
}

/** Static metadata for the 5 named chains in the stacked-weekly file. */
const TOP_CHAINS: Array<ChainDef & { key: keyof Omit<StackWeekRaw, "weekStart"> }> = [
  { slug: "hyperliquid-l1", name: "Hyperliquid L1", color: "#97FCE4", key: "hyperliquidL1" },
  { slug: "solana",         name: "Solana",         color: "#14F195", key: "solana" },
  { slug: "ethereum",       name: "Ethereum",       color: "#627EEA", key: "ethereum" },
  { slug: "edgex-l1",       name: "edgeX L1",       color: "#B695FF", key: "edgexL1" },
  { slug: "arbitrum",       name: "Arbitrum",       color: "#28A0F0", key: "arbitrum" },
];
const OTHERS_DEF: ChainDef = { slug: "others", name: "Others", color: "#5a5a72" };

// ------- "Latest completed week" — Mon-Sun week ending before today ------

function isWeekCompleted(weekStartISO: string, now: Date = new Date()): boolean {
  const [y, m, d] = weekStartISO.split("-").map(Number);
  const weekStart = new Date(y, m - 1, d);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return now > weekEnd;
}

/** Index of the most recent completed week in the chains-weekly file, or -1. */
function latestCompletedWeekIndex(now: Date = new Date()): number {
  const weeks = getChainsWeeklyFile().weeks;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (isWeekCompleted(weeks[i].weekStart, now)) return i;
  }
  return -1;
}

// ------------ Build the StackWeek series (middle stacked chart) -----------

export function stackedWeeklyByChain(opts: { completedOnly?: boolean } = {}): {
  stack: StackWeek[];
  topChains: ChainDef[];
  othersDef: ChainDef;
} {
  const file = getChainsWeeklyFile();
  const all: StackWeek[] = file.weeks.map((w) => {
    const segments: StackSegment[] = [
      { slug: "hyperliquid-l1", name: "Hyperliquid L1", color: "#97FCE4", vol: w.hyperliquidL1 },
      { slug: "solana",         name: "Solana",         color: "#14F195", vol: w.solana },
      { slug: "ethereum",       name: "Ethereum",       color: "#627EEA", vol: w.ethereum },
      { slug: "edgex-l1",       name: "edgeX L1",       color: "#B695FF", vol: w.edgexL1 },
      { slug: "arbitrum",       name: "Arbitrum",       color: "#28A0F0", vol: w.arbitrum },
      { ...OTHERS_DEF, vol: w.others },
    ];
    const total = segments.reduce((s, x) => s + x.vol, 0);
    return { weekStart: w.weekStart, total, segments };
  });
  const stack = opts.completedOnly
    ? all.filter((w) => isWeekCompleted(w.weekStart))
    : all;
  return {
    stack,
    topChains: TOP_CHAINS.map(({ slug, name, color }) => ({ slug, name, color })),
    othersDef: OTHERS_DEF,
  };
}

// -------- Chain ranked snapshot for the TOP board (latest completed) -----

export type ChainSnapshotRow = ChainDef & {
  vol7dBn: number;
  vol30dBn: number;
};

export function chainSnapshot(): {
  weekStart: string | null;
  rows: ChainSnapshotRow[];
  totalsAllChainsBn: number;
} {
  const file = getChainsWeeklyFile();
  const idx = latestCompletedWeekIndex();
  if (idx < 0) {
    return { weekStart: null, rows: [], totalsAllChainsBn: 0 };
  }
  const w = file.weeks[idx];
  const last4 = file.weeks.slice(Math.max(0, idx - 3), idx + 1);

  const rows: ChainSnapshotRow[] = TOP_CHAINS.map((c) => {
    const v7 = w[c.key];
    const v30 = last4.reduce((s, ww) => s + (ww[c.key] as number), 0);
    return {
      slug: c.slug,
      name: c.name,
      color: c.color,
      vol7dBn: v7,
      vol30dBn: v30,
    };
  }).sort((a, b) => b.vol7dBn - a.vol7dBn);

  const othersBn = w.others;
  const totalsAllChainsBn =
    rows.reduce((s, r) => s + r.vol7dBn, 0) + othersBn;

  return { weekStart: w.weekStart, rows, totalsAllChainsBn };
}

// =========================================================================
// Main aggregator used by app/perps/page.tsx and app/page.tsx
// =========================================================================

export function perpsView() {
  // ---- protocol leaderboard (unchanged) ----
  const lb = getLeaderboardFile();
  const total30d = lb._meta.totalMarket30dBn;
  const venues: ComputedVenue[] = lb.venues.map((vv) => ({
    ...vv,
    share30d: total30d > 0 ? (vv.vol30dBn / total30d) * 100 : 0,
  }));
  const hl = venues.find((vv) => vv.isHyperliquid);
  const totalTop = venues.reduce((s, vv) => s + vv.vol30dBn, 0);
  const othersBn = Math.max(0, total30d - totalTop);

  // ---- chain snapshot (top board) ----
  const snap = chainSnapshot();
  const hlChain = snap.rows.find((r) => r.slug === "hyperliquid-l1") ?? null;
  const runnerChain = snap.rows.find((r) => r.slug !== "hyperliquid-l1") ?? null;
  const hlRank = hlChain
    ? snap.rows.findIndex((r) => r.slug === "hyperliquid-l1") + 1
    : 0;
  const leadXChain =
    hlChain && runnerChain && runnerChain.vol7dBn > 0
      ? hlChain.vol7dBn / runnerChain.vol7dBn
      : 0;
  const chainShare =
    snap.totalsAllChainsBn > 0 && hlChain
      ? (hlChain.vol7dBn / snap.totalsAllChainsBn) * 100
      : 0;

  // ---- WoW for HL chain (compare last completed week vs the one before) ----
  const allWeeks = getChainsWeeklyFile().weeks;
  const idx = (() => {
    for (let i = allWeeks.length - 1; i >= 0; i--) {
      if (isWeekCompleted(allWeeks[i].weekStart)) return i;
    }
    return -1;
  })();
  const latestRaw = idx >= 0 ? allWeeks[idx] : null;
  const prevRaw = idx >= 1 ? allWeeks[idx - 1] : null;
  const wowPct =
    latestRaw && prevRaw && prevRaw.hyperliquidL1 > 0
      ? ((latestRaw.hyperliquidL1 - prevRaw.hyperliquidL1) /
          prevRaw.hyperliquidL1) *
        100
      : 0;

  // ---- stacked weekly (middle board) ----
  const { stack, topChains, othersDef } = stackedWeeklyByChain({
    completedOnly: true,
  });

  return {
    leaderboardMeta: lb._meta,
    stackedMeta: getChainsWeeklyFile()._meta,

    // chain snapshot
    snapshotWeekStart: snap.weekStart,
    chainRows: snap.rows,
    hlChain,
    runnerChain,
    hlRank,
    leadXChain,
    chainShare,
    chainTotals7dBn: snap.totalsAllChainsBn,

    // stacked weekly
    stack,
    topChains,
    othersDef,

    // hl trend
    wowPct,

    // protocol leaderboard
    venues,
    hl,
    othersBn,
    total30dBn: total30d,
  };
}
