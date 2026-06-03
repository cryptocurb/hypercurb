import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import NavTabs from "@/components/NavTabs";

export const metadata: Metadata = {
  title: "Hypercurb — the state of Hyperliquid, every week",
  description:
    "Weekly snapshot of Hyperliquid: HYPE price, ETF flows, perpetual volume, and onchain stats. Curated by @cryptocurb.",
  metadataBase: new URL("https://hypercurb.xyz"),
  openGraph: {
    title: "Hypercurb",
    description:
      "The state of Hyperliquid, every week — ETF flows, perp volume, HYPE stats.",
    url: "https://hypercurb.xyz",
    siteName: "Hypercurb",
  },
  twitter: {
    card: "summary_large_image",
    site: "@cryptocurb",
    creator: "@cryptocurb",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-7xl px-3 py-4 md:px-8 md:py-10">
          <div className="card-border p-4 md:p-10">
            <SiteHeader />
            <NavTabs />
            <main className="mt-8">{children}</main>
            <footer className="mt-12 border-t border-[var(--hl-border)] pt-6 text-center text-xs text-white/40 font-mono">
              built by{" "}
              <a
                href="https://x.com/cryptocurb"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--hl-aqua)] hover:underline"
              >
                @cryptocurb
              </a>{" "}
              · data: farside, defillama, coingecko
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
