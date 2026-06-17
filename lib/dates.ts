// Shared date helpers used across pages and chart components.
// Import from here; do not copy-paste these into individual files.

export function parseLocal(d: string): Date {
  const [y, m, dd] = d.split("-").map(Number);
  return new Date(y, m - 1, dd);
}

export function longDate(d: string): string {
  return parseLocal(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function weekRangeLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const sM = start.toLocaleDateString("en-US", { month: "short" });
  const eM = end.toLocaleDateString("en-US", { month: "short" });
  return sM === eM
    ? `${start.getDate()}–${end.getDate()} ${eM}, ${end.getFullYear()}`
    : `${start.getDate()} ${sM} – ${end.getDate()} ${eM}, ${end.getFullYear()}`;
}

/** Returns the Monday (ISO date string) of the week containing the given Date. */
export function mondayOf(d: Date): string {
  const day = d.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}
