import etfJson from "@/data/etf-flows.json";

export type IssuerKey = "bhyp" | "thyp" | "hypg";

export const ISSUER_ORDER: IssuerKey[] = ["bhyp", "thyp", "hypg"];

export type Issuer = {
  key: IssuerKey;
  ticker: string;
  badge: string;
  name: string;
  fee: number;
  staking: boolean;
  launchDate: string;
};

export type DailyRow = { date: string } & Record<IssuerKey, number>;

export type EtfFile = {
  _meta: {
    unit: string;
    source: string;
    launchDate: string;
    updatedAt: string;
    note: string;
    howToUpdate: string;
    issuers: Issuer[];
  };
  daily: DailyRow[];
};

export function getEtfFile(): EtfFile {
  return etfJson as EtfFile;
}

export function rowTotal(r: DailyRow): number {
  return ISSUER_ORDER.reduce((s, k) => s + r[k], 0);
}

export type ComputedRow = DailyRow & { total: number };

/** Main view aggregator used by the ETF page. */
export function etfView() {
  const f = getEtfFile();
  const issuers = f._meta.issuers;

  // Running per-issuer cumulative — all issuers start at $0 (launch is in
  // the daily array, no historical anchor needed). HYPG starts trading
  // ~Jun 3 2026 so its early rows are 0.
  const cum: Record<IssuerKey, number> = { bhyp: 0, thyp: 0, hypg: 0 };

  const rows: ComputedRow[] = f.daily.map((r) => {
    for (const k of ISSUER_ORDER) cum[k] += r[k];
    return { ...r, total: rowTotal(r) };
  });

  const issuerCumulative: Record<IssuerKey, number> = { ...cum };
  const totalAumMm = ISSUER_ORDER.reduce((s, k) => s + issuerCumulative[k], 0);

  const latest = rows[rows.length - 1];

  // Current inflow streak: consecutive positive-total days from the end
  let streakDays = 0;
  let streakSumMm = 0;
  const streakDates: string[] = [];
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].total > 0.05) {
      streakDays++;
      streakSumMm += rows[i].total;
      streakDates.unshift(rows[i].date);
    } else break;
  }

  // Recent window for the daily table — show last 10 sessions
  const last10 = rows.slice(-10);
  const last10SumMm = last10.reduce((s, r) => s + r.total, 0);

  // Biggest single day so far (max total inflow)
  const biggestDay = rows.reduce(
    (a, b) => (b.total > a.total ? b : a),
    rows[0]
  );

  // Issuers with a positive flow on the latest reported day
  const latestContributors = issuers
    .filter((i) => latest[i.key] > 0.05)
    .map((i) => i.name);

  const daysSinceLaunch = Math.round(
    (Date.parse(latest.date) - Date.parse(f._meta.launchDate)) / 86400000
  );

  return {
    meta: f._meta,
    issuers,
    rows,
    last10,
    latest,
    issuerCumulative,
    totalAumMm,
    streakDays,
    streakSumMm,
    streakDates,
    last10SumMm,
    biggestDay,
    latestContributors,
    daysSinceLaunch,
  };
}

/** Per-issuer running cumulative — one point per daily row, anchored at $0 on
 *  the launch date. Feeds the Cumulative Stacked Area chart. */
export type IssuerCumulativeRow = { date: string } & Record<IssuerKey, number>;

export function cumulativeByIssuer(): IssuerCumulativeRow[] {
  const f = getEtfFile();
  const cum: Record<IssuerKey, number> = { bhyp: 0, thyp: 0, hypg: 0 };

  // Anchor row at launch date — all at $0
  const rows: IssuerCumulativeRow[] = [
    { date: f._meta.launchDate, bhyp: 0, thyp: 0, hypg: 0 },
  ];

  for (const r of f.daily) {
    for (const k of ISSUER_ORDER) cum[k] += r[k];
    rows.push({
      date: r.date,
      bhyp: Math.round(cum.bhyp * 10) / 10,
      thyp: Math.round(cum.thyp * 10) / 10,
      hypg: Math.round(cum.hypg * 10) / 10,
    });
  }

  return rows;
}

/** Weekly aggregated net flows. A week starts Monday and runs through Friday
 *  (US trading week). Used by the weekly bar chart on the ETF page. */
export type WeekPoint = {
  weekStart: string; // ISO date of the Monday of the week
  flowMm: number; // total net flow across all issuers
  bhyp: number;
  thyp: number;
  hypg: number;
};

function mondayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  date.setDate(date.getDate() + diff);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function weeklyFlows(): WeekPoint[] {
  const f = getEtfFile();
  const buckets = new Map<string, WeekPoint>();

  for (const r of f.daily) {
    const wk = mondayOf(r.date);
    const existing = buckets.get(wk);
    if (existing) {
      existing.bhyp += r.bhyp;
      existing.thyp += r.thyp;
      existing.hypg += r.hypg;
      existing.flowMm = existing.bhyp + existing.thyp + existing.hypg;
    } else {
      buckets.set(wk, {
        weekStart: wk,
        bhyp: r.bhyp,
        thyp: r.thyp,
        hypg: r.hypg,
        flowMm: r.bhyp + r.thyp + r.hypg,
      });
    }
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart)
  );
}
