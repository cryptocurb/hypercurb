# Hypercurb

The state of Hyperliquid, every week. Companion site to [curbyoursol.xyz](https://curbyoursol.xyz).

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind · Recharts · Lucide icons. Same stack as curbyoursol so we can share patterns across both sites.

## Local dev

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Pages (current)

- **`/`** — Landing. Live HYPE/USD price hero + daily candle TradingView chart + 3-tile hub.
- **`/etf`** — HYPE ETF flows (BHYP + THYP). _Milestone 2 — coming next._
- **`/perps`** — Weekly perp volume + open interest by chain. _Milestone 3._
- **`/stats`** — Hyperliquid stats. _Milestone 4 — TBD scope._

## Brand palette

Per the official Hyperliquid brand kit:

| | Hex | Use |
|---|---|---|
| Aquamarine | `#97FCE4` | Primary accent |
| Firefly | `#0F3933` | Dark teal |
| Ebony | `#04060C` | Near black (bg) |
| Foam | `#f5fefd` | Light text |

Tailwind classes: `bg-hl-ebony`, `text-hl-aqua`, `border-hl-firefly`, `bg-hl-foam`.

## Replace the placeholder Hyperliquid logo

`components/HyperLogo.tsx` ships with a hand-rolled SVG approximation in aquamarine. Replace it with the official mark from <https://hyperliquid.gitbook.io/hyperliquid-docs/brand-kit> when you have a moment — drop the official SVG into the component's `<path d="…">` and you're done.

## Deploy

1. Push to a new GitHub repo: `cryptocurb/hypercurb`
2. Create a new Vercel project pointing at it (Vercel will auto-detect Next.js)
3. Add the custom domain `hypercurb.xyz` in Vercel → Domains (see README → "Domain setup" below)

## Domain setup — recap of how we did curbyoursol.xyz

Easiest path (the same pattern we used for curbyoursol.xyz):

1. **Buy the domain through Vercel directly.** In your Vercel dashboard → top-right "Buy Domain" → search `hypercurb.xyz`. Vercel handles registration and auto-wires DNS, so you don't have to mess with nameservers. Costs ~$10/year for `.xyz`.
2. **Or buy externally and point DNS to Vercel.** If you go through Namecheap / GoDaddy / etc., add these records:
   - `A` record on `@` → `76.76.21.21`
   - `CNAME` record on `www` → `cname.vercel-dns.com`
   - Then in Vercel → Project → Settings → Domains → Add → enter `hypercurb.xyz`.

The Vercel-direct route is what we did for curbyoursol.xyz. Frictionless. Recommended unless you specifically want the domain at another registrar.

## ETF auto-update

Once Milestone 2 lands, the same scheduled-task pattern we use for Solana ETF flows will be wired up here, pointing at Farside HYP (<https://farside.co.uk/hyp/>) instead of SolanaFloor. Daily 1am Central run + 9am Central safety-net retry.
