import HyperLogo from "./HyperLogo";

/**
 * Shared header row for screenshot boards on Hypercurb. PFP + handle on the
 * left, the "Hyperliquid <Accent> Flows" tri-block title in the middle, and
 * the Hyperliquid logomark on the right.
 *
 * Pattern mirrors the Solana site's BoardHeader so screenshots feel like a
 * matched set when posted to x.com/cryptocurb.
 */
export default function BoardHeader({
  a,
  b,
  c,
  sub,
}: {
  /** First word — usually "Hyperliquid" (rendered with italic on "liquid"). */
  a: string;
  /** Middle accent word — e.g., "ETF". Rendered in aqua. */
  b: string;
  /** Tail word — e.g., "Flows". */
  c: string;
  /** Sub-headline under the title. */
  sub: string;
}) {
  // Split the first word into "Hyper" + "liquid" so we can italicize the tail
  // half the same way the site wordmark does. Falls back gracefully for other
  // strings (just one solid block).
  const lowerA = a.toLowerCase();
  const hasHyper = lowerA.startsWith("hyper");
  const head = hasHyper ? a.slice(0, 5) : a; // "Hyper"
  const tail = hasHyper ? a.slice(5) : ""; // "liquid"

  return (
    <div className="hl-bh">
      <div className="hl-bh-profile">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/giga12.png" alt="hypercurb" />
        <div className="hl-bh-handle">
          <span className="hl-bh-name">hypercurb</span>
          <span className="hl-bh-x">x.com/cryptocurb</span>
        </div>
      </div>
      <div className="hl-bh-title">
        <h1>
          <span className="hl-bh-foam">{head}</span>
          {tail ? <span className="hl-bh-italic">{tail}</span> : null}{" "}
          <span className="hl-bh-aqua">{b}</span>{" "}
          <span className="hl-bh-foam">{c}</span>
        </h1>
        <div className="hl-bh-sub">{sub}</div>
      </div>
      <div className="hl-bh-logo">
        <HyperLogo className="h-12 w-auto" color="#97FCE4" />
      </div>
    </div>
  );
}
