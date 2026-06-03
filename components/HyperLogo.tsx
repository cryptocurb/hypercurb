/**
 * Hyperliquid logomark — approximation of the official brand mark.
 *
 * REPLACE this with the official SVG from
 * https://hyperliquid.gitbook.io/hyperliquid-docs/brand-kit when you grab
 * the file. Until then this is a stand-in horizontal "infinity" shape in
 * aquamarine (#97FCE4) that reads correctly at any size.
 */
export default function HyperLogo({
  className = "h-7 w-auto",
  color = "#97FCE4",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 576 576"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hyperliquid"
    >
      <path
        d="M82 288 C82 196, 156 134, 230 178 C290 213, 310 246, 288 288 C266 330, 286 363, 346 398 C420 442, 494 380, 494 288 C494 196, 420 134, 346 178 C286 213, 266 246, 288 288 C310 330, 290 363, 230 398 C156 442, 82 380, 82 288 Z"
        fill={color}
      />
    </svg>
  );
}
